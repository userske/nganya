"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Lock,
  Vote,
  ChevronLeft,
  AlertTriangle,
  Loader2,
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
        // Optimistic count update
        setCounts((prev) => ({
          ...prev,
          [selectedNomineeId]: (prev[selectedNomineeId] ?? 0) + 1,
        }));
        toast.success("Vote confirmed", {
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
          className="text-white/60 hover:text-white hover:bg-white/5 pl-2 focus-visible:ring-2 focus-visible:ring-white"
        >
          <Link href="/vote">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to All Categories
          </Link>
        </Button>

        {category.group_name && (
          <Badge
            variant="outline"
            className="text-xs uppercase tracking-wider bg-white/5 border-white/10 text-white/70 py-1 px-3 rounded-full"
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
        <p className="text-white/50 text-sm sm:text-base max-w-2xl leading-relaxed">
          {category.description ||
            "Select your nominee below, review your choice, and confirm your vote. Exactly one vote per verified voter."}
        </p>

        {/* Locked banner if voted */}
        {isLocked && votedNominee && (
          <div
            role="status"
            className="mt-6 p-4 rounded-xl bg-white/[0.04] border border-white/20 flex items-center gap-3 text-white"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-white" />
            <div>
              <div className="text-xs uppercase tracking-wider font-semibold text-white/50">
                Vote Locked & Recorded
              </div>
              <div className="text-sm font-semibold text-white">
                You voted for: <span className="underline underline-offset-2">{votedNominee.name}</span>
                {votedNominee.subtitle && ` (${votedNominee.subtitle})`}
              </div>
            </div>
            <Lock className="w-4 h-4 text-white/40 ml-auto" />
          </div>
        )}
      </div>

      {/* Nominees Grid */}
      <div
        role="radiogroup"
        aria-label={`Nominees for ${category.name}`}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12"
      >
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
              role="radio"
              aria-checked={isThisVoted || isSelected}
              aria-disabled={isLocked}
              tabIndex={isLocked ? -1 : 0}
              onClick={() => handleNomineeClick(nominee.id)}
              onKeyDown={(e) => handleKeyDownNominee(e, nominee.id)}
              className={`relative p-6 rounded-2xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out border text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99] ${
                isThisVoted
                  ? "bg-white/[0.08] border-white shadow-[0_0_24px_rgba(255,255,255,0.08)]"
                  : isSelected && !isLocked
                  ? "bg-white/[0.06] border-white shadow-[0_0_24px_rgba(255,255,255,0.06)]"
                  : isLocked
                  ? "bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed"
                  : "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.05] cursor-pointer"
              }`}
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isThisVoted || isSelected
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/50 border border-white/10"
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>

                {isThisVoted ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 border border-white/25 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Your Vote
                  </span>
                ) : (
                  <div className="text-right">
                    <div className="text-xs font-mono font-semibold text-white">
                      {voteCount} votes
                    </div>
                    <div className="text-[11px] text-white/40 font-mono">
                      {percentage}%
                    </div>
                  </div>
                )}
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

              {/* Progress bar for live percentage */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`h-full transition-[width] duration-500 ease-out ${
                      isThisVoted || isSelected ? "bg-white" : "bg-white/30"
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-xl z-30 pb-safe">
          <div className="p-4 rounded-2xl bg-[#0a0a0a]/95 border border-white/20 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="min-w-0 truncate">
              {selectedNominee ? (
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-white/40 font-medium">
                    Selected Nominee:
                  </div>
                  <div className="text-sm font-semibold text-white truncate">
                    {selectedNominee.name}
                    {selectedNominee.subtitle && ` (${selectedNominee.subtitle})`}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-white/50">
                  Select a nominee above to cast your vote
                </div>
              )}
            </div>

            <Button
              disabled={!selectedNomineeId || isSubmitting}
              onClick={handleVoteSubmitClick}
              className="bg-white hover:bg-white/90 text-black font-semibold px-6 h-11 rounded-xl shadow-lg shrink-0 focus-visible:ring-2 focus-visible:ring-white"
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
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border border-white/10 text-white p-6 rounded-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold text-white tracking-tight">
              Confirm Your Vote
            </DialogTitle>
            <DialogDescription className="text-white/60 text-sm leading-relaxed">
              You are voting for: <strong className="text-white font-semibold">{selectedNominee?.name}</strong> in{" "}
              <strong className="text-white font-semibold">{category.name}</strong>.
              <span className="block mt-2 text-xs text-white/40">
                • You can only vote once in this category.<br />
                • Votes cannot be changed or edited once cast.<br />
                • Your vote will instantly reflect on the public leaderboard.
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
              className="bg-white hover:bg-white/90 text-black font-semibold focus-visible:ring-2 focus-visible:ring-white"
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
