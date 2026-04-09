"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { GalleryTab } from "@/components/gallery/GalleryTab";
import { pickEthereumWallet } from "@/lib/privy-wallet";
import { cn } from "@/lib/cn";

function ProfileSummary() {
  const { ready, authenticated, login, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const wallet = pickEthereumWallet(wallets);
  const addr = wallet?.address ?? user?.wallet?.address;

  if (!ready || !walletsReady) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-sm text-zinc-500">
        Loading profile…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-zinc-900/80 to-emerald-950/25 p-6 text-center"
      >
        <p className="text-sm text-zinc-400">Log in to see your Farcaster or wallet identity and your seeds.</p>
        <button
          type="button"
          onClick={() => login()}
          className="mt-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-900/30"
        >
          Log in
        </button>
      </motion.div>
    );
  }

  const fc = user?.farcaster;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-emerald-500/25",
        "bg-gradient-to-br from-zinc-900/90 via-zinc-950/80 to-emerald-950/30 p-5 shadow-[0_0_40px_rgba(192,202,94,0.1)]"
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        {fc?.pfp ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Farcaster avatar
          <img
            src={fc.pfp}
            alt=""
            className="h-16 w-16 shrink-0 rounded-2xl border border-emerald-500/30 object-cover shadow-lg"
          />
        ) : (
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 font-display text-xl font-bold text-emerald-200"
            aria-hidden
          >
            {(fc?.displayName || addr || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-zinc-50">
            {fc?.displayName || "Voice collector"}
          </p>
          {fc?.username && (
            <p className="text-sm text-emerald-400/95">
              @{fc.username}
            </p>
          )}
          {addr && (
            <p className="mt-1 truncate font-mono text-xs text-zinc-500" title={addr}>
              {addr.slice(0, 6)}…{addr.slice(-4)}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ProfileTab() {
  const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim());

  if (!hasPrivy) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-6 text-sm text-amber-100">
        Add <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_PRIVY_APP_ID</code> to enable profile and minting.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-lg font-semibold text-emerald-100">Profile</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Your identity and every Voice Seed this browser has seen (indexed from your mints and chain events).
        </p>
      </div>
      <ProfileSummary />
      <div className="border-t border-emerald-500/10 pt-2">
        <GalleryTab embedded />
      </div>
    </div>
  );
}
