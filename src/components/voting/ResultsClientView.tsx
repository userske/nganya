"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Vote, ArrowRight, Flame, Trophy, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface NomineeData {
  id: string;
  name: string;
  subtitle: string | null;
  categoryId: string;
}

interface CategoryData {
  id: string;
  slug: string;
  name: string;
  group_name: string | null;
  sort_order?: number;
  nominees: NomineeData[];
}

interface ResultsClientViewProps {
  categories: CategoryData[];
  initialCounts: Record<string, number>; // nominee_id -> count
}

export function ResultsClientView({ categories, initialCounts }: ResultsClientViewProps) {
  const [counts, setCounts] = useState<Record<string, number>>(initialCounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"votes" | "order">("votes");
  const [onlyWithVotes, setOnlyWithVotes] = useState<boolean>(false);

  // Groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c.group_name) set.add(c.group_name);
    });
    return ["All", ...Array.from(set)];
  }, [categories]);

  // Realtime subscription + active live polling fallback
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
            map[item.nominee_id] = Number(item.count);
          }
          setCounts((prev) => ({ ...prev, ...map }));
        }
      } catch {
        // Polling failure gracefully ignored
      }
    };

    // Immediate initial sync
    fetchCounts();

    const channel = supabase
      .channel("public-leaderboard-counts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vote_counts",
        },
        (payload: any) => {
          if (!isMounted) return;
          const { nominee_id, count } = payload.new || {};
          if (nominee_id && typeof count === "number") {
            setCounts((prev) => ({
              ...prev,
              [nominee_id]: count,
            }));
          } else {
            fetchCounts();
          }
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

  // Total votes across the entire platform
  const totalVotesAcrossPlatform = useMemo(() => {
    return Object.values(counts).reduce((acc, c) => acc + c, 0);
  }, [counts]);

  // Compute category totals
  const categoryTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of categories) {
      const sum = c.nominees.reduce((acc, n) => acc + (counts[n.id] ?? 0), 0);
      map.set(c.id, sum);
    }
    return map;
  }, [categories, counts]);

  // Count active categories with votes > 0
  const activeCategoriesCount = useMemo(() => {
    let cnt = 0;
    categoryTotals.forEach((total) => {
      if (total > 0) cnt++;
    });
    return cnt;
  }, [categoryTotals]);

  // Filter and sort categories
  const processedCategories = useMemo(() => {
    let list = categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nominees.some(
          (n) =>
            n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (n.subtitle && n.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      const matchesGroup = selectedGroup === "All" || c.group_name === selectedGroup;
      const total = categoryTotals.get(c.id) ?? 0;
      const matchesVoteFilter = !onlyWithVotes || total > 0;

      return matchesSearch && matchesGroup && matchesVoteFilter;
    });

    // Sorting
    return [...list].sort((a, b) => {
      if (sortBy === "votes") {
        const votesA = categoryTotals.get(a.id) ?? 0;
        const votesB = categoryTotals.get(b.id) ?? 0;
        if (votesB !== votesA) {
          return votesB - votesA; // Highest votes first
        }
        return (a.sort_order ?? 999) - (b.sort_order ?? 999);
      } else {
        return (a.sort_order ?? 999) - (b.sort_order ?? 999);
      }
    });
  }, [categories, searchQuery, selectedGroup, onlyWithVotes, sortBy, categoryTotals]);

  return (
    <div className="space-y-8 w-full">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & LIVE TALLY STATUS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Realtime Leaderboard
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            Awards Leaderboard
          </h1>
          <p className="text-white/50 text-xs sm:text-sm mt-2 max-w-xl leading-relaxed">
            Realtime verified tallies updating live as votes are confirmed. Public, transparent,
            and direct across {categories.length} award categories ({activeCategoriesCount} active races).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Total Votes Stat Card */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-right">
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-mono">
              Total Verified Votes
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {totalVotesAcrossPlatform.toLocaleString()}
            </div>
          </div>

          <Button
            asChild
            className="bg-amber-400 hover:bg-amber-300 text-black font-bold h-12 px-5 rounded-xl focus-visible:ring-2 focus-visible:ring-amber-400 text-sm shadow-lg shadow-amber-400/10"
          >
            <Link href="/vote">
              <Vote className="w-4 h-4 mr-2" />
              Cast Your Vote
            </Link>
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH, SORT & FILTERS
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            aria-label="Search leaderboard"
            placeholder="Search leaderboard by category, driver, conductor or fleet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-white/30 rounded-xl focus-visible:ring-2 focus-visible:ring-white text-sm w-full"
          />
        </div>

        {/* View Controls: Sort & Active Races Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Active Races vs All Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyWithVotes(false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                !onlyWithVotes
                  ? "bg-amber-400 text-black font-bold shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              All Categories ({categories.length})
            </button>

            <button
              onClick={() => setOnlyWithVotes(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                onlyWithVotes
                  ? "bg-amber-400 text-black font-bold shadow-sm"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              Active Races Only ({activeCategoriesCount})
            </button>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
            <span className="text-white/40 px-2 font-mono text-[10px] uppercase">Sort by:</span>
            <button
              onClick={() => setSortBy("votes")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                sortBy === "votes"
                  ? "bg-amber-400 text-black font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Trophy className="w-3 h-3" />
              Most Votes First
            </button>
            <button
              onClick={() => setSortBy("order")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                sortBy === "order"
                  ? "bg-amber-400 text-black font-bold"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Layers className="w-3 h-3" />
              Category Order
            </button>
          </div>
        </div>

        {/* Group Filter Tabs */}
        {groups.length > 1 && (
          <div
            className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2"
            role="tablist"
            aria-label="Category Groups"
          >
            {groups.map((group) => (
              <button
                key={group}
                role="tab"
                aria-selected={selectedGroup === group}
                onClick={() => setSelectedGroup(group)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shrink-0 ${
                  selectedGroup === group
                    ? "bg-amber-400 text-black font-bold shadow-sm"
                    : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/5"
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. LEADERBOARD CATEGORY CARDS
      ───────────────────────────────────────────────────────────── */}
      {processedCategories.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0c0c0c] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tight">
            No Categories Found
          </h3>
          <p className="text-white/50 text-xs sm:text-sm max-w-sm mx-auto">
            {onlyWithVotes
              ? "No active categories with votes match your filter."
              : `No category or nominee matches "${searchQuery}".`}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSelectedGroup("All");
              setOnlyWithVotes(false);
            }}
            className="border-white/15 hover:bg-white/5 text-white text-xs h-9 px-4 rounded-xl"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {processedCategories.map((category) => {
            const totalCategoryVotes = categoryTotals.get(category.id) ?? 0;

            // Sort nominees by votes descending
            const sortedNominees = [...category.nominees].sort((a, b) => {
              const votesA = counts[a.id] ?? 0;
              const votesB = counts[b.id] ?? 0;
              return votesB - votesA;
            });

            return (
              <div
                key={category.id}
                className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl border transition-all duration-200 ${
                  totalCategoryVotes > 0
                    ? "bg-[#0d0d0d] border-amber-400/20 shadow-lg shadow-black/40"
                    : "bg-[#090909] border-white/5 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                        {category.name}
                      </h2>
                      {category.group_name && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-semibold bg-white/5 border-white/10 text-white/70 py-0.5 px-2"
                        >
                          {category.group_name}
                        </Badge>
                      )}
                      {totalCategoryVotes > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[10px] font-bold font-mono">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          Live Race
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-white/50 mt-1">
                      {category.nominees.length} Nominees &middot; Total Votes:{" "}
                      <strong
                        className={`font-mono font-bold ${
                          totalCategoryVotes > 0 ? "text-amber-400 text-sm" : "text-white/40"
                        }`}
                      >
                        {totalCategoryVotes.toLocaleString()}
                      </strong>
                    </p>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-white/20 hover:border-amber-400/50 hover:text-amber-300 text-white text-xs hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-amber-400 h-9 px-3.5 rounded-xl shrink-0"
                  >
                    <Link href={`/vote/${category.slug}`}>
                      Vote in this Category
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Link>
                  </Button>
                </div>

                {/* Nominees Ranked List */}
                <div className="space-y-2.5">
                  {sortedNominees.map((nominee, rank) => {
                    const voteCount = counts[nominee.id] ?? 0;
                    const percentage =
                      totalCategoryVotes > 0
                        ? Math.round((voteCount / totalCategoryVotes) * 100)
                        : 0;

                    const isFirst = rank === 0 && voteCount > 0;
                    const isSecond = rank === 1 && voteCount > 0;
                    const isThird = rank === 2 && voteCount > 0;

                    return (
                      <div
                        key={nominee.id}
                        className={`relative p-3.5 sm:p-4 rounded-xl border transition-all duration-150 ${
                          isFirst
                            ? "bg-amber-400/[0.07] border-amber-400/40 shadow-[0_4px_24px_rgba(245,158,11,0.08)]"
                            : isSecond
                            ? "bg-white/[0.04] border-white/15"
                            : isThird
                            ? "bg-white/[0.03] border-white/10"
                            : "bg-white/[0.015] border-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Rank badge */}
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 font-mono ${
                                isFirst
                                  ? "bg-amber-400 text-black font-extrabold shadow-sm shadow-amber-400/30"
                                  : isSecond
                                  ? "bg-slate-300 text-black font-bold"
                                  : isThird
                                  ? "bg-amber-700/80 text-white font-bold"
                                  : "bg-white/5 text-white/40 border border-white/10"
                              }`}
                            >
                              {rank + 1}
                            </div>

                            <div className="min-w-0">
                              <span className="font-bold text-white text-sm sm:text-base truncate block">
                                {nominee.name}
                              </span>
                              {nominee.subtitle && (
                                <span className="text-xs text-white/50 font-mono block truncate">
                                  {nominee.subtitle}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Votes and Percentage */}
                          <div className="text-right shrink-0">
                            <div className="text-sm sm:text-base font-bold text-white font-mono">
                              {voteCount.toLocaleString()} {voteCount === 1 ? "vote" : "votes"}
                            </div>
                            <div className="text-xs text-amber-400/80 font-mono font-semibold">
                              {percentage}%
                            </div>
                          </div>
                        </div>

                        {/* Vote share bar */}
                        <div
                          className="w-full bg-white/5 h-1.5 sm:h-2 rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={percentage}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className={`h-full transition-all duration-500 ease-out ${
                              isFirst
                                ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                : isSecond
                                ? "bg-slate-300"
                                : isThird
                                ? "bg-amber-700"
                                : "bg-white/20"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
