"use client";

import { useState, useEffect, useMemo } from "react";
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

  const isLocked = Boolean(votedNomineeId);
  const totalCategoryVotes = Object.values(counts).reduce((acc, c) => acc + c, 0);

  // ─── CLIENT-SIDE AUTH CHECK ──────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const authed = Boolean(user);
      setIsAuthenticated(authed);
      setAuthChecked(true);

      if (user) {
        const { data: vote } = await supabase
          .from("votes")
          .select("nominee_id")
          .eq("category_id", category.id)
          .eq("voter_id", user.id)
          .eq("voided", false)
          .maybeSingle();

        if (vote) {
          setVotedNomineeId(vote.nominee_id);
        }
      }

      if (authed && selectedNomineeId && authModalOpen) {
        setAuthModalOpen(false);
        setConfirmModalOpen(true);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authed = Boolean(session?.user);
        setIsAuthenticated(authed);
        setAuthChecked(true);

        if (authed && authModalOpen) {
          setAuthModalOpen(false);
          setTimeout(() => setConfirmModalOpen(true), 150);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [authModalOpen, selectedNomineeId]);

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

    const interval = setInterval(syncCounts, 20000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [category.id]);

  // ─── RANKINGS & LEADERBOARD SORT ─────────────────────────────────────────
  // Calculate exact rank for each nominee based on vote counts
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

    // If user prefers original ballot order
    return [...nominees].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [nominees, counts, sortByLeaderboard]);

  // Fast map from nomineeId -> rank position (#1, #2, #3...)
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
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setConfirmModalOpen(true);
  };

  const executeVote = async () => {
    if (!selectedNomineeId) return;
    setIsSubmitting(true);
    setConfirmModalOpen(false);

    try {
      const result = await submitVoteAction(category.id, selectedNomineeId);

      if (result.success) {
        setVotedNomineeId(selectedNomineeId);
        setCounts((prev) => ({
          ...prev,
          [selectedNomineeId]: (prev[selectedNomineeId] ?? 0) + 1,
        }));

        toast.success("Vote recorded in live leaderboard!", {
          description: `Your vote for ${result.nominee_name} has been counted in real time.`,
        });

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
    }
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

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Back button and group badge */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-white/60 hover:text-white hover:bg-white/5 pl-2 focus-visible:ring-2 focus-visible:ring-white"
        >
          <Link href="/vote">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to All Categories
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {category.group_name && (
            <Badge
              variant="outline"
              className="text-xs uppercase tracking-wider bg-white/5 border-white/10 text-white/70 py-1 px-3 rounded-full"
            >
              {category.group_name}
            </Badge>
          )}

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 text-xs font-semibold"
          >
            <Link href="/results">
              <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
              Full Leaderboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Category Title Header with Live Realtime Stats */}
      <div className="mb-10 pb-8 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Leaderboard Tally
            </div>

            {leaderNominee && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>#1 {leaderNominee.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-white/70 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
            <span className="text-white/40 uppercase">Total Category Votes:</span>
            <strong className="text-amber-400 font-bold">{totalCategoryVotes.toLocaleString()}</strong>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-3">
          {category.name}
        </h1>
        <p className="text-white/50 text-sm sm:text-base max-w-2xl leading-relaxed">
          {category.description ||
            "Select your nominee below to cast your verified vote. Nominees are ranked in real time by vote count (#1, #2, #3...)."}
        </p>

        {/* Locked banner if voted */}
        {isLocked && votedNominee && (
          <div
            role="status"
            className="mt-6 p-4 sm:p-5 rounded-2xl bg-[#0a1811] border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white shadow-[0_4px_24px_rgba(16,185,129,0.08)]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold font-mono">
                #{rankMap[votedNominee.id] ?? 1}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Your Vote is Confirmed & Counted
                </div>
                <div className="text-sm font-semibold text-white">
                  You voted for: <span className="underline underline-offset-2">{votedNominee.name}</span>
                  {votedNominee.subtitle && ` (${votedNominee.subtitle})`}
                  <span className="text-emerald-400 font-mono text-xs ml-2 font-bold">
                    (Currently Rank #{rankMap[votedNominee.id] ?? 1})
                  </span>
                </div>
              </div>
            </div>

            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-emerald-500/40 hover:border-emerald-400 text-emerald-300 hover:text-white bg-emerald-950/30 hover:bg-emerald-900/40 text-xs shrink-0 rounded-xl"
            >
              <Link href="/results">
                View All Categories
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Leaderboard View Controls */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-mono tracking-wider text-white/50">
            Leaderboard Standings:
          </span>
          <span className="text-xs text-amber-400 font-mono font-bold">
            Ranked #1 to #{nominees.length}
          </span>
        </div>

        <button
          onClick={() => setSortByLeaderboard(!sortByLeaderboard)}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-white/60 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ArrowUpDown className="w-3 h-3 text-amber-400" />
          <span>Sort: {sortByLeaderboard ? "Ranked (#1, #2, #3...)" : "Ballot Order"}</span>
        </button>
      </div>

      {/* Nominees Leaderboard Grid */}
      {nominees.length === 0 ? (
        <div className="p-12 sm:p-16 rounded-3xl bg-[#0d0d0d] border border-white/10 text-center max-w-xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white uppercase tracking-tight">
            Nominees Lineup Finalizing
          </h3>
          <p className="text-white/50 text-xs sm:text-sm leading-relaxed">
            The official shortlist for <strong>{category.name}</strong> is currently being verified.
            Voting for this category will open as soon as the verified nominees are announced.
          </p>
          <div className="pt-2">
            <Button asChild className="bg-amber-400 hover:bg-amber-300 text-black font-bold h-11 px-6 rounded-xl">
              <Link href="/vote">Browse Other Categories</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label={`Nominees Leaderboard for ${category.name}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
        >
          {rankedNominees.map((nominee) => {
            const rank = rankMap[nominee.id] ?? 1;
            const isSelected = selectedNomineeId === nominee.id;
            const isThisVoted = votedNomineeId === nominee.id;
            const voteCount = counts[nominee.id] ?? 0;
            const percentage =
              totalCategoryVotes > 0
                ? Math.round((voteCount / totalCategoryVotes) * 100)
                : 0;

            const isFirst = rank === 1 && voteCount > 0;
            const isSecond = rank === 2 && voteCount > 0;
            const isThird = rank === 3 && voteCount > 0;

            return (
              <div
                key={nominee.id}
                role="radio"
                aria-checked={isThisVoted || isSelected}
                aria-disabled={isLocked}
                tabIndex={isLocked ? -1 : 0}
                onClick={() => handleNomineeClick(nominee.id)}
              onKeyDown={(e) => handleKeyDownNominee(e, nominee.id)}
              className={`relative p-6 rounded-2xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out border text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                isThisVoted
                  ? "bg-[#0b1712] border-emerald-500 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
                  : isSelected && !isLocked
                  ? "bg-amber-950/20 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.2)] active:scale-[0.99] cursor-pointer"
                  : isFirst
                  ? "bg-gradient-to-b from-[#191307] to-[#0c0c0c] border-amber-400/50 shadow-[0_4px_24px_rgba(245,158,11,0.1)] hover:border-amber-400/80 cursor-pointer"
                  : isSecond
                  ? "bg-gradient-to-b from-[#141517] to-[#0c0c0c] border-slate-400/30 hover:border-slate-300/60 cursor-pointer"
                  : isThird
                  ? "bg-gradient-to-b from-[#17110c] to-[#0c0c0c] border-amber-900/30 hover:border-amber-800/50 cursor-pointer"
                  : isLocked
                  ? "bg-[#0c0c0c] border-white/10 hover:border-white/20 cursor-default"
                  : "bg-[#0c0c0c] border-white/10 hover:border-amber-400/40 hover:bg-[#121212] active:scale-[0.99] cursor-pointer"
              }`}
            >
              {/* Top Row: Rank Badge & Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  {/* Leaderboard Number Badge (1, 2, 3...) */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm font-mono shrink-0 shadow-sm ${
                      isThisVoted
                        ? "bg-emerald-500 text-black border border-emerald-400 font-black"
                        : isSelected
                        ? "bg-amber-400 text-black border border-amber-300 font-black"
                        : isFirst
                        ? "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-black border border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                        : isSecond
                        ? "bg-gradient-to-br from-slate-200 to-slate-400 text-black border border-white/60"
                        : isThird
                        ? "bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-100 border border-amber-600/50"
                        : "bg-white/5 text-white/60 border border-white/10"
                    }`}
                  >
                    #{rank}
                  </div>

                  {/* Leader Badge */}
                  {isFirst && !isThisVoted && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-mono">
                      <TrendingUp className="w-3 h-3" />
                      Rank #1
                    </span>
                  )}

                  {isThisVoted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
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
              <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
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
      )}

      {/* Floating Action Bar */}
      {!isLocked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-30 pb-safe">
          <div className="p-4 rounded-2xl bg-[#0a0a0a]/95 border border-amber-500/25 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="min-w-0 truncate">
              {selectedNominee ? (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-amber-400/80 font-medium">
                    Selected (Rank #{rankMap[selectedNominee.id] ?? 1}):
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {selectedNominee.name}
                    {selectedNominee.subtitle && ` (${selectedNominee.subtitle})`}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-white/50">
                  {authChecked && isAuthenticated
                    ? "Select a nominee above to cast your vote"
                    : "Select a nominee — you'll verify your email once to vote"}
                </div>
              )}
            </div>

            <Button
              disabled={!selectedNomineeId || isSubmitting}
              onClick={handleVoteSubmitClick}
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-black font-bold px-6 h-11 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0 focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Casting...
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-2" />
                  {isAuthenticated ? "Confirm Vote" : "Vote (Verify Email)"}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
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

          <DialogFooter className="flex gap-2 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              className="border-white/10 hover:bg-white/5 text-white focus-visible:ring-2 focus-visible:ring-white"
            >
              Cancel
            </Button>
            <Button
              onClick={executeVote}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Confirm & Cast Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog — only shown when user is not authenticated */}
      <VoteAuthDialog
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onVerified={() => {
          setIsAuthenticated(true);
          setConfirmModalOpen(true);
        }}
        nomineeName={selectedNominee?.name}
        categoryName={category.name}
      />
    </div>
  );
}
