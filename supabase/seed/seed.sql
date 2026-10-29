-- Auto-generated SQL seed for Coastal Nganya Awards
-- Generated from categories_seed.json (61 categories)

INSERT INTO event_settings (id, event_name, venue_name, event_date, event_time, tagline)
VALUES (1, 'Coastal Nganya Awards', 'Mamba Village, Mombasa', '2026-12-06', '14:00', 'Celebrating the heartbeat of Mombasa''s roads')
ON CONFLICT (id) DO UPDATE SET
  event_name = EXCLUDED.event_name,
  venue_name = EXCLUDED.venue_name;

-- Seed Default Ticket Tiers
INSERT INTO ticket_tiers (name, description, price_kes, capacity, perks, sort_order, is_active)
VALUES (
  'Early Bird Regular',
  'Standard event admission with main acoustic arena access.',
  500,
  500,
  '["Event Entry","Standard Seating","Live Sound Access"]'::jsonb,
  1,
  true
) ON CONFLICT DO NOTHING;
INSERT INTO ticket_tiers (name, description, price_kes, capacity, perks, sort_order, is_active)
VALUES (
  'VIP Lounge Pass',
  'Priority entrance, VIP lounge seating & complimentary drink.',
  3500,
  150,
  '["VIP Red Carpet Entry","Front Stage Access","Complimentary Drink Voucher","Official Event Badge"]'::jsonb,
  2,
  true
) ON CONFLICT DO NOTHING;
INSERT INTO ticket_tiers (name, description, price_kes, capacity, perks, sort_order, is_active)
VALUES (
  'VVIP Table of 5',
  'Reserved high-profile table for 5 with bottle service & parking pass.',
  30000,
  30,
  '["Reserved Table of 5","Dedicated Host Service","Full Bottle Service & Platter","Backstage & VIP Parking Passes"]'::jsonb,
  3,
  true
) ON CONFLICT DO NOTHING;


