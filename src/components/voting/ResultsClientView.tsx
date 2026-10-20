"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Trophy,
  Flame,
  Search,
  Sparkles,
  BarChart2,
  Medal,
  RefreshCw,
  Vote,
  Ticket,
} from "lucide-react";
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
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLiveActive, setIsLiveActive] = useState(true);

  // Groups
  const groups = useMemo(() => {
    const set = new Set<string>();
    categories.forEach((c) => {
      if (c.group_name) set.add(c.group_name);
    });
    return ["All", ...Array.from(set)];
  }, [categories]);

  // Realtime subscription + 5-second polling fallback
  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

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
          const { nominee_id, count } = payload.new;
          if (nominee_id && typeof count === "number") {
            setCounts((prev) => ({
              ...prev,
              [nominee_id]: count,
            }));
            setLastUpdated(new Date());
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsLiveActive(true);
        }
      });

    const interval = setInterval(async () => {
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
          setLastUpdated(new Date());
        }
      } catch {
        // Polling failure gracefully ignored
      }
    }, 5000);

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

  // Filter categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nominees.some(
          (n) =>
            n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (n.subtitle && n.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
        );

      const matchesGroup = selectedGroup === "All" || c.group_name === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [categories, searchQuery, selectedGroup]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Realtime Leaderboard
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase">
            AWARDS LEADERBOARD
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            Live, tamper-proof tallies updating as votes are confirmed. Public, transparent, and direct.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Total Votes Stat Card */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-right">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">
              Total Verified Votes
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
              {totalVotesAcrossPlatform.toLocaleString()}
            </div>
          </div>

          <Button
            asChild
            className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold h-12 rounded-xl"
          >
            <Link href="/vote">
              <Vote className="w-4 h-4 mr-2" />
              Cast Your Vote
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search leaderboard by category or nominee name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-amber-500/50 text-sm"
          />
        </div>

        {/* Group Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {groups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-[background-color,color,box-shadow] duration-150 ease-out active:scale-[0.96] ${
                selectedGroup === group
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold"
                  : "bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Category Cards */}
      <div className="space-y-8">
        {filteredCategories.map((category) => {
          // Calculate category total votes
          const totalCategoryVotes = category.nominees.reduce(
            (acc, n) => acc + (counts[n.id] ?? 0),
            0
          );

          // Sort nominees by votes descending
          const sortedNominees = [...category.nominees].sort((a, b) => {
            const votesA = counts[a.id] ?? 0;
            const votesB = counts[b.id] ?? 0;
            return votesB - votesA;
          });

          return (
            <div
              key={category.id}
              className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {category.name}
                    </h2>
                    {category.group_name && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold bg-white/5 border-white/10 text-amber-400/90 py-0.5 px-2"
                      >
                        {category.group_name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {category.nominees.length} Nominees • Total Votes:{" "}
                    <strong className="text-amber-400 font-mono">
                      {totalCategoryVotes.toLocaleString()}
                    </strong>
                  </p>
                </div>

                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs"
                >
                  <Link href={`/vote/${category.slug}`}>
                    Vote in this Category &rarr;
                  </Link>
                </Button>
              </div>

              {/* Nominees Ranked List */}
              <div className="space-y-3">
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
                      className={`relative p-4 rounded-xl border transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
                        isFirst
                          ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                          : "bg-white/[0.02] border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank badge */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 font-mono ${
                              isFirst
                                ? "bg-amber-500 text-black font-extrabold"
                                : isSecond
                                ? "bg-slate-300 text-slate-900"
                                : isThird
                                ? "bg-amber-700 text-amber-100"
                                : "bg-white/5 text-slate-400 border border-white/10"
                            }`}
                          >
                            {rank + 1}
                          </div>

                          <div className="min-w-0">
                            <span className="font-bold text-white text-base truncate block">
                              {nominee.name}
                            </span>
                            {nominee.subtitle && (
                              <span className="text-xs text-amber-400/80 font-mono block">
                                {nominee.subtitle}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Votes and Percentage */}
                        <div className="text-right shrink-0">
                          <div className="text-sm sm:text-base font-extrabold text-white font-mono">
                            {voteCount.toLocaleString()} votes
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            {percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Vote share bar */}
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-[width] duration-500 ease-out ${
                            isFirst
                              ? "bg-gradient-to-r from-amber-500 to-yellow-300"
                              : "bg-amber-500/50"
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
    </div>
  );
}
