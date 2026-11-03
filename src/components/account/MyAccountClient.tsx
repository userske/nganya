"use client";

import { useState, useEffect, useMemo } from "react";
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
  Download,
  Search,
  ChevronRight,
  Filter,
  Check,
  Printer,
  Share2,
  ArrowUpRight,
  User,
  Info,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  const [voteSearch, setVoteSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>(
    tickets.length > 0 && votes.length === 0 ? "tickets" : "votes"
  );

  // Dynamic greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Generate QR code data URLs for all tickets
  useEffect(() => {
    let isMounted = true;
    async function generateQRs() {
      const map: Record<string, string> = {};
      for (const t of tickets) {
        try {
          const siteUrl = window.location.origin;
          const verifyUrl = `${siteUrl}/verify/${encodeURIComponent(t.ticket_code)}`;
          const url = await QRCode.toDataURL(verifyUrl, {
            width: 320,
            margin: 1,
            color: { dark: "#000000", light: "#ffffff" },
            errorCorrectionLevel: "H",
          });
          map[t.id] = url;
        } catch (e) {
          console.error("QR generation error:", e);
        }
      }
      if (isMounted) setQrMap(map);
    }
    if (tickets.length > 0) {
      generateQRs();
    }
    return () => {
      isMounted = false;
    };
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

  const handleDownloadQr = (ticketId: string, code: string) => {
    const url = qrMap[ticketId];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `CoastalNganya-${code}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR Pass downloaded");
  };

  const isAdmin = user.role === "admin";
  const totalCategories = 61;
  const votingProgressPct = Math.min(100, Math.round((votes.length / totalCategories) * 100));

  // Extract unique category groups from cast votes
  const categoryGroups = useMemo(() => {
    const groups = new Set<string>();
    votes.forEach((v) => {
      if (v.categories?.group_name) {
        groups.add(v.categories.group_name);
      }
    });
    return Array.from(groups);
  }, [votes]);

  // Filtered votes
  const filteredVotes = useMemo(() => {
    return votes.filter((v) => {
      const matchesSearch =
        (v.categories?.name || "").toLowerCase().includes(voteSearch.toLowerCase()) ||
        (v.nominees?.name || "").toLowerCase().includes(voteSearch.toLowerCase());
      const matchesGroup =
        selectedGroup === "all" || v.categories?.group_name === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [votes, voteSearch, selectedGroup]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ─────────────────────────────────────────────────────────────
          HERO PROFILE & OPERATIONS BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#141414] via-[#0c0c0c] to-[#080808] p-6 sm:p-9 shadow-2xl">
        {/* Subtle decorative background glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
          {/* User ID & Badges */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-[2px] shadow-[0_0_25px_rgba(245,158,11,0.25)]">
                <div className="w-full h-full rounded-[14px] bg-[#0c0c0c] flex items-center justify-center text-amber-400 font-black text-2xl sm:text-3xl">
                  {user.email.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-black">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-semibold">
                  {greeting}
                </span>
                <span className="text-white/20">•</span>
                <Badge
                  variant="outline"
                  className={
                    isAdmin
                      ? "bg-amber-400/15 border-amber-400/40 text-amber-400 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5"
                      : "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5"
                  }
                >
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {isAdmin ? "Administrator" : "Verified Voter"}
                </Badge>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight break-all">
                {user.email}
              </h1>

              <p className="text-white/40 text-xs font-mono">
                Member ID: <span className="text-white/70">{user.id.substring(0, 13)}...</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <Button
                asChild
                className="bg-amber-400 hover:bg-amber-300 text-black font-bold h-11 px-5 rounded-xl shadow-lg shadow-amber-400/10"
              >
                <Link href="/admin">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold h-11 px-5 rounded-xl"
            >
              <Link href="/vote">
                <Vote className="w-4 h-4 mr-2 text-amber-400" />
                Cast More Votes
              </Link>
            </Button>

            <Button
              variant="ghost"
              disabled={isSigningOut}
              onClick={handleSignOut}
              className="text-white/60 hover:text-rose-400 hover:bg-rose-500/10 h-11 px-4 rounded-xl border border-transparent hover:border-rose-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* ── Key Metrics & Progress Strip ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          {/* 1. Voting Progress Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-white/50 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Vote className="w-3.5 h-3.5 text-amber-400" />
                  Voting Completion
                </span>
                <span className="font-mono text-amber-400 font-bold">
                  {votingProgressPct}%
                </span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${votingProgressPct}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-white/50 font-mono mt-1 flex items-center justify-between">
              <span>
                <strong className="text-white">{votes.length}</strong> of {totalCategories} categories
              </span>
              {votes.length < totalCategories ? (
                <Link
                  href="/vote"
                  className="text-amber-400 hover:underline flex items-center gap-0.5 text-[11px]"
                >
                  Complete ballot &rarr;
                </Link>
              ) : (
                <span className="text-emerald-400 text-[11px] font-bold">All Voted</span>
              )}
            </div>
          </div>

          {/* 2. Gate Passes Count */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/50 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                Active Event Passes
              </span>
              <span className="text-[11px] text-white/40 font-mono">Dec 6, 2026</span>
            </div>
            <div className="text-3xl font-black text-white font-mono my-1">
              {tickets.length}
              <span className="text-xs text-white/40 font-normal ml-2 font-sans">
                {tickets.length === 1 ? "official pass" : "official passes"}
              </span>
            </div>
            <div className="text-xs text-white/50 font-mono flex items-center justify-between">
              <span>Gate Entry Ready</span>
              {tickets.length === 0 ? (
                <Link href="/tickets" className="text-amber-400 hover:underline text-[11px]">
                  Buy Passes &rarr;
                </Link>
              ) : (
                <button
                  onClick={() => setActiveTab("tickets")}
                  className="text-amber-400 hover:underline text-[11px]"
                >
                  View QR Codes &rarr;
                </button>
              )}
            </div>
          </div>

          {/* 3. Event Location & Countdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white/50 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Event Venue
              </span>
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Confirmed
              </span>
            </div>
            <div className="text-lg font-bold text-white tracking-tight my-1 truncate">
              Mamba Village Arena
            </div>
            <div className="text-xs text-white/50 font-mono flex items-center gap-2">
              <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Sunday, Dec 6, 2026 · 2:00 PM EAT</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TABS: MY BALLOT vs MY TICKETS
      ───────────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl flex max-w-sm">
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
              My Passes ({tickets.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeTab === "votes" ? (
              <Button asChild size="sm" className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
                <Link href="/vote">
                  <Vote className="w-3.5 h-3.5 mr-1.5" />
                  Vote More Nominees
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
                <Link href="/tickets">
                  <Ticket className="w-3.5 h-3.5 mr-1.5" />
                  Order More Tickets
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: VOTES & BALLOT HISTORY
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="votes" className="space-y-6 outline-none">
          {votes.length === 0 ? (
            /* Empty State */
            <div className="p-12 sm:p-16 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <Vote className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  No Votes Recorded Yet
                </h3>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                  Support your favorite nganya crews, sound systems, route kings, and master fabricators.
                  Voting is 100% free with one verified vote per category.
                </p>
              </div>
              <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
                <Link href="/vote">
                  Start Voting (61 Categories)
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Search voted categories or nominees..."
                    value={voteSearch}
                    onChange={(e) => setVoteSearch(e.target.value)}
                    className="pl-9 bg-white/5 border-white/10 text-white h-10 text-xs rounded-xl focus-visible:ring-1 focus-visible:ring-amber-400"
                  />
                </div>

                {categoryGroups.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setSelectedGroup("all")}
                      className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                        selectedGroup === "all"
                          ? "bg-amber-400 text-black"
                          : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      All ({votes.length})
                    </button>
                    {categoryGroups.map((group) => {
                      const count = votes.filter((v) => v.categories?.group_name === group).length;
                      return (
                        <button
                          key={group}
                          onClick={() => setSelectedGroup(group)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                            selectedGroup === group
                              ? "bg-amber-400 text-black"
                              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          {group} ({count})
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Voted Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVotes.map((v) => {
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
                      className="group p-5 rounded-2xl bg-[#0d0d0d] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.08)]"
                    >
                      <div>
                        {/* Group tag & Status */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          {groupName ? (
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10">
                              {groupName}
                            </span>
                          ) : (
                            <span />
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            Official & Counted
                          </span>
                        </div>

                        {/* Category Name */}
                        <h3 className="text-base font-bold text-white mb-3 group-hover:text-amber-400 transition-colors">
                          {categoryName}
                        </h3>

                        {/* Selected Nominee Card */}
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/25 flex items-center justify-center text-amber-400 shrink-0">
                            <Award className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] uppercase text-amber-400 font-bold tracking-widest">
                              Your Cast Vote
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

                      {/* Footer: Date & Link to Live Tally */}
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40 font-mono">
                        <span>{voteDate}</span>
                        {categorySlug && (
                          <Link
                            href={`/vote/${categorySlug}`}
                            className="text-white/60 hover:text-amber-400 transition-colors flex items-center gap-1 font-sans text-xs font-semibold"
                          >
                            Live Results
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredVotes.length === 0 && (
                <div className="p-8 text-center text-white/40 text-xs">
                  No votes matching &ldquo;{voteSearch}&rdquo; in this filter.
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: DIGITAL GATE PASSES (LUXURY BOARDING PASS STYLE)
        ════════════════════════════════════════════════════════════ */}
        <TabsContent value="tickets" className="space-y-6 outline-none">
          {tickets.length === 0 ? (
            /* Empty State */
            <div className="p-12 sm:p-16 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <Ticket className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                  No Event Passes Found
                </h3>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                  No tickets are currently linked to <strong className="text-white">{user.email}</strong>.
                  Secure your official gate pass for Mombasa&apos;s biggest night in custom matatu culture.
                </p>
              </div>
              <Button asChild size="lg" className="bg-amber-400 hover:bg-amber-300 text-black font-bold">
                <Link href="/tickets">
                  Browse Ticket Tiers (KES 500+)
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tickets.map((t, idx) => {
                const tierName = t.ticket_tiers?.name || "General Admission";
                const isVvip = tierName.toLowerCase().includes("vvip");
                const isVip = tierName.toLowerCase().includes("vip");
                const qrUrl = qrMap[t.id];
                const isValid = t.status === "valid";

                return (
                  <div
                    key={t.id}
                    className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-b from-[#141414] via-[#0d0d0d] to-[#070707] shadow-2xl flex flex-col justify-between"
                  >
                    {/* Top Tier Metallic Banner */}
                    <div
                      className={`px-6 py-4 flex items-center justify-between border-b ${
                        isVvip
                          ? "bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent border-amber-400/30"
                          : isVip
                          ? "bg-gradient-to-r from-purple-500/20 via-white/5 to-transparent border-white/15"
                          : "bg-white/[0.03] border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            isVvip
                              ? "bg-amber-400 text-black font-black uppercase text-xs border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                              : isVip
                              ? "bg-white text-black font-black uppercase text-xs border-white"
                              : "bg-white/10 text-white font-bold uppercase text-xs border-white/20"
                          }
                        >
                          {tierName}
                        </Badge>
                        <span className="text-white/40 text-xs font-mono">
                          Pass #{idx + 1}
                        </span>
                      </div>

                      <span
                        className={`text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full ${
                          isValid
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {isValid ? "Active Pass" : t.status}
                      </span>
                    </div>

                    {/* Middle: Event & QR Info */}
                    <div className="p-6 sm:p-7 space-y-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-amber-400 font-mono font-semibold mb-1">
                          Official Entry Pass
                        </p>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                          Coastal Nganya Awards Night
                        </h3>
                      </div>

                      {/* Event schedule pill */}
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 grid grid-cols-2 gap-3 text-xs font-mono">
                        <div>
                          <span className="text-white/40 text-[10px] uppercase block mb-0.5">Date & Time</span>
                          <span className="text-white font-semibold">Dec 6, 2026 · 2:00 PM</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] uppercase block mb-0.5">Venue</span>
                          <span className="text-white font-semibold">Mamba Village, MSA</span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] uppercase block mb-0.5">Pass Holder</span>
                          <span className="text-white font-semibold truncate block">
                            {t.buyer_name || user.email}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/40 text-[10px] uppercase block mb-0.5">Order Ref</span>
                          <span className="text-amber-400 font-semibold">
                            {t.orders?.order_number || "—"}
                          </span>
                        </div>
                      </div>

                      {/* Scannable Gate QR Code Container */}
                      <div className="relative p-5 rounded-2xl bg-white flex flex-col items-center justify-center shadow-xl">
                        {qrUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={qrUrl}
                            alt={`Gate Pass QR for ${t.ticket_code}`}
                            className="w-52 h-52 object-contain"
                          />
                        ) : (
                          <div className="w-52 h-52 flex items-center justify-center text-black/50 text-xs font-mono">
                            Generating QR Pass...
                          </div>
                        )}
                        <div className="mt-2 text-center">
                          <p className="font-mono text-xs font-black text-black tracking-widest uppercase">
                            {t.ticket_code}
                          </p>
                          <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans font-semibold">
                            Gate staff will scan this code for entry
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Perforated Divider with Cutout Notches */}
                    <div className="relative w-full flex items-center">
                      <div className="w-4 h-8 bg-black rounded-r-full -ml-2 border-r border-white/10" />
                      <div className="flex-1 border-b border-dashed border-white/15 mx-2" />
                      <div className="w-4 h-8 bg-black rounded-l-full -mr-2 border-l border-white/10" />
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 sm:p-5 bg-black/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadQr(t.id, t.ticket_code)}
                          className="border-white/15 hover:bg-white/10 text-white text-xs h-9"
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Save QR
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.print()}
                          className="border-white/15 hover:bg-white/10 text-white text-xs h-9"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1.5" />
                          Print Pass
                        </Button>
                      </div>

                      <Link
                        href={`/verify/${encodeURIComponent(t.ticket_code)}`}
                        target="_blank"
                        className="text-amber-400 hover:underline flex items-center gap-1 font-semibold text-xs"
                      >
                        Verify Ticket Authenticity
                        <ExternalLink className="w-3 h-3" />
                      </Link>
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
