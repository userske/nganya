import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MyAccountClient } from "@/components/account/MyAccountClient";
import { MyAccountLogin } from "@/components/account/MyAccountLogin";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Account — Votes & Passes | Coastal Nganya Awards",
  description: "View your verified category votes, active event passes, and digital gate QR codes.",
};

export default async function MyAccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28 flex items-center justify-center">
          <MyAccountLogin />
        </main>

        <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
      </div>
    );
  }

  const adminClient = await createAdminClient();
  const userEmail = (user.email || "").toLowerCase().trim();

  // 1. Fetch user's cast votes
  const { data: votes } = await adminClient
    .from("votes")
    .select(`
      id,
      category_id,
      nominee_id,
      created_at,
      categories (
        name,
        slug,
        group_name
      ),
      nominees (
        name,
        subtitle
      )
    `)
    .eq("voter_id", user.id)
    .eq("voided", false)
    .order("created_at", { ascending: false });

  // 2. Fetch user's tickets (matched by email)
  const { data: tickets } = await adminClient
    .from("tickets")
    .select(`
      id,
      ticket_code,
      status,
      qr_payload,
      buyer_name,
      buyer_phone,
      created_at,
      ticket_tiers (
        name,
        price_kes
      ),
      orders (
        order_number
      )
    `)
    .eq("buyer_email", userEmail)
    .order("created_at", { ascending: false });

  // 3. Fetch user profile for role
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <MyAccountClient
          user={{
            id: user.id,
            email: user.email || "",
            role: profile?.role || "voter",
          }}
          votes={(votes as any) || []}
          tickets={(tickets as any) || []}
        />
      </main>

      <Footer eventData={{ event_name: "Coastal Nganya Awards" }} />
    </div>
  );
}