-- Category: Sound Beast
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('sound-beast', 'Sound Beast', 'Business & Services', 1, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Band 4 band', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jaguar paw', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Riot', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Goon', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Oblock', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mc queen', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Blue lock', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Darling', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Posh', 'KBP', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Eleven', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Cashflow', 'kbj', 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mikindani 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mikindani-1', 'Mikindani 1', 'Nganya – Mikindani', 2, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Blue lock', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'high stakes', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'moneybag yo', 'kdt', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'la flame', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'notorious', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Eminem', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rebel', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, '2pac', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'fubu', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Magongo 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('magongo-1', 'Magongo 1', 'Special Awards', 3, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Prolific', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Eleven', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Supremacy', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Je taime', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Havoc', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Da junior', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Countryman', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Latto', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bronxx', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'nwa', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Private (Mombasa 1)
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('private-mombasa-1', 'Private (Mombasa 1)', 'Nganya – Mombasa 1', 4, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chinchilla', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Centurion', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Frosty', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Venom', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rage head', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Nganya Mombasa
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-nganya-mombasa', 'Best Nganya Mombasa', 'Special Awards', 5, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Legacy', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sponge bob', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Budapest', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Legend', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Focus', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Blacklist', 'kdz', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kanyoni', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Smooth', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Garage
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-garage', 'Best Garage', 'Business & Services', 6, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Gemz Creation', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Faraj graffix', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bululizo', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mama rich gang', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Made in my garage', 'khood', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'sirio’s garage', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'abdul’s garage', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'abbas garage', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mtwapa 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mtwapa-1', 'Mtwapa 1', 'Special Awards', 7, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Versace', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Celtics', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Darling', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dose', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Posh', 'KBR', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bad nation', 'KBF', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Revolution', 'KBH', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Khood', 'KCD', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ride', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jerusalem', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Therapy', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Makaveli', NULL, 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Loyal', 'kbv', 13, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Kisauni 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('kisauni-1', 'Kisauni 1', 'Nganya – Kisauni', 8, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kings', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'McQueen', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Paperlife', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Madtown', 'batman', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Buruklyn boyz', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'weezy', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jazie uno', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Cashflow', 'kbj 288q', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Thunder', 'kbk', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jaguar paw', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Khaled', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Whitesox', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Creek', 'kaw', 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Brick pan brick', NULL, 13, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'F1', NULL, 14, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mtambo 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mtambo-1', 'Mtambo 1', 'Special Awards', 9, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Khood', 'kbc', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Weezy', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rocafella', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Yo gotti', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ace', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Nirvana', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Luffy', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chicago bulls', 'kbh', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hotchase', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Milano', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Remmy', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'tunechi', NULL, 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Nyali 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('nyali-1', 'Nyali 1', 'Special Awards', 10, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'gunna', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'hyper', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'redeemer', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'lilbaby', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'dollar dream', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Black muslim', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Iconic Drivers
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('iconic-drivers', 'Iconic Drivers', 'Drivers & Conductors', 11, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bebesha', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Namba nane', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Swabri king', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dulla Chizi', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Arbab', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Matonya', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Babu Mbuta', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bokoboko', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bangombe', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ngwedu', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chimera', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bagira', NULL, 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Tudor 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('tudor-1', 'Tudor 1', 'Special Awards', 12, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Posh', 'KBP', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rio', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bigdaddy', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Lilbaby', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Migos', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'El classico', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Che Guevara', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Riot', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rust', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Nightmare', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Young money', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Jomvu 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('jomvu-1', 'Jomvu 1', 'Nganya – Jomvu', 13, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, '3t', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Compton', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Guap', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Buggs bunny', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Migadini 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('migadini-1', 'Migadini 1', 'Special Awards', 14, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Madtown', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Baby', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ottoman', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mshomoroni 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mshomoroni-1', 'Mshomoroni 1', 'Special Awards', 15, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Nizer', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mint', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Anko', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Lust', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Freaky', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Yaa yes', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Investor of the Year
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('investor-of-the-year', 'Investor of the Year', 'Special Awards', 16, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Posh family', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Herlifa family', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jazie family', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Cashflow family', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Creek family', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Khood family', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Nexus family', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Madtown family', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Che family', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Moneybagg yo family', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Almar family', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Legend Company
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('legend-company', 'Legend Company', 'Special Awards', 17, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rick ross family', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Khaled family', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rust family', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rocafella family', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'K hood family', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Nexus family', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Orlando magic family', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'X large family', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Miritini 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('miritini-1', 'Miritini 1', 'Special Awards', 18, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Goon', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Call of duty', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Offset', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'The kings', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Guap', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Weezy', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Richgang', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'panastar', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'liquid', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Maintained
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-maintained', 'Best Maintained', 'Special Awards', 19, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Loyal', 'tudor', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Je taime', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rickross', 'kisauni', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'T.i (white)', 'mtwapa', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jaguar paw', 'kisauni', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Orlando magic', 'tudor', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bululizo', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Band 4 band', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Fugeez', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'notorious', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mr cheeks', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Blogger of the Year
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('blogger-of-the-year', 'Blogger of the Year', 'Special Awards', 20, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Thee culture', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Thriller', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Abawa', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mauzoo', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Klin', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Topspotter', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mtwapa toys', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Tuluahmad', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Airbrush Artists
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('airbrush-artists', 'Airbrush Artists', 'Business & Services', 21, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'zeddy dize', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'wizard customs ke', 'iantoholic', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'kush', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'shakes', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'tizo', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'slick', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dannie', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'raj', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chinno', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Lighthouse Installer
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('lighthouse-installer', 'Lighthouse Installer', 'Special Awards', 22, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Daylight auto décor', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ngugi', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rashid lights', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ngare', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Raphael', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mutua', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Marto', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Sticker Works
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('sticker-works', 'Sticker Works', 'Special Awards', 23, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'most wanted', 'mjiji', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'stickerhub', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'marcelo', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'azzo', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'mboga saba', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'ampedy', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'kim', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Auto Shop
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-auto-shop', 'Best Auto Shop', 'Special Awards', 24, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'abbas car décor', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'fahmy', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Sacco
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-sacco', 'Best Sacco', 'Business & Services', 25, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Xperia sacco', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mom sacco', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Tlb sacco', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Geno sacco', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Tatama sacco', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Safari sacco', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Interior Design
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-interior-design', 'Best Interior Design', 'Special Awards', 26, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Madevu', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hussein', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Simon', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Muiruri', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'kudura', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Sound Installer
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-sound-installer', 'Best Sound Installer', 'Business & Services', 27, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Marto', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hussein', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Simon', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dolby trm', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Salim', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Traffic
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-traffic', 'Best Traffic', 'Special Awards', 28, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'kinywa', 'makupa', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'said', 'bamburi', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'masoud', 'nyali', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'mercy', 'central', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jose', 'bamburi', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'omosh', 'central', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Daudi', 'central', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rhama', 'central', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Toli', 'makupa', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Halima', 'makupa', 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Driver Mtwapa
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-driver-mtwapa', 'Best Driver Mtwapa', 'Drivers & Conductors', 29, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Babu mbuta', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Namba nane', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jack', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sabri king', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Korir', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Njoro', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Moddy', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Zackariyah', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Musa', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'spoiler', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Baby driver', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mtambo Best Driver
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mtambo-best-driver', 'Mtambo Best Driver', 'Drivers & Conductors', 30, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Daddy', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Moddy', 'Alcatraz', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hemedy', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kichwa', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sammy kanga', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mike mbosso', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Edu', 'khood', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Farouq', 'remmy', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Daddy mauzoo', 'remmy', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Francis', 'roca fela', 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Kisauni Best Driver
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('kisauni-best-driver', 'Kisauni Best Driver', 'Nganya – Kisauni', 31, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Abu hafswa', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Babu mapengo', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Poloranks', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Deno', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jitoto', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Abu ali', 'madtown', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Defao', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Matonya', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Roja', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Beka', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Moddy chonyi', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Aloha', NULL, 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Amiri', NULL, 13, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jabbal', NULL, 14, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Athuman', 'weezy', 15, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Tudor Best Driver
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('tudor-best-driver', 'Tudor Best Driver', 'Drivers & Conductors', 32, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Maulana', 'lilbaby', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mnoko', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Okwonkwo', 'riot', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mbwakni', 'el clasico', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Said', 'richgang', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Karisa', 'lilbaby', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mkare', 'bigdaddy', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mutanda', 'prolific', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bosco', 'zeus', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Swabiri', 'posh', 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mikindani Best Driver
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mikindani-best-driver', 'Mikindani Best Driver', 'Nganya – Mikindani', 33, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Junior', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mnyika', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Pato', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Lucky', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Monte', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Vinnie', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sakaja', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Buda monk', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Amani', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'raphael', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Magongo Best Driver
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('magongo-best-driver', 'Magongo Best Driver', 'Drivers & Conductors', 34, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Saido', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Harry', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bajira', 'eleven', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ali', 'rust', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bushman', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Randy', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Denno', 'latto', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sensei', 'prolific', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Junior', 'je taime', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Raphael jr', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mshomoroni Best Driver
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mshomoroni-best-driver', 'Mshomoroni Best Driver', 'Drivers & Conductors', 35, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mtuku', 'nizer', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Eduu', 'mint', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rama redwax', 'anko', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Pastor', 'lust', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kamwenga', 'nizee green', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jay', 'freaky', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chetu', 'yaa yes', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'George', 'freaky kbk', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Driver Jomvu
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-driver-jomvu', 'Best Driver Jomvu', 'Nganya – Jomvu', 36, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dawaa', 'liger', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dulla chugulu', 'daffy', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Adamu', 'host', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Yeyo', 'konde boy', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sammy', 'guap', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ali', 'Compton', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Saidi hogost', '3t', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bysaaa', 'bugz bunny', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hamso kanali', 'buggzbunny', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sammy', 'guap', 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Driver Miritini
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-driver-miritini', 'Best Driver Miritini', 'Drivers & Conductors', 37, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Athumani', 'the kings', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Juma', 'the kings', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kibarua', 'call of duty', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Songoni', 'liquid', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jay', 'the kings', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Obako', 'the kings', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Goon', 'junior mafia', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sammyro', 'panastar', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mabottle', 'rich gang', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mjaka', 'weezy', 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Conductor Kisauni
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-conductor-kisauni', 'Best Conductor Kisauni', 'Nganya – Kisauni', 38, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Arafat', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Saddam', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Seif', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Zuchu', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Abu macho', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Koko jr', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Prezzo', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ali rasta', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mea', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jay mapesa', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bwiza', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kulu', NULL, 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chilemba', NULL, 13, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Conductor Jomvu
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-conductor-jomvu', 'Best Conductor Jomvu', 'Nganya – Jomvu', 39, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Simo pummu', 'buggz bunny', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Faji', '2pac shakur', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Boyka', 'liger', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Osama', 'guap', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Alole', 'bugz bunny', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hassani', 'the lord is my shepherd', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bokanda', 'host', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Magongo Conductors
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('magongo-conductors', 'Magongo Conductors', 'Drivers & Conductors', 40, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kombo', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Haziz Jr', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kibwana', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Etoo', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kennedy', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jaylaw', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mikindani Best Conductor
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mikindani-best-conductor', 'Mikindani Best Conductor', 'Nganya – Mikindani', 41, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Otile', 'gta vice city', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Diza', 'highstake', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sammy', 'Eminem kav', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Aleh', 'moneybag', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hamso', 'Eminem kbz', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Simiu', 'moneybag kdt', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ali madebe', 'rebel', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ali', 'notorious', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sheba', '2pac', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jesus', 'fubu', 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Conductor Miritini
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-conductor-miritini', 'Best Conductor Miritini', 'Drivers & Conductors', 42, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dume', 'the kings', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ezekiel', 'call of duty', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Tr konde', 'the kings', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Samda', 'liquid', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mwalimu', 'the kings', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Wozza', 'weezy', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Simo', 'goon', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Balo', 'rich gang', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hamso panastar', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Conductor Mshomoroni
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-conductor-mshomoroni', 'Best Conductor Mshomoroni', 'Drivers & Conductors', 43, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Og', 'mint', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Pastor', 'tecno', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Lee', 'freaky kat', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mungai', 'freaky kbj', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kobole', 'yaa yes', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bruno', 'nizer green', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Spider', 'nizer red', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Conductor Tudor
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-conductor-tudor', 'Best Conductor Tudor', 'Drivers & Conductors', 44, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rama', 'bigdaddy', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'James', 'rio', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Said', 'riot', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sharro puff', 'posh', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hassani', 'el classico', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mossee', 'zeus', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mohaa', 'prolific', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mwana', 'lilbaby', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Lighthouse of the Year
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('lighthouse-of-the-year', 'Lighthouse of the Year', 'Special Awards', 45, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Madtown batman', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Posh kbq', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Brick pan brick', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kings', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Thunder', 'kbk', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Riot', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jazie uno', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Revolution', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Money long', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mc queen', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Paperlife', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Eleven', NULL, 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Cashflow', 'kbj', 13, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Nyali Best Conductor
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('nyali-best-conductor', 'Nyali Best Conductor', 'Drivers & Conductors', 46, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mzamo', 'king', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kitale', 'dollar dream', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Abdul', 'black muslims', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Gift', 'lilbaby', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kajiro', 'gunna', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bisaka', 'miami', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Makelele', 'redeemer', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Shaban', 'viron', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Madawa', 'blacklist', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Nyali Best Drivers
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('nyali-best-drivers', 'Nyali Best Drivers', 'Drivers & Conductors', 47, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rogers', 'kung', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bakari', 'dollar dream', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Majukumu', 'black muslim', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Hamso duba', 'lilbaby', 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kalameni', 'gunna', 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ruger', 'miami', 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Muda', 'redeemer', 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Titus', 'viron', 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mwakubia', 'blacklist', 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Petrol Station
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-petrol-station', 'Best Petrol Station', 'Special Awards', 48, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bamburi 1', 'issa', 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Reem', 'gas field', 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Nas gas', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Galana', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Carwash
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-carwash', 'Best Carwash', 'Special Awards', 49, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bululizo & parking', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Steji ya paka & parking', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chigunda''s car wash & parking', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Rubis & parking', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bamburi car wash', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Gems car wash & parking', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Operation Manager
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-operation-manager', 'Best Operation Manager', 'Special Awards', 50, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'shabal', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'swagger', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mwangala', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Boss shakir', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'jelani', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'bashir', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Route
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-route', 'Best Route', 'Special Awards', 51, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Tudor', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bamburi mtambo', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bamburi kisauni', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jomvu', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mikindani', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Magongo', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Miritini', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Nyali reef', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Migadini', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mshomoroni', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mtwapa', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bombolulu', NULL, 12, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kiembeni', NULL, 13, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Adventure Group Mombasa
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-adventure-group-mombasa', 'Best Adventure Group Mombasa', 'Special Awards', 52, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bean adventures', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'bronx safaris', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'avib adventures', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sunset cartels', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Kiembeni Driver
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('kiembeni-driver', 'Kiembeni Driver', 'Drivers & Conductors', 53, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mzee', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Alfan', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Waingo', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mwarabu', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bajey', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Abbah', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jimmy', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bhonge', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Shariffuh', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Segah', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Kiembeni Conductor
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('kiembeni-conductor', 'Kiembeni Conductor', 'Drivers & Conductors', 54, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kanairo', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Tolly', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'George', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jay', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Jomba', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Joseph', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Gilly', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Silvester', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Mwanjola', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Dogo', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Morgan', NULL, 11, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Mombasa 1 Matatu
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('mombasa-1-matatu', 'Mombasa 1 Matatu', 'Nganya – Mombasa 1', 55, false)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
END $$;

-- Category: Best Driver Mombasa
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-driver-mombasa', 'Best Driver Mombasa', 'Drivers & Conductors', 56, false)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
END $$;

-- Category: Best Conductor Mombasa
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-conductor-mombasa', 'Best Conductor Mombasa', 'Drivers & Conductors', 57, false)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
END $$;

-- Category: Best Private 14 Seater (Nairobi)
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-private-14-seater-nairobi', 'Best Private 14 Seater (Nairobi)', 'Special Awards', 58, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Stinger', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'spicy safaris', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'flight 13', 'the Comeback', 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'kimya kimya', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'first priority', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'kings', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'galactic', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'fbi', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'habibi', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'steps', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Driver Nairobi
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-driver-nairobi', 'Best Driver Nairobi', 'Drivers & Conductors', 59, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Liabloh', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ostoh', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Masterwong', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Badder', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Sule', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Papito', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Gateru', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Lukman', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Muhadi keisha', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'chacha', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Kenya 1
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('kenya-1', 'Kenya 1', 'Special Awards', 60, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Baba yaga', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ferrari', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Versace', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Ultron', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Outlawz', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, '1977', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Moneyfest', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Penguin', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Eccentric', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Bomaye', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best Adventure Group
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-adventure-group', 'Best Adventure Group', 'Special Awards', 61, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Iconic tours', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Headboy adventures', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Alpha adventures', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Plug adventures', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Vva tours', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Certified adventures', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Category: Best 14 Seater Nairobi
DO $$
DECLARE
  v_cat_id uuid;
BEGIN
  INSERT INTO categories (slug, name, group_name, sort_order, is_active)
  VALUES ('best-14-seater-nairobi', 'Best 14 Seater Nairobi', 'Special Awards', 62, true)
  ON CONFLICT (slug) DO UPDATE
  SET name = EXCLUDED.name, group_name = EXCLUDED.group_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active
  RETURNING id INTO v_cat_id;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Frakas', NULL, 1, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kichele', NULL, 2, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Fortunez', NULL, 3, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Brainchild', NULL, 4, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Tuffgong', NULL, 5, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Fumerz', NULL, 6, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Fatality', NULL, 7, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Chaplin', NULL, 8, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Kong', NULL, 9, true)
  ON CONFLICT (category_id, name) DO NOTHING;
  INSERT INTO nominees (category_id, name, subtitle, sort_order, is_active)
  VALUES (v_cat_id, 'Alladin', NULL, 10, true)
  ON CONFLICT (category_id, name) DO NOTHING;
END $$;

-- Populate vote_counts for all nominees
INSERT INTO vote_counts (category_id, nominee_id, count)
SELECT category_id, id, 0
FROM nominees
ON CONFLICT (category_id, nominee_id) DO NOTHING;

