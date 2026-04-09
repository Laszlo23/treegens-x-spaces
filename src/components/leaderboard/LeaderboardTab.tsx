"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SAMPLE_LEADERBOARD_ROWS } from "@/lib/community-sample";
import { rankSpeakers } from "@/lib/leaderboard";
import { loadMergedSeeds } from "@/lib/seeds-loader";

export function LeaderboardTab() {
  const [rows, setRows] = useState<{ speaker: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const seeds = await loadMergedSeeds();
        if (!cancelled) setRows(rankSpeakers(seeds));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-emerald-100">Leaderboard</h2>
        <p className="text-sm text-zinc-500">
          Speakers ranked by how often they appear as the <span className="text-zinc-400">Speaker</span> field
          in minted Voice Seed metadata (local + chain index), not X metrics.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading ranks…</p>
      ) : rows.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-zinc-600/80 bg-zinc-950/40 p-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Example preview (not live data)</p>
            <p className="mt-1 text-sm text-zinc-500">
              When the community mints, real rows replace this. Names below are illustrative only.
            </p>
            <ol className="mt-4 space-y-2">
              {SAMPLE_LEADERBOARD_ROWS.map((r, i) => (
                <li
                  key={r.speaker}
                  className="flex items-center justify-between rounded-xl border border-zinc-700/60 bg-zinc-900/40 px-4 py-3 opacity-90"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-zinc-400">
                      {i + 1}
                    </span>
                    <span className="font-medium text-zinc-400">{r.speaker}</span>
                  </span>
                  <span className="font-mono text-sm text-zinc-500">{r.count} seeds</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="text-sm text-zinc-500">
            No indexed mints yet — complete a mint from <span className="text-emerald-400/90">Tasks</span> to
            populate real rankings.
          </p>
        </div>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <motion.li
              key={r.speaker}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-zinc-900/50 px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-300">
                  {i + 1}
                </span>
                <span className="font-medium text-zinc-200">{r.speaker}</span>
              </span>
              <span className="font-mono text-emerald-400/90">{r.count} seeds</span>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  );
}
