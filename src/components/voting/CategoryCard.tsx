"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Users, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryCardProps {
  category: {
    id: string;
    slug: string;
    name: string;
    group_name: string | null;
    nominees_count?: number;
  };
  userVotedNomineeName?: string | null;
  totalVotes?: number;
}

export function CategoryCard({ category, userVotedNomineeName, totalVotes = 0 }: CategoryCardProps) {
  const isVoted = Boolean(userVotedNomineeName);

  return (
    <Link
      href={`/vote/${category.slug}`}
      className={`group relative block p-6 rounded-2xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.99] ${
        isVoted
          ? "bg-[#0b1712] border-emerald-500/40 hover:border-emerald-500 shadow-[0_4px_24px_rgba(16,185,129,0.08)]"
          : "bg-[#0c0c0c] border-white/10 hover:border-amber-400/40 hover:bg-[#121212] hover:shadow-[0_4px_24px_rgba(245,158,11,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        {category.group_name && (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold uppercase tracking-wider bg-amber-400/10 border-amber-400/25 text-amber-300 py-0.5 px-2.5 rounded-full"
          >
            {category.group_name}
          </Badge>
        )}

        <div className="flex items-center gap-2">
          {totalVotes > 0 && (
            <span className="text-[11px] font-mono text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <BarChart2 className="w-3 h-3 text-amber-400" />
              {totalVotes.toLocaleString()} {totalVotes === 1 ? "vote" : "votes"}
            </span>
          )}

          {isVoted ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Voted
            </span>
          ) : (
            <span className="text-xs text-white/50 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-white/40" />
              {category.nominees_count ?? "Multiple"} Nominees
            </span>
          )}
        </div>
      </div>

      <h3 className="text-lg font-bold text-white transition-colors line-clamp-2 mb-2 group-hover:text-amber-300">
        {category.name}
      </h3>

      {isVoted ? (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/40">Your Vote:</span>
          <span className="font-semibold text-emerald-300 truncate max-w-[180px]">
            {userVotedNomineeName}
          </span>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50 group-hover:text-white transition-colors">
          <span>Cast Your Vote</span>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </Link>
  );
}
