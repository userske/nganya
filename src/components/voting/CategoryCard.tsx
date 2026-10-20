"use client";

import Link from "next/link";
import { CheckCircle2, ChevronRight, Users } from "lucide-react";
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
      className={`group relative block p-6 rounded-2xl transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white active:scale-[0.99] ${
        isVoted
          ? "bg-white/[0.06] border-white/30 hover:border-white/50 shadow-[0_4px_24px_rgba(255,255,255,0.04)]"
          : "bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.05] hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        {category.group_name && (
          <Badge
            variant="outline"
            className="text-[11px] font-semibold uppercase tracking-wider bg-white/5 border-white/10 text-white/70 py-0.5 px-2.5 rounded-full"
          >
            {category.group_name}
          </Badge>
        )}

        {isVoted ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 border border-white/20 px-2.5 py-1 rounded-full">
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

      <h3 className="text-lg font-bold text-white transition-colors line-clamp-2 mb-2">
        {category.name}
      </h3>

      {isVoted ? (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-white/40">Your Vote:</span>
          <span className="font-semibold text-white truncate max-w-[180px]">
            {userVotedNomineeName}
          </span>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50 group-hover:text-white transition-colors">
          <span>Cast Your Vote</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      )}
    </Link>
  );
}
