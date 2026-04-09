"use client";

import { motion } from "framer-motion";
import { useSpaceParticipation } from "@/components/providers/SpaceParticipationProvider";
import { useSpaceSession } from "@/components/providers/SpaceSessionProvider";
import { cn } from "@/lib/cn";
import { SAMPLE_SPACE_URL } from "@/lib/community-sample";
import { formatParticipationClock } from "@/lib/participation";
import type { SpaceEngagement } from "@/lib/spaces";

const EMOTION_ROWS: { key: keyof SpaceEngagement["reactions"]; label: string; emoji: string }[] = [
  { key: "fire", label: "Fire", emoji: "🔥" },
  { key: "clap", label: "Clap", emoji: "👏" },
  { key: "laugh", label: "Laugh", emoji: "😂" },
  { key: "thinking", label: "Hmm", emoji: "🤔" },
];

function EngagementPanel({
  engagement,
  liveFromXApi,
}: {
  engagement: SpaceEngagement;
  liveFromXApi: boolean;
}) {
  const { hearts, reactions, totalTaps } = engagement;

  return (
    <div className="mt-6 border-t border-emerald-500/10 pt-4">
      <p className="text-xs uppercase tracking-widest text-zinc-500">Space engagement</p>
      <p className="mt-1 text-xs text-zinc-600">
        {liveFromXApi
          ? "Title, host, and speakers come from the X API. Per-emoji reaction counts are not exposed by X — the split below is a visual estimate scaled from live listener count."
          : "Total reaction taps for this session — numbers are simulated for demo (e.g. a busy Space might show tens of thousands of taps once wired to X)."}
      </p>

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 flex flex-wrap items-end gap-4"
      >
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-950/50 to-zinc-950/80 px-5 py-4 shadow-[0_0_40px_rgba(244,63,94,0.12)]">
          <p className="text-[10px] uppercase tracking-wider text-rose-300/90">Hearts</p>
          <p className="font-display text-3xl font-bold tabular-nums text-rose-100">
            {hearts.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">❤️ taps</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/25 bg-zinc-950/60 px-5 py-4">
          <p className="text-[10px] uppercase tracking-wider text-emerald-400/90">All emotions</p>
          <p className="font-display text-3xl font-bold tabular-nums text-emerald-50">
            {totalTaps.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-zinc-500">total taps</p>
        </div>
      </motion.div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {EMOTION_ROWS.map((row, i) => (
          <motion.li
            key={row.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            className="flex items-center justify-between rounded-xl border border-zinc-800/90 bg-black/25 px-3 py-2.5"
          >
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="text-lg" aria-hidden>
                {row.emoji}
              </span>
              {row.label}
            </span>
            <span className="font-mono text-sm tabular-nums text-emerald-400/95">
              {reactions[row.key].toLocaleString()}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function ParticipationCard() {
  const {
    isParticipating,
    activeMs,
    eligibleToMint,
    requiredMs,
    joinSession,
    leaveSession,
  } = useSpaceParticipation();

  const progress = Math.min(100, (activeMs / requiredMs) * 100);
  const remainingMs = Math.max(0, requiredMs - activeMs);
  const remainingLabel =
    eligibleToMint ? "Unlocked" : `${formatParticipationClock(remainingMs)} left`;

  return (
    <div className="mt-6 border-t border-emerald-500/10 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Participation</p>
          <p className="mt-1 text-sm text-zinc-400">
            Stay on this tab with the Space loaded for{" "}
            <span className="text-emerald-400/90">15 minutes</span> (visible time only) to unlock minting
            a Voice Seed for this session.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isParticipating ? (
            <button
              type="button"
              onClick={joinSession}
              className="rounded-xl bg-emerald-600/90 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500"
            >
              Join session
            </button>
          ) : (
            <button
              type="button"
              onClick={leaveSession}
              className="rounded-xl border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Pause
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-zinc-500">
          <span className="tabular-nums">
            {formatParticipationClock(activeMs)} / {formatParticipationClock(requiredMs)}
          </span>
          <span
            className={cn(
              "font-medium tabular-nums",
              eligibleToMint ? "text-emerald-400" : "text-zinc-400"
            )}
          >
            {remainingLabel}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {eligibleToMint && (
        <p className="mt-3 text-sm text-emerald-400/95">
          Mint is unlocked — open <span className="font-medium">Tasks</span> to mint your NFT.
        </p>
      )}
    </div>
  );
}

export function LiveSpaceTab() {
  const { spaceUrl, setSpaceUrl, meta, loading, error, loadFromUrl } = useSpaceSession();

  const loadSample = () => {
    void loadFromUrl(SAMPLE_SPACE_URL);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/30 p-4 md:p-5">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Quick demo</p>
        <p className="mt-2 text-sm text-zinc-400">
          Load a sample Space to see mock title, host, reaction breakdown, and speaker list — same shape as a
          future live API response.
        </p>
        <button
          type="button"
          onClick={loadSample}
          disabled={loading}
          className="mt-3 rounded-xl border border-emerald-500/35 bg-emerald-950/25 px-4 py-2 text-sm font-medium text-emerald-200/95 hover:bg-emerald-950/40 disabled:opacity-50"
        >
          {loading ? "Loading…" : "Load sample Space"}
        </button>
      </div>

      <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/40 p-5 shadow-[inset_0_1px_0_rgba(213,226,107,0.1)] backdrop-blur-sm md:p-8">
        <h2 className="font-display text-lg font-semibold text-emerald-100">Space</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Paste a Space URL. With{" "}
          <span className="text-emerald-400/90">X_API_BEARER_TOKEN</span> (or{" "}
          <span className="text-zinc-400">TWITTER_BEARER_TOKEN</span>) in server env, title and speakers load
          from the X API; otherwise you get deterministic demo data.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            value={spaceUrl}
            onChange={(e) => setSpaceUrl(e.target.value)}
            placeholder="https://x.com/i/spaces/1zqKVPRPEVPJB"
            className="min-w-0 flex-1 rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadFromUrl()}
            disabled={loading}
            className={cn(
              "rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-900/40",
              "disabled:opacity-50"
            )}
          >
            {loading ? "Loading…" : "Fetch Space"}
          </motion.button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {meta && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-zinc-900/90 to-emerald-950/30 p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-emerald-500/80">Space</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-zinc-50">{meta.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">
                Host:{" "}
                <span className="text-emerald-300">
                  {meta.host.displayName} (@{meta.host.handle})
                </span>
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-600">id: {meta.id}</p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-black/20 px-3 py-1 text-xs text-emerald-200/80">
              {meta.isMock ? "Demo metadata" : "X API"}
            </span>
          </div>

          <EngagementPanel engagement={meta.engagement} liveFromXApi={!meta.isMock} />

          <ParticipationCard />

          <div className="mt-6 border-t border-emerald-500/10 pt-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Participants</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {meta.participants.map((p, idx) => (
                <li
                  key={`${p.handle}-${idx}`}
                  className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-black/20 px-3 py-2 text-sm text-zinc-300"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#d5e26b]" />
                  {p.displayName}{" "}
                  <span className="text-zinc-500">@{p.handle}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
