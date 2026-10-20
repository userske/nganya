-- Coastal Nganya Awards Database Migration
-- Complete Schema with strict constraints, RLS policies, and atomic RPC functions

-- 1. Helper function to check admin/staff role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('staff', 'admin')
  );
$$;

-- 2. Event Settings
CREATE TABLE IF NOT EXISTS event_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  event_name text NOT NULL DEFAULT 'Coastal Nganya Awards',
  tagline text DEFAULT 'Celebrating the heartbeat of Mombasa''s roads',
  event_date text DEFAULT '2025-12-06',
  event_time text DEFAULT '18:00',
  venue_name text DEFAULT 'Mombasa Cement, Mombasa',
  venue_map_url text,
  hero_image_url text DEFAULT '/hero-bg.jpg',
  about_html text,
  social_links jsonb DEFAULT '{}'::jsonb,
  voting_opens_at timestamptz,
  voting_closes_at timestamptz,
  results_frozen boolean DEFAULT false,
  ticket_sales_open boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Insert default single row
INSERT INTO event_settings (id, event_name, venue_name, event_date, event_time)
VALUES (1, 'Coastal Nganya Awards', 'Mombasa Cement, Mombasa', '2025-12-06', '18:00')
ON CONFLICT (id) DO NOTHING;

-- 3. Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'voter' CHECK (role IN ('voter', 'staff', 'admin')),
  email_normalized text NOT NULL UNIQUE,
  blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger to create profile upon new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email_normalized, role)
  VALUES (
    NEW.id,
    lower(trim(NEW.email)),
    'voter'
  )
  ON CONFLICT (id) DO UPDATE
  SET email_normalized = EXCLUDED.email_normalized;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  group_name text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Nominees (Composite unique on id + category_id for foreign key guarantee)
CREATE TABLE IF NOT EXISTS nominees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  subtitle text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_nominee_category UNIQUE (id, category_id),
  CONSTRAINT uq_nominee_name_per_category UNIQUE (category_id, name)
);

-- 6. Votes Table (Direct browser writes denied; atomic through cast_vote RPC)
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nominee_id uuid NOT NULL,
  ip_hash text,
  user_agent text,
  voided boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Composite FK ensures nominee belongs strictly to the category being voted on
  CONSTRAINT fk_vote_nominee_category FOREIGN KEY (nominee_id, category_id)
    REFERENCES nominees(id, category_id) ON DELETE CASCADE,
  -- One voter = one vote per category
  CONSTRAINT uq_voter_category UNIQUE (voter_id, category_id)
);

-- 7. Realtime Vote Counts Aggregate
CREATE TABLE IF NOT EXISTS vote_counts (
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nominee_id uuid NOT NULL REFERENCES nominees(id) ON DELETE CASCADE,
  count bigint NOT NULL DEFAULT 0 CHECK (count >= 0),
  PRIMARY KEY (category_id, nominee_id)
);

-- 8. Ticket Tiers
CREATE TABLE IF NOT EXISTS ticket_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_kes numeric(10, 2) NOT NULL CHECK (price_kes >= 0),
  capacity int NOT NULL CHECK (capacity >= 0),
  sold_count int NOT NULL DEFAULT 0 CHECK (sold_count <= capacity),
  reserved_count int NOT NULL DEFAULT 0,
  per_order_max int NOT NULL DEFAULT 10,
  sale_start_at timestamptz,
  sale_end_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  perks jsonb DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 9. Orders (Guest Checkout)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  tier_id uuid NOT NULL REFERENCES ticket_tiers(id),
  quantity int NOT NULL CHECK (quantity > 0),
  total_amount_kes numeric(10, 2) NOT NULL CHECK (total_amount_kes >= 0),
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_email_normalized text NOT NULL,
  buyer_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'refunded', 'expired')),
  reservation_expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'paystack',
  reference text NOT NULL UNIQUE,
  paystack_transaction_id text,
  amount_kes numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'KES',
  status text NOT NULL DEFAULT 'pending',
  channel text,
  raw_response jsonb,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 11. Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_code text NOT NULL UNIQUE,
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tier_id uuid NOT NULL REFERENCES ticket_tiers(id),
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_phone text NOT NULL,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'void')),
  qr_payload text NOT NULL,
  checked_in_at timestamptz,
  checked_in_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- 12. Checkins
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  staff_id uuid NOT NULL REFERENCES auth.users(id),
  scanned_at timestamptz DEFAULT now(),
  is_successful boolean NOT NULL,
  failure_reason text
);

