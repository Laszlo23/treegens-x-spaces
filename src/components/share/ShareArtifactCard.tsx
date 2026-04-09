"use client";

/**
 * Collectible-style share card surfaced after mint — also used as a visual template
 * aligned with OG images on the /share/[tokenId] route.
 */

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function ShareArtifactCard(props: {
  speaker: string;
  quote: string;
  audioUrl: string;
  mintUrl: string;
  className?: string;
}) {
  const { speaker, quote, audioUrl, mintUrl, className } = props;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-zinc-950 via-emerald-950/80 to-zinc-950 p-6 shadow-[0_0_60px_rgba(192,202,94,0.14),inset_0_1px_0_rgba(255,255,255,0.06)]",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_top,_rgba(213,226,107,0.14),_transparent_55%)]",
        className
      )}
    >
      <div className="relative z-10">
        <p className="text-[10px] uppercase tracking-[0.35em] text-emerald-500/90">Voice Seed</p>
        <h3 className="mt-2 font-display text-2xl font-semibold text-emerald-50">{speaker}</h3>
        <blockquote className="mt-4 border-l-2 border-emerald-500/50 pl-4 text-sm italic leading-relaxed text-zinc-300">
          “{quote}”
        </blockquote>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <audio controls src={audioUrl} className="h-9 max-w-full flex-1 opacity-90" />
        </div>
        <a
          href={mintUrl}
          className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-emerald-400 underline-offset-4 hover:text-emerald-300 hover:underline"
        >
          Open mint / share page →
        </a>
      </div>
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/20 blur-2xl"
        aria-hidden
      />
    </motion.div>
  );
}
