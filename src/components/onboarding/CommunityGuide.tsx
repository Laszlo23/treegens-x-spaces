"use client";

import { COMMUNITY_STEPS } from "@/lib/community-sample";
import { cn } from "@/lib/cn";

export function CommunityGuide({ className }: { className?: string }) {
  return (
    <details
      className={cn(
        "group rounded-2xl border border-emerald-500/20 bg-zinc-900/35 backdrop-blur-sm open:bg-zinc-900/45",
        className
      )}
    >
      <summary className="cursor-pointer list-none px-4 py-3 pr-10 text-sm font-medium text-emerald-200/95 md:px-5 md:py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center justify-between gap-3">
          <span>New here? How Treegens works</span>
          <span
            className="text-xs font-normal text-zinc-500 transition group-open:rotate-180"
            aria-hidden
          >
            ▼
          </span>
        </span>
      </summary>
      <ol className="space-y-3 border-t border-emerald-500/10 px-4 pb-4 pt-3 text-sm leading-relaxed text-zinc-400 md:px-5">
        {COMMUNITY_STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-semibold text-emerald-400">
              {i + 1}
            </span>
            <span>
              <span className="font-medium text-zinc-200">{step.title}</span>
              {" — "}
              {step.body}
            </span>
          </li>
        ))}
      </ol>
    </details>
  );
}
