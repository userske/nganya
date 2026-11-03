"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import {
  Vote,
  Ticket,
  CheckCircle2,
  Lock,
  Calendar,
  MapPin,
  Clock,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  Download,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

export interface AccountVoteItem {
  id: string;
  category_id: string;
  nominee_id: string;
  created_at: string;
  categories?: {
    name: string;
    slug: string;
    group_name: string | null;
  } | null;
  nominees?: {
    name: string;
    subtitle: string | null;
  } | null;
}

export interface AccountTicketItem {
  id: string;
  ticket_code: string;
  status: string;
  qr_payload: string;
  buyer_name: string;
  buyer_phone?: string;
  created_at: string;
  ticket_tiers?: {
    name: string;
    price_kes: number;
  } | null;
  orders?: {
    order_number: string;
  } | null;
}

interface MyAccountClientProps {
  user: {
    id: string;
    email: string;
    role: string;
  };
  votes: AccountVoteItem[];
  tickets: AccountTicketItem[];
}

export function MyAccountClient({ user, votes, tickets }: MyAccountClientProps) {
  const router = useRouter();
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Generate QR code data URLs for all tickets
  useEffect(() => {
    async function generateQRs() {
      const map: Record<string, string> = {};
      for (const t of tickets) {
        try {
          const url = await QRCode.toDataURL(t.qr_payload || t.ticket_code, {
            width: 260,
            margin: 2,
            color: { dark: "#000000", light: "#ffffff" },
          });
          map[t.id] = url;
        } catch (e) {
          console.error("QR generation error:", e);
        }
      }
      setQrMap(map);
    }
    if (tickets.length > 0) {
      generateQRs();
    }
  }, [tickets]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const isAdmin = user.role === "admin";

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Account Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0a0a0a]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 font-bold text-xl shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  My Account
                </h1>
                <Badge
                  variant="outline"
                  className={
                    isAdmin
                      ? "bg-amber-400/10 border-amber-400/30 text-amber-400 text-xs uppercase"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs uppercase"
                  }
                >
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {isAdmin ? "Administrator" : "Verified Voter"}
                </Badge>
              </div>
              <p className="text-white/50 text-sm font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button asChild size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Link href="/admin">
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="border-white/10 hover:bg-white/5 text-white/70 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Vote className="w-3.5 h-3.5 text-amber-400" />
              Votes Cast
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {votes.length}
              <span className="text-xs text-white/30 font-normal ml-1">/ 62 categories</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              Gate Passes
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {tickets.length}
              <span className="text-xs text-white/30 font-normal ml-1">pass(es)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Event Date
            </div>
            <div className="text-sm font-bold text-white mt-1">
              Dec 6, 2026
            </div>
            <div className="text-[11px] text-white/40">2:00 PM EAT</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Venue
            </div>
            <div className="text-sm font-bold text-white mt-1">
              Mamba Village
            </div>
            <div className="text-[11px] text-white/40">Mombasa, Kenya</div>
          </div>
        </div>
      </div>

      {/* Main Tabs: Votes & Tickets */}
      <Tabs defaultValue={votes.length > 0 ? "votes" : "tickets"} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex max-w-md mx-auto mb-8">
          <TabsTrigger
            value="votes"
            className="flex-1 rounded-xl text-xs sm:text-sm py-2.5 font-bold data-[state=active]:bg-amber-400 data-[state=active]:text-black transition-all"
          >
            <Vote className="w-4 h-4 mr-2" />
            My Votes ({votes.length})
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="flex-1 rounded-xl text-xs sm:text-sm py-2.5 font-bold data-[state=active]:bg-amber-400 data-[state=active]:text-black transition-all"
          >
            <Ticket className="w-4 h-4 mr-2" />
            My Tickets ({tickets.length})
          </TabsTrigger>
        </TabsList>

        {/* ─── TAB 1: VOTES ────────────────────────────────────────────── */}
        <TabsContent value="votes" className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Cast Ballots
              </h2>
              <p className="text-xs text-white/50">
                Official votes recorded under your verified email. One vote allowed per category.
              </p>
            </div>
            <Button asChild size="sm" className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
              <Link href="/vote">
                Vote More Categories
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          {votes.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto">
                <Vote className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Votes Recorded Yet</h3>
              <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                You haven&apos;t cast any votes yet. Explore 62 award categories honoring Mombasa&apos;s wildest custom builds, audio setups, and route legends.
              </p>
              <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
                <Link href="/vote">Browse Categories & Vote</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {votes.map((v) => {
                const categoryName = v.categories?.name || "Official Category";
                const categorySlug = v.categories?.slug || "";
                const groupName = v.categories?.group_name;
                const nomineeName = v.nominees?.name || "Official Nominee";
                const nomineeSubtitle = v.nominees?.subtitle;
                const voteDate = v.created_at
                  ? format(new Date(v.created_at), "d MMM yyyy, h:mm a")
                  : "Recorded";

                return (
                  <div
                    key={v.id}
                    className="p-5 rounded-2xl bg-[#0a0a0a] border border-white/10 hover:border-amber-400/30 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {groupName && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                            {groupName}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">
                          <CheckCircle2 className="w-3 h-3" />
                          Locked & Counted
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mb-3">
                        {categoryName}
                      </h3>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                          <Award className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs uppercase text-amber-400/70 font-semibold tracking-wider">
                            Your Nominee
                          </div>
                          <div className="text-sm font-bold text-white truncate">
                            {nomineeName}
                          </div>
                          {nomineeSubtitle && (
                            <div className="text-xs text-white/40 truncate">
                              {nomineeSubtitle}
                            </div>
                          )}
                        </div>
                        <Lock className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40 font-mono">
                      <span>{voteDate}</span>
                      {categorySlug && (
                        <Link
                          href={`/vote/${categorySlug}`}
                          className="hover:text-amber-400 transition-colors flex items-center gap-1"
                        >
                          View Live Tally &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── TAB 2: TICKETS ──────────────────────────────────────────── */}
        <TabsContent value="tickets" className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Official Event Passes
              </h2>
              <p className="text-xs text-white/50">
                Show your scannable QR pass at the Mamba Village gate entrance on December 6.
              </p>
            </div>
            <Button asChild size="sm" className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
              <Link href="/tickets">
                Buy More Tickets
                <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>

          {tickets.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Tickets Found</h3>
              <p className="text-xs text-white/50 max-w-md mx-auto leading-relaxed">
                No tickets are registered under {user.email}. Secure your passes for the biggest night in Coastal matatu culture before tiers sell out.
              </p>
              <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
                <Link href="/tickets">Explore Ticket Tiers (KES 500+)</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tickets.map((t) => {
                const tierName = t.ticket_tiers?.name || "Official Pass";
                const isVvip = tierName.toLowerCase().includes("vvip");
                const isVip = tierName.toLowerCase().includes("vip");
                const qrUrl = qrMap[t.id];
                const isValid = t.status === "valid";

                return (
                  <div
                    key={t.id}
                    className={`relative rounded-3xl p-6 sm:p-7 overflow-hidden border shadow-2xl flex flex-col justify-between ${
                      isVvip
                        ? "bg-gradient-to-br from-amber-950/30 via-black to-black border-amber-400/40 shadow-[0_0_30px_rgba(245,158,11,0.15)]"
                        : isVip
                        ? "bg-gradient-to-br from-neutral-900 via-black to-black border-white/20"
                        : "bg-[#0d0d0d] border-white/10"
                    }`}
                  >
                    {/* Top Tier Info */}
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <Badge
                          variant="outline"
                          className={
                            isVvip
                              ? "bg-amber-400 text-black font-black uppercase text-xs border-amber-400"
                              : "bg-white/10 text-white font-bold uppercase text-xs border-white/20"
                          }
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          {tierName}
                        </Badge>

                        <span
                          className={`text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full ${
                            isValid
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">
                        Coastal Nganya Awards 2026
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/50 mb-6 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-400" />
                          06 Dec 2026
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          2:00 PM
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-400" />
                          Mamba Village
                        </span>
                      </div>

                      {/* Scannable QR Code */}
                      <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center my-4 shadow-inner">
                        {qrUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qrUrl}
                            alt={`Gate Pass ${t.ticket_code}`}
                            className="w-48 h-48 object-contain"
                          />
                        ) : (
                          <div className="w-48 h-48 flex items-center justify-center text-black/50 text-xs font-mono">
                            Generating pass...
                          </div>
                        )}
                        <p className="text-[11px] font-mono text-black font-bold uppercase tracking-wider mt-2">
                          {t.ticket_code}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
                      <div>
                        <div className="text-[10px] uppercase text-white/30">Attendee</div>
                        <div className="text-white font-medium">{t.buyer_name || user.email}</div>
                      </div>

                      {t.orders?.order_number && (
                        <div className="text-right">
                          <div className="text-[10px] uppercase text-white/30">Order</div>
                          <div className="font-mono text-white/70">{t.orders.order_number}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
