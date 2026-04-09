"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { getVoiceSeedAddress } from "@/lib/contract";
import { loadMergedSeeds } from "@/lib/seeds-loader";
import type { IndexedSeed } from "@/lib/seed-index";
import { cn } from "@/lib/cn";

type GalleryTabProps = {
  /** Compact header when shown inside Profile. */
  embedded?: boolean;
};

export function GalleryTab({ embedded = false }: GalleryTabProps) {
  const [seeds, setSeeds] = useState<IndexedSeed[]>([]);
  const [syncing, setSyncing] = useState(false);

  const refresh = useCallback(async () => {
    setSyncing(true);
    try {
      const merged = await loadMergedSeeds();
      setSeeds(merged);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addr = getVoiceSeedAddress();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-emerald-100">
            {embedded ? "Your seeds" : "Voice Seeds gallery"}
          </h2>
          <p className="text-sm text-zinc-500">
            {embedded
              ? "Artifacts you’ve minted — audio, speaker, space."
              : "Glowing seeds — audio, speaker, space, owner."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={syncing}
          className="rounded-full border border-emerald-500/40 px-4 py-1.5 text-xs text-emerald-200 hover:bg-emerald-950/50 disabled:opacity-50"
        >
          {syncing ? "Syncing…" : "Refresh"}
        </button>
      </div>

      {!addr && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-950/40 p-4 text-sm text-amber-100">
          Deploy the contract and set <code className="text-emerald-300">NEXT_PUBLIC_VOICE_SEED_CONTRACT_ADDRESS</code>.
        </p>
      )}

      {seeds.length === 0 && !syncing && (
        <p className="text-center text-sm text-zinc-500">
          No Voice Seeds yet — mint from the Tasks tab.
        </p>
      )}

      <ul className="grid gap-5 sm:grid-cols-2">
        {seeds.map((seed, i) => (
          <motion.li
            key={seed.tokenId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-zinc-900/50 p-5",
              "shadow-[0_0_40px_rgba(192,202,94,0.1)] transition-all duration-300",
              "hover:-translate-y-1 hover:border-emerald-400/45 hover:shadow-[0_0_50px_rgba(213,226,107,0.2)]"
            )}
          >
            <div
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/15 blur-2xl transition group-hover:bg-emerald-400/25"
              aria-hidden
            />
            <div className="relative z-10">
              {seed.metadata?.image && (
                <div className="mb-4 overflow-hidden rounded-xl border border-emerald-500/20 bg-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URIs & IPFS */}
                  <img
                    src={seed.metadata.image}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                </div>
              )}
              <p className="font-mono text-xs text-emerald-500/80">#{seed.tokenId}</p>
              <h3 className="mt-1 font-display text-lg text-zinc-50">
                {seed.metadata?.name || `Voice Seed #${seed.tokenId}`}
              </h3>
              <p className="mt-1 text-sm text-emerald-200/90">
                Speaker:{" "}
                <span className="text-zinc-200">{seed.speaker || "—"}</span>
              </p>
              <p className="text-sm text-zinc-500">
                Space:{" "}
                <span className="text-zinc-400">{seed.spaceTitle || "—"}</span>
              </p>
              <p className="mt-1 truncate font-mono text-xs text-zinc-600">
                Owner: {seed.owner || "—"}
              </p>
              {seed.metadata?.animation_url && (
                <audio
                  controls
                  src={seed.metadata.animation_url}
                  className="mt-4 w-full opacity-90"
                />
              )}
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
