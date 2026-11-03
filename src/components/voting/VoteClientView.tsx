"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Trophy, BarChart3, UserCheck, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CategoryCard } from "./CategoryCard";
import { VoteAuthDialog } from "./VoteAuthDialog";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  slug: string;
  name: string;
  group_name: string | null;
  sort_order: number;
  nominees_count?: number;
}

interface VoteClientViewProps {
  categories: Category[];
  initialUserVotes: Record<string, string>; // category_id -> nominee_name
  initialCategoryVotes?: Record<string, number>; // category_id -> total count
  isAuthenticated: boolean;
  userEmail?: string;
}

export function VoteClientView({
  categories,
  initialUserVotes,
  initialCategoryVotes = {},
  isAuthenticated,
  userEmail,
}: VoteClientViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [categoryVotes, setCategoryVotes] = useState<Record<string, number>>(initialCategoryVotes);

  // Live polling of category vote tallies
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/vote/counts");
        if (!res.ok) return;
        const json = await res.json();
        if (json.counts && Array.isArray(json.counts) && isMounted) {
          const map: Record<string, number> = {};
          for (const item of json.counts) {
            const catId = item.category_id;
            map[catId] = (map[catId] ?? 0) + Number(item.count);
          }
          setCategoryVotes(map);
        }
      } catch {
        // Silently continue
      }
    };

    fetchCounts();

    const channel = supabase
      .channel("vote-categories-live-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vote_counts",
        },
        () => {
          if (isMounted) fetchCounts();
        }
      )
      .subscribe();

    const interval = setInterval(fetchCounts, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Collect distinct groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c.group_name) set.add(c.group_name);
    });
    return ["All", ...Array.from(set)];
  }, [categories]);

  // Filter categories by search and group
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.group_name && c.group_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesGroup =
        selectedGroup === "All" || c.group_name === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [categories, searchQuery, selectedGroup]);

  // Calculate vote progress
  const votedCount = Object.keys(initialUserVotes).length;
  const totalCategories = categories.length;
  const progressPercent = totalCategories > 0 ? (votedCount / totalCategories) * 100 : 0;

  // Platform total votes across all categories
  const totalPlatformVotes = useMemo(() => {
    return Object.values(categoryVotes).reduce((acc, count) => acc + count, 0);
  }, [categoryVotes]);

  return (
    <div>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Realtime Tally Active
            </div>
            {totalPlatformVotes > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold">{totalPlatformVotes.toLocaleString()}</span> votes cast
              </div>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Cast Your Vote
          </h1>
          <p className="text-white/50 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
            Support your favorite matatus, drivers, and crews. Exactly <strong>one vote per category</strong>. All tallies update in real time.
          </p>
        </div>

        {/* Voter Status & Results link */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-amber-400/40 hover:border-amber-400 text-amber-300 hover:text-white bg-amber-400/5 hover:bg-amber-400/10 font-bold focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Link href="/results">
              <BarChart3 className="w-4 h-4 mr-2 text-amber-400" />
              Live Leaderboard
            </Link>
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-medium">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span className="truncate max-w-[140px]">{userEmail}</span>
            </div>
          ) : (
            <Button
              onClick={() => setAuthDialogOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs px-4 focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Sign In to Vote
            </Button>
          )}
        </div>
      </div>

      {/* Voting Progress Banner */}
      <div className="p-6 rounded-2xl bg-[#0c0c0c] border border-white/10 mb-8 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              Your Voting Progress
            </span>
          </div>
          <span className="text-xs font-mono text-white/80 font-semibold">
            {votedCount} of {totalCategories} Categories Voted ({Math.round(progressPercent)}%)
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-white/10" />
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            aria-label="Search categories"
            placeholder="Search categories (e.g. Sound Beast, Route, Best Driver)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-2 focus-visible:ring-white text-sm"
          />
        </div>

        {/* Group Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Category Groups">
          {groups.map((group) => (
            <button
              key={group}
              role="tab"
              aria-selected={selectedGroup === group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-[background-color,color] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                selectedGroup === group
                  ? "bg-amber-400 text-black font-bold shadow-sm"
                  : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/5"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.01]">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No categories found</h3>
          <p className="text-sm text-white/40">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              userVotedNomineeName={initialUserVotes[category.id] ?? null}
              totalVotes={categoryVotes[category.id] ?? 0}
            />
          ))}
        </div>
      )}

      {/* Auth Modal */}
      <VoteAuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onVerified={() => window.location.reload()}
      />
    </div>
  );
}
