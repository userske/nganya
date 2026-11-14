"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  Vote,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  BarChart3,
  TrendingUp,
  ArrowUpDown,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { VoteAuthDialog } from "./VoteAuthDialog";
import { Turnstile } from "@/components/ui/turnstile";
import { submitVoteAction } from "@/app/actions/vote";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Nominee {
  id: string;
  name: string;
  subtitle: string | null;
  image_url: string | null;
  sort_order: number;
}

interface NomineeVoteClientProps {
  category: {
    id: string;
    slug: string;
    name: string;
    group_name: string | null;
    description?: string | null;
  };
  nominees: Nominee[];
  initialCounts: Record<string, number>;
  existingVoteNomineeId?: string | null;
  isAuthenticated: boolean;
  userEmail?: string;
}

export function NomineeVoteClient({
  category,
  nominees,
  initialCounts,
  existingVoteNomineeId,
  isAuthenticated: initialAuth,
}: NomineeVoteClientProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [votedNomineeId, setVotedNomineeId] = useState<string | null>(
    existingVoteNomineeId ?? null
  );
  const [sortByLeaderboard, setSortByLeaderboard] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [authChecked, setAuthChecked] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const isLocked = Boolean(votedNomineeId);
  const totalCategoryVotes = Object.values(counts).reduce((acc, c) => acc + c, 0);

  // ─── EXECUTE VOTE HANDLER ────────────────────────────────────────────────
  const executeVote = useCallback(
    async (targetNomineeId?: string, overrideToken?: string) => {
      const nomId = targetNomineeId || selectedNomineeId;
      const token = overrideToken || turnstileToken;
      if (!nomId || isLocked) return;

      if (!token) {
        toast.error("Bot verification required", {
          description: "Please complete the CAPTCHA check before confirming your vote.",
        });
        return;
      }

      setIsSubmitting(true);
      setConfirmModalOpen(false);

      try {
        const result = await submitVoteAction(category.id, nomId, token);

        if (result.success) {
          setVotedNomineeId(nomId);
          setSelectedNomineeId(nomId);
          setCounts((prev) => ({
            ...prev,
            [nomId]: (prev[nomId] ?? 0) + 1,
          }));

          // Clean up pending vote storage
          try {
            localStorage.removeItem("cna_pending_vote");
            if (typeof window !== "undefined" && window.location.search) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          } catch {}

          toast.success("Vote recorded in live leaderboard!", {
            description: `Your vote for ${result.nominee_name} has been counted in real time.`,
          });

          // Refresh live category count
          fetch(`/api/vote/counts?categoryId=${category.id}`)
            .then((res) => res.json())
            .then((json) => {
              if (json.counts && Array.isArray(json.counts)) {
                const map: Record<string, number> = {};
                for (const item of json.counts) {
                  map[item.nominee_id] = Number(item.count);
                }
                setCounts((prev) => ({ ...prev, ...map }));
              }
            })
            .catch(() => {});
        } else {
          if (result.error === "NOT_AUTHENTICATED") {
            setIsAuthenticated(false);
            setAuthModalOpen(true);
          } else {
            toast.error("Could not cast vote", {
              description: result.error || "An error occurred while casting your vote.",
            });
          }
        }
      } catch {
        toast.error("Network error. Please check your connection.");
      } finally {
        setIsSubmitting(false);
        setTurnstileToken(null);
      }
    },
    [category.id, isLocked, selectedNomineeId, turnstileToken]
  );

  // ─── CLIENT-SIDE AUTH CHECK & AUTO-VOTE RESTORATION ─────────────────────
  useEffect(() => {
    const supabase = createClient();

    const checkSessionAndPendingVote = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const authed = Boolean(user);
      setIsAuthenticated(authed);
      setAuthChecked(true);

      // Check URL query parameters or localStorage for pending vote from magic link
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const autoVote = searchParams.get("auto_vote") === "1";
        const selectedFromUrl = searchParams.get("selected_nominee");

        let pendingNomineeId: string | null = selectedFromUrl;

        if (!pendingNomineeId) {
          try {
            const raw = localStorage.getItem("cna_pending_vote");
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed.categoryId === category.id || parsed.categorySlug === category.slug) {
                pendingNomineeId = parsed.nomineeId;
              }
            }
          } catch {}
        }

        if (pendingNomineeId && nominees.some((n) => n.id === pendingNomineeId)) {
          setSelectedNomineeId(pendingNomineeId);

          // If voter is now authenticated and hasn't voted yet, open confirmation dialog with Turnstile
          if (authed && !votedNomineeId) {
            setConfirmModalOpen(true);
          }
        }
      }

      if (authed && selectedNomineeId && authModalOpen) {
        setAuthModalOpen(false);
        setConfirmModalOpen(true);
      }
    };

    checkSessionAndPendingVote();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authed = Boolean(session?.user);
      setIsAuthenticated(authed);
      setAuthChecked(true);

      if (authed && authModalOpen) {
        setAuthModalOpen(false);
        setTimeout(() => setConfirmModalOpen(true), 150);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [authModalOpen, category.id, category.slug, executeVote, nominees, selectedNomineeId, votedNomineeId]);

  // ─── REALTIME VOTE COUNTS ────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const syncCounts = async () => {
      try {
        const res = await fetch(`/api/vote/counts?categoryId=${category.id}`);
        if (!res.ok) return;
        const json = await res.json();
        if (json.counts && Array.isArray(json.counts) && isMounted) {
          const map: Record<string, number> = {};
          for (const item of json.counts) {
            map[item.nominee_id] = Number(item.count);
          }
          setCounts((prev) => ({ ...prev, ...map }));
        }
      } catch {
        // Silently continue
      }
    };

    syncCounts();

    const channel = supabase
      .channel(`category-counts-${category.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vote_counts",
          filter: `category_id=eq.${category.id}`,
        },
        (payload: any) => {
          if (!isMounted) return;
          const { nominee_id, count } = payload.new || {};
          if (nominee_id && typeof count === "number") {
            setCounts((prev) => ({ ...prev, [nominee_id]: count }));
          } else {
            syncCounts();
          }
        }
      )
      .subscribe();

    const interval = setInterval(syncCounts, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [category.id]);

  // ─── RANKINGS & LEADERBOARD SORT ─────────────────────────────────────────
  const rankedNominees = useMemo(() => {
    const list = [...nominees].sort((a, b) => {
      const votesA = counts[a.id] ?? 0;
      const votesB = counts[b.id] ?? 0;
      if (votesB !== votesA) {
        return votesB - votesA;
      }
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    if (sortByLeaderboard) {
      return list;
    }

    return [...nominees].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [nominees, counts, sortByLeaderboard]);

  const rankMap = useMemo(() => {
    const sorted = [...nominees].sort((a, b) => {
      const votesA = counts[a.id] ?? 0;
      const votesB = counts[b.id] ?? 0;
      if (votesB !== votesA) return votesB - votesA;
      return (a.sort_order ?? 0) - (b.sort_order ?? 0);
    });

    const map: Record<string, number> = {};
    sorted.forEach((nom, index) => {
      map[nom.id] = index + 1;
    });
    return map;
  }, [nominees, counts]);

  // ─── HANDLERS ────────────────────────────────────────────────────────────
  const handleNomineeClick = (nomineeId: string) => {
    if (isLocked) return;
    setSelectedNomineeId(nomineeId);
  };

  const handleKeyDownNominee = (e: React.KeyboardEvent, nomineeId: string) => {
    if (isLocked) return;
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setSelectedNomineeId(nomineeId);
    }
  };

  const handleVoteSubmitClick = () => {
    if (!selectedNomineeId) return;

    // Save pending vote in localStorage in case user needs magic link
    try {
      localStorage.setItem(
        "cna_pending_vote",
        JSON.stringify({
          categoryId: category.id,
          categorySlug: category.slug,
          nomineeId: selectedNomineeId,
          nomineeName: selectedNominee?.name,
          timestamp: Date.now(),
        })
      );
    } catch {}

    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setTurnstileToken(null);
    setConfirmModalOpen(true);
  };

  const selectedNominee = nominees.find((n) => n.id === selectedNomineeId);
  const votedNominee = nominees.find((n) => n.id === votedNomineeId);

  // Leader nominee
  const leaderNominee = useMemo(() => {
    let topNom: Nominee | null = null;
    let max = -1;
    for (const nom of nominees) {
      const c = counts[nom.id] ?? 0;
      if (c > max && c > 0) {
        max = c;
        topNom = nom;
      }
    }
    return topNom;
  }, [nominees, counts]);

  return (
    <div className="pb-36 sm:pb-40">
      {/* Back button and group badge */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white -ml-2 text-xs"
        >
          <Link href="/vote">
            <ChevronLeft className="w-4 h-4 mr-1" />
            All Categories
          </Link>
        </Button>

        {category.group_name && (
          <Badge
            variant="outline"
            className="text-[11px] uppercase tracking-wider font-semibold border-white/10 text-white/70 px-3 py-1 bg-white/5"
          >
            {category.group_name}
          </Badge>
        )}
      </div>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-white/60 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          {/* Category Total Votes & Leader Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-right">
              <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
                Category Total
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                {totalCategoryVotes.toLocaleString()}
              </div>
              <div className="text-[10px] text-white/40 font-mono">
                {nominees.length} Nominees
              </div>
            </div>
          </div>
        </div>

        {/* Status banner if already voted */}
        {isLocked && votedNominee && (
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start sm:items-center gap-3 text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-bold text-white">Your vote has been verified and counted: </span>
              <span className="text-emerald-300 font-semibold">{votedNominee.name}</span>
              <span className="text-white/50 block sm:inline sm:ml-2">
                (Votes are locked. Thank you for participating!)
              </span>
            </div>
          </div>
        )}

        {/* View Controls: Sort Toggle */}
        <div className="flex items-center justify-between gap-4 mt-6">
          <div className="text-xs text-white/50 font-mono">
            {isLocked
              ? "Voting completed for this category."
              : "Select your nominee below and cast your vote."}
          </div>

          <button
            type="button"
            onClick={() => setSortByLeaderboard((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3 text-amber-400" />
            <span>{sortByLeaderboard ? "Sorted by: Leaderboard" : "Sorted by: Ballot Order"}</span>
          </button>
        </div>
      </div>

      {/* Nominees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rankedNominees.map((nominee) => {
          const voteCount = counts[nominee.id] ?? 0;
          const percentage =
            totalCategoryVotes > 0
              ? Math.round((voteCount / totalCategoryVotes) * 100)
              : 0;

          const isSelected = selectedNomineeId === nominee.id;
          const isThisVoted = votedNomineeId === nominee.id;
          const rank = rankMap[nominee.id] ?? 1;
          const isFirst = rank === 1 && voteCount > 0;
          const isSecond = rank === 2 && voteCount > 0;
          const isThird = rank === 3 && voteCount > 0;

          return (
            <div
              key={nominee.id}
              role="button"
              tabIndex={isLocked ? -1 : 0}
              aria-pressed={isSelected}
              onClick={() => handleNomineeClick(nominee.id)}
              onKeyDown={(e) => handleKeyDownNominee(e, nominee.id)}
              className={`group relative p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 select-none text-left ${
                isLocked ? "cursor-default" : "cursor-pointer active:scale-[0.99]"
              } ${
                isThisVoted
                  ? "bg-emerald-500/10 border-emerald-400/50 shadow-lg shadow-emerald-500/10"
                  : isSelected
                  ? "bg-amber-400/10 border-amber-400 shadow-xl shadow-amber-400/15 ring-2 ring-amber-400"
                  : isFirst
                  ? "bg-[#0f0f0f] border-amber-400/30 hover:border-amber-400/60"
                  : "bg-[#0a0a0a] border-white/10 hover:border-white/25 hover:bg-white/[0.02]"
              }`}
            >
              {/* Top row: Rank badge + vote percentage */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isThisVoted
                        ? "bg-emerald-400 text-black font-extrabold"
                        : isFirst
                        ? "bg-amber-400 text-black font-extrabold shadow-sm shadow-amber-400/40"
                        : isSecond
                        ? "bg-slate-300 text-black font-bold"
                        : isThird
                        ? "bg-amber-700/80 text-white font-bold"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    {rank}
                  </div>

                  {isFirst && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono inline-flex items-center gap-1">
                      <Trophy className="w-3 h-3 fill-amber-400" />
                      Leader
                    </span>
                  )}

                  {isThisVoted && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 font-mono inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Your Vote
                    </span>
                  )}
                </div>

                {/* Live Tallies */}
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-white">
                    {voteCount.toLocaleString()} {voteCount === 1 ? "vote" : "votes"}
                  </div>
                  <div className="text-xs text-amber-400 font-mono font-semibold">
                    {percentage}%
                  </div>
                </div>
              </div>

              {/* Nominee Title & Subtitle */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-1 tracking-tight">
                {nominee.name}
              </h3>
              {nominee.subtitle && (
                <p className="text-xs text-white/60 font-mono font-medium mb-4">
                  {nominee.subtitle}
                </p>
              )}

              {/* Realtime Live Progress bar */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div
                  className="w-full bg-white/5 h-2 rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full transition-[width] duration-500 ease-out ${
                      isThisVoted
                        ? "bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        : isSelected
                        ? "bg-gradient-to-r from-amber-400 to-amber-200"
                        : isFirst
                        ? "bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500"
                        : isSecond
                        ? "bg-slate-300"
                        : isThird
                        ? "bg-amber-700"
                        : "bg-white/30"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar (positioned safely above iOS Safari bottom bar) */}
      {!isLocked && (
        <div className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-30">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0a0a0a]/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="min-w-0 truncate">
              {selectedNominee ? (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-amber-400/80 font-medium">
                    Selected (Rank #{rankMap[selectedNominee.id] ?? 1}):
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white truncate">
                    {selectedNominee.name}
                    {selectedNominee.subtitle && ` (${selectedNominee.subtitle})`}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-white/50">
                  {authChecked && isAuthenticated
                    ? "Select a nominee above to cast your vote"
                    : "Select a nominee to cast your vote"}
                </div>
              )}
            </div>

            <Button
              disabled={!selectedNomineeId || isSubmitting}
              onClick={handleVoteSubmitClick}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold px-5 sm:px-6 h-11 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0 focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98] text-xs sm:text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Casting...
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-1.5" />
                  {isAuthenticated ? "Confirm Vote" : "Vote (Magic Link)"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog with Cloudflare Turnstile CAPTCHA */}
      <Dialog
        open={confirmModalOpen}
        onOpenChange={(open) => {
          setConfirmModalOpen(open);
          if (!open) {
            setTurnstileToken(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-white/10 text-white p-6 rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              Confirm Your Vote
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm leading-relaxed">
              You are voting for: <strong className="text-white font-semibold">{selectedNominee?.name}</strong>{" "}
              (Current Rank #{selectedNominee ? rankMap[selectedNominee.id] ?? 1 : 1}) in{" "}
              <strong className="text-white font-semibold">{category.name}</strong>.
              <span className="block mt-2 text-xs text-white/40">
                • You can only vote once in this category.<br />
                • Votes cannot be changed or edited once cast.<br />
                • Your vote will instantly reflect in the live leaderboard.
              </span>
            </DialogDescription>
          </DialogHeader>

          {/* Cloudflare Turnstile Bot Protection */}
          <div className="my-2 p-3 rounded-xl bg-white/[0.03] border border-white/10">
            <Turnstile
              key={confirmModalOpen ? "turnstile-open" : "turnstile-closed"}
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
            />
          </div>

          <DialogFooter className="flex gap-2 sm:gap-3 mt-4">
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={() => {
                setTurnstileToken(null);
                setConfirmModalOpen(false);
              }}
              className="border-white/10 hover:bg-white/5 text-white focus-visible:ring-2 focus-visible:ring-white"
            >
              Cancel
            </Button>
            <Button
              onClick={() => executeVote()}
              disabled={isSubmitting || !turnstileToken}
              className={`font-bold focus-visible:ring-2 focus-visible:ring-amber-400 transition-all ${
                turnstileToken
                  ? "bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Casting Vote...
                </>
              ) : !turnstileToken ? (
                "Verify CAPTCHA Above"
              ) : (
                "Confirm & Cast Vote"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog (Pure Magic Link) */}
      <VoteAuthDialog
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onVerified={() => {
          setIsAuthenticated(true);
          setConfirmModalOpen(true);
        }}
        nomineeName={selectedNominee?.name}
        categoryName={category.name}
        categorySlug={category.slug}
        nomineeId={selectedNomineeId ?? undefined}
      />
    </div>
  );
}