-- 13. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

--------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------

ALTER TABLE event_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- event_settings: Anyone can read, only admin can update
CREATE POLICY "Public read event settings" ON event_settings FOR SELECT USING (true);
CREATE POLICY "Admin update event settings" ON event_settings FOR UPDATE USING (is_admin());

-- profiles: Users read their own profile, admin reads all
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins read all profiles" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "Admins update profiles" ON profiles FOR UPDATE USING (is_admin());

-- categories: Public reads active categories, admin reads/writes all
CREATE POLICY "Public read active categories" ON categories FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (is_admin());

-- nominees: Public reads active nominees, admin reads/writes all
CREATE POLICY "Public read active nominees" ON nominees FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admin manage nominees" ON nominees FOR ALL USING (is_admin());

-- votes:
-- 1. Browser CANNOT insert, update, or delete directly (only SECURITY DEFINER function cast_vote)
-- 2. Voter can ONLY select their own votes to see who they voted for
-- 3. Admin can read all votes
CREATE POLICY "Voters read own votes" ON votes FOR SELECT USING (auth.uid() = voter_id);
CREATE POLICY "Admin read all votes" ON votes FOR SELECT USING (is_admin());

-- vote_counts: Public read-only for realtime leaderboard
CREATE POLICY "Public read vote counts" ON vote_counts FOR SELECT USING (true);

-- ticket_tiers: Public reads active tiers, admin manages
CREATE POLICY "Public read active tiers" ON ticket_tiers FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Admin manage tiers" ON ticket_tiers FOR ALL USING (is_admin());

-- orders: Service role and admin can manage, buyers can select by matching session or email verification
CREATE POLICY "Admin read all orders" ON orders FOR SELECT USING (is_admin());

-- tickets: Buyers can read valid tickets by code/lookup, admin/staff can read and update
CREATE POLICY "Public read ticket by code" ON tickets FOR SELECT USING (true);
CREATE POLICY "Staff manage tickets" ON tickets FOR ALL USING (is_staff_or_admin());

-- checkins: Staff can read and write checkins
CREATE POLICY "Staff manage checkins" ON checkins FOR ALL USING (is_staff_or_admin());

-- audit_log: Admin reads audit log
CREATE POLICY "Admin read audit log" ON audit_log FOR SELECT USING (is_admin());

--------------------------------------------------------------------------------
-- RPC FUNCTIONS
--------------------------------------------------------------------------------

