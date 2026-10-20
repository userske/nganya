"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  Vote,
  Sparkles,
  ChevronLeft,
  AlertTriangle,
  Loader2,
  ShieldAlert,
  Flame,
  Award,
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
  initialCounts: Record<string, number>; // nominee_id -> count
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
  userEmail,
}: NomineeVoteClientProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [selectedNomineeId, setSelectedNomineeId] = useState<string | null>(null);
  const [votedNomineeId, setVotedNomineeId] = useState<string | null>(
    existingVoteNomineeId ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);

  const isLocked = Boolean(votedNomineeId);

  // Compute total votes for percentage calculation
  const totalCategoryVotes = Object.values(counts).reduce((acc, c) => acc + c, 0);

  // Supabase Realtime subscription with 5-second polling fallback
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    // 1. Setup Realtime channel
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
          const { nominee_id, count } = payload.new;
          if (nominee_id && typeof count === "number") {
            setCounts((prev) => ({
              ...prev,
              [nominee_id]: count,
            }));
          }
        }
      )
      .subscribe();

    // 2. Setup 5-second polling fallback
    const interval = setInterval(async () => {
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
        // Silently keep current state on network flicker
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [category.id]);

  const handleNomineeClick = (nomineeId: string) => {
    if (isLocked) return;
    setSelectedNomineeId(nomineeId);
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
        // Optimistic count update
        setCounts((prev) => ({
          ...prev,
          [selectedNomineeId]: (prev[selectedNomineeId] ?? 0) + 1,
        }));
        toast.success("Vote confirmed!", {
          description: `Your vote for ${result.nominee_name} has been counted in real time.`,
        });
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

  return (
    <div>
      {/* Back button and group badge */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white hover:bg-white/5 pl-2"
        >
          <Link href="/vote">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to All Categories
          </Link>
        </Button>

        {category.group_name && (
          <Badge
            variant="outline"
            className="text-xs uppercase tracking-wider bg-white/5 border-white/10 text-amber-400/90 py-1 px-3 rounded-full"
          >
            {category.group_name}
          </Badge>
        )}
      </div>

      {/* Category Title Header */}
      <div className="mb-10 pb-8 border-b border-white/10">
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-3">
          {category.name}
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
          {category.description ||
            "Tap your nominee below, review your choice, and confirm your vote. Exactly one vote per person."}
        </p>

        {/* Locked banner if voted */}
        {isLocked && votedNominee && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6 shrink-0" />
            <div>
              <div className="text-xs uppercase tracking-wider font-bold">
                Vote Locked & Counted
              </div>
              <div className="text-sm font-semibold text-white">
                You voted for: <span className="text-emerald-400">{votedNominee.name}</span>
                {votedNominee.subtitle && ` (${votedNominee.subtitle})`}
              </div>
            </div>
            <Lock className="w-4 h-4 text-emerald-500/60 ml-auto" />
          </div>
        )}
      </div>

      {/* Nominees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {nominees.map((nominee) => {
          const isSelected = selectedNomineeId === nominee.id;
          const isThisVoted = votedNomineeId === nominee.id;
          const voteCount = counts[nominee.id] ?? 0;
          const percentage =
            totalCategoryVotes > 0
              ? Math.round((voteCount / totalCategoryVotes) * 100)
              : 0;

          return (
            <div
              key={nominee.id}
              onClick={() => handleNomineeClick(nominee.id)}
              className={`relative p-6 rounded-2xl transition-all duration-300 border text-left select-none ${
                isThisVoted
                  ? "bg-[#0c1f1a] border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                  : isSelected && !isLocked
                  ? "bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)] scale-[1.01]"
                  : isLocked
                  ? "bg-white/[0.02] border-white/5 opacity-60 cursor-not-allowed"
                  : "bg-white/[0.03] border-white/10 hover:border-amber-500/40 hover:bg-white/[0.06] cursor-pointer"
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isThisVoted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : isSelected
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-white/5 text-slate-400 border border-white/10"
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>

                {isThisVoted ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Your Vote
                  </span>
                ) : (
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-400">
                      {voteCount} votes
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {percentage}%
                    </div>
                  </div>
                )}
              </div>

              {/* Nominee Title & Plate/Route Subtitle */}
              <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
                {nominee.name}
              </h3>
              {nominee.subtitle && (
                <p className="text-xs text-amber-400/80 font-mono font-medium mb-4">
                  {nominee.subtitle}
                </p>
              )}

              {/* Progress bar for live percentage */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      isThisVoted
                        ? "bg-emerald-500"
                        : isSelected
                        ? "bg-amber-400"
                        : "bg-slate-600"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar when nominee is selected and not locked */}
      {!isLocked && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-30">
          <div className="p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="truncate">
              {selectedNominee ? (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">
                    Selected Nominee:
                  </div>
                  <div className="text-sm font-bold text-amber-400 truncate">
                    {selectedNominee.name}
                    {selectedNominee.subtitle && ` (${selectedNominee.subtitle})`}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Select a nominee above to cast your vote
                </div>
              )}
            </div>

            <Button
              disabled={!selectedNomineeId || isSubmitting}
              onClick={handleVoteSubmitClick}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-6 h-11 rounded-xl shadow-lg shadow-amber-500/20 shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Casting...
                </>
              ) : (
                <>
                  <Vote className="w-4 h-4 mr-2" />
                  Confirm Vote
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0f1d] border border-amber-500/30 text-white p-6 rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Confirm Your Vote
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm leading-relaxed">
              You are voting for: <strong className="text-amber-400 font-bold">{selectedNominee?.name}</strong> in{" "}
              <strong>{category.name}</strong>.
              <span className="block mt-2 text-xs text-red-400/90 font-medium">
                • You can only vote ONCE in this category.<br />
                • Votes cannot be changed, removed, or edited once cast.<br />
                • Your vote will instantly reflect on the public leaderboard.
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              className="border-white/10 hover:bg-white/5 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={executeVote}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              Confirm & Cast Vote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auth Dialog */}
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
