"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Trophy, Users } from "lucide-react";
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
}

export function CategoryCard({ category, userVotedNomineeName }: CategoryCardProps) {
  const isVoted = Boolean(userVotedNomineeName);

  return (
    <Link
      href={`/vote/${category.slug}`}
      className={`group relative block p-6 rounded-2xl transition-all duration-300 border ${
        isVoted
          ? "bg-[#0b1622]/80 border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
          : "bg-white/[0.03] border-white/10 hover:border-amber-500/40 hover:bg-white/[0.05] hover:shadow-[0_0_25px_rgba(245,158,11,0.08)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        {category.group_name && (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold uppercase tracking-wider bg-white/5 border-white/10 text-amber-400/90 py-0.5 px-2.5 rounded-full"
          >
            {category.group_name}
          </Badge>
        )}

        {isVoted ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Voted
          </span>
        ) : (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {category.nominees_count ?? "Multiple"} Nominees
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
        {category.name}
      </h3>

      {isVoted ? (
        <div className="mt-4 pt-3 border-t border-emerald-500/15 flex items-center justify-between text-xs">
          <span className="text-slate-400">Your Vote:</span>
          <span className="font-bold text-emerald-400 truncate max-w-[180px]">
            {userVotedNomineeName}
          </span>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-amber-400 transition-colors">
          <span>Cast Your Vote</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </Link>
  );
}