-- cast_vote: Core voting transaction function
CREATE OR REPLACE FUNCTION cast_vote(
  p_category_id uuid,
  p_nominee_id uuid,
  p_ip_hash text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_voter_id uuid := auth.uid();
  v_settings record;
  v_category record;
  v_nominee record;
  v_voter_profile record;
  v_existing_vote record;
BEGIN
  -- 1. Auth check
  IF v_voter_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED: You must verify your email before voting';
  END IF;

  -- 2. Check if user is blocked
  SELECT * INTO v_voter_profile FROM profiles WHERE id = v_voter_id;
  IF v_voter_profile.blocked THEN
    RAISE EXCEPTION 'ACCOUNT_BLOCKED: This voter account has been flagged';
  END IF;

  -- 3. Check voting window & frozen results
  SELECT * INTO v_settings FROM event_settings WHERE id = 1;
  IF v_settings.results_frozen THEN
    RAISE EXCEPTION 'VOTING_FROZEN: Voting results are currently locked';
  END IF;

  IF v_settings.voting_opens_at IS NOT NULL AND now() < v_settings.voting_opens_at THEN
    RAISE EXCEPTION 'VOTING_NOT_OPEN: Voting has not opened yet';
  END IF;

  IF v_settings.voting_closes_at IS NOT NULL AND now() > v_settings.voting_closes_at THEN
    RAISE EXCEPTION 'VOTING_CLOSED: Voting has closed for this event';
  END IF;

  -- 4. Check category is active
  SELECT * INTO v_category FROM categories WHERE id = p_category_id;
  IF v_category IS NULL OR NOT v_category.is_active THEN
    RAISE EXCEPTION 'CATEGORY_INACTIVE: This category is not active for voting';
  END IF;

  -- 5. Check nominee belongs to this category and is active
  SELECT * INTO v_nominee FROM nominees
  WHERE id = p_nominee_id AND category_id = p_category_id;
  IF v_nominee IS NULL OR NOT v_nominee.is_active THEN
    RAISE EXCEPTION 'NOMINEE_INVALID: Nominee not found in this category';
  END IF;

  -- 6. Insert vote (relying on UNIQUE(voter_id, category_id) for race conditions)
  BEGIN
    INSERT INTO votes (
      voter_id,
      category_id,
      nominee_id,
      ip_hash,
      user_agent
    ) VALUES (
      v_voter_id,
      p_category_id,
      p_nominee_id,
      p_ip_hash,
      p_user_agent
    );
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'ALREADY_VOTED: You have already cast a vote in this category';
  END;

  -- 7. Atomically increment vote_counts
  INSERT INTO vote_counts (category_id, nominee_id, count)
  VALUES (p_category_id, p_nominee_id, 1)
  ON CONFLICT (category_id, nominee_id)
  DO UPDATE SET count = vote_counts.count + 1;

  RETURN jsonb_build_object(
    'success', true,
    'category_id', p_category_id,
    'nominee_id', p_nominee_id,
    'nominee_name', v_nominee.name
  );
END;
$$;

-- my_votes: Fetch votes for the logged-in voter
CREATE OR REPLACE FUNCTION my_votes()
RETURNS TABLE (
  category_id uuid,
  nominee_id uuid,
  nominee_name text,
  voted_at timestamptz
) LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.category_id,
    v.nominee_id,
    n.name AS nominee_name,
    v.created_at AS voted_at
  FROM votes v
  JOIN nominees n ON n.id = v.nominee_id
  WHERE v.voter_id = auth.uid()
    AND v.voided = false;
END;
$$;

-- reserve_tickets: Atomic reservation for ticket checkout
CREATE OR REPLACE FUNCTION reserve_tickets(
  p_tier_id uuid,
  p_quantity int,
  p_buyer_name text,
  p_buyer_email text,
  p_buyer_phone text
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_tier record;
  v_order_id uuid;
  v_order_number text;
  v_total numeric(10, 2);
  v_expiry timestamptz := now() + interval '10 minutes';
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'INVALID_QUANTITY: Quantity must be at least 1';
  END IF;

  -- Lock tier row for update
  SELECT * INTO v_tier FROM ticket_tiers WHERE id = p_tier_id FOR UPDATE;
  IF v_tier IS NULL OR NOT v_tier.is_active THEN
    RAISE EXCEPTION 'TIER_UNAVAILABLE: This ticket tier is no longer available';
  END IF;

  IF p_quantity > v_tier.per_order_max THEN
    RAISE EXCEPTION 'EXCEEDS_ORDER_LIMIT: Maximum % tickets per order', v_tier.per_order_max;
  END IF;

  -- Clean expired reservations on this tier first
  UPDATE ticket_tiers
  SET reserved_count = GREATEST(0, reserved_count - coalesce(sub.expired_qty, 0))
  FROM (
    SELECT sum(quantity) as expired_qty
    FROM orders
    WHERE tier_id = p_tier_id
      AND status = 'pending'
      AND reservation_expires_at < now()
  ) sub
  WHERE id = p_tier_id;

  UPDATE orders
  SET status = 'expired'
  WHERE tier_id = p_tier_id
    AND status = 'pending'
    AND reservation_expires_at < now();

  -- Re-check capacity
  IF (v_tier.sold_count + v_tier.reserved_count + p_quantity) > v_tier.capacity THEN
    RAISE EXCEPTION 'CAPACITY_REACHED: Not enough tickets available in this tier';
  END IF;

  v_total := v_tier.price_kes * p_quantity;
  v_order_number := 'CNA-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  -- Insert order
  INSERT INTO orders (
    order_number,
    tier_id,
    quantity,
    total_amount_kes,
    buyer_name,
    buyer_email,
    buyer_email_normalized,
    buyer_phone,
    status,
    reservation_expires_at
  ) VALUES (
    v_order_number,
    p_tier_id,
    p_quantity,
    v_total,
    p_buyer_name,
    p_buyer_email,
    lower(trim(p_buyer_email)),
    p_buyer_phone,
    'pending',
    v_expiry
  ) RETURNING id INTO v_order_id;

  -- Increment reserved count
  UPDATE ticket_tiers
  SET reserved_count = reserved_count + p_quantity
  WHERE id = p_tier_id;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'amount_kes', v_total,
    'expires_at', v_expiry
  );
END;
$$;

-- check_in_ticket: Atomic check-in at the door scanner
CREATE OR REPLACE FUNCTION check_in_ticket(
  p_ticket_code text
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_staff_id uuid := auth.uid();
  v_ticket record;
BEGIN
  IF NOT is_staff_or_admin() THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only staff or admins can check in tickets';
  END IF;

  -- Lock ticket row
  SELECT * INTO v_ticket FROM tickets WHERE ticket_code = p_ticket_code FOR UPDATE;
  
  IF v_ticket IS NULL THEN
    INSERT INTO checkins (ticket_id, staff_id, is_successful, failure_reason)
    VALUES (gen_random_uuid(), v_staff_id, false, 'TICKET_NOT_FOUND');
    RETURN jsonb_build_object('success', false, 'status', 'NOT_FOUND', 'message', 'Invalid Ticket Code');
  END IF;

  IF v_ticket.status = 'void' THEN
    INSERT INTO checkins (ticket_id, staff_id, is_successful, failure_reason)
    VALUES (v_ticket.id, v_staff_id, false, 'TICKET_VOIDED');
    RETURN jsonb_build_object('success', false, 'status', 'VOID', 'message', 'This ticket has been cancelled or refunded');
  END IF;

  IF v_ticket.status = 'used' OR v_ticket.checked_in_at IS NOT NULL THEN
    INSERT INTO checkins (ticket_id, staff_id, is_successful, failure_reason)
    VALUES (v_ticket.id, v_staff_id, false, 'ALREADY_USED');
    RETURN jsonb_build_object(
      'success', false,
      'status', 'ALREADY_USED',
      'message', 'Ticket was already scanned at ' || to_char(v_ticket.checked_in_at, 'HH12:MI AM')
    );
  END IF;

  -- Mark as checked in
  UPDATE tickets
  SET
    status = 'used',
    checked_in_at = now(),
    checked_in_by = v_staff_id
  WHERE id = v_ticket.id;

  INSERT INTO checkins (ticket_id, staff_id, is_successful)
  VALUES (v_ticket.id, v_staff_id, true);

  RETURN jsonb_build_object(
    'success', true,
    'status', 'VALID',
    'buyer_name', v_ticket.buyer_name,
    'checked_in_at', now()
  );
END;
$$;

-- Add vote_counts to supabase_realtime publication
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE vote_counts;
  END IF;
EXCEPTION WHEN duplicate_object THEN
  -- table already in publication
  NULL;
END;
$$;
