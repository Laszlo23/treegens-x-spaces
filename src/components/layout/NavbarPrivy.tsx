"use client";

import Image from "next/image";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { BrowserProvider, formatEther } from "ethers";
import { useEffect, useState } from "react";
import { appChain, appChainLabel } from "@/config/chain";
import { cn } from "@/lib/cn";
import { pickEthereumWallet, walletChainIdNumber } from "@/lib/privy-wallet";

function WalletBalance() {
  const { authenticated, ready } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const [eth, setEth] = useState<string | null>(null);

  const wallet = pickEthereumWallet(wallets);

  useEffect(() => {
    if (!ready || !walletsReady || !authenticated || !wallet) {
      setEth(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const eip1193 = await wallet.getEthereumProvider();
        const p = new BrowserProvider(eip1193);
        const b = await p.getBalance(wallet.address);
        if (!cancelled) setEth(formatEther(b));
      } catch {
        if (!cancelled) setEth(null);
      }
    })();
    const t = setInterval(() => {
      (async () => {
        try {
          const eip1193 = await wallet.getEthereumProvider();
          const p = new BrowserProvider(eip1193);
          const b = await p.getBalance(wallet.address);
          setEth(formatEther(b));
        } catch {
          /* ignore */
        }
      })();
    }, 12000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [ready, walletsReady, authenticated, wallet]);

  if (!authenticated || !wallet) return null;

  return (
    <div className="hidden items-center gap-2 text-xs sm:flex">
      <span className="rounded-full border border-emerald-500/30 bg-emerald-950/50 px-2 py-1 font-mono text-emerald-200/90">
        {eth !== null ? `${Number(eth).toFixed(4)} ETH` : "…"}
      </span>
    </div>
  );
}

function NetworkHint() {
  const { authenticated, ready } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const wallet = pickEthereumWallet(wallets);

  if (!ready || !walletsReady || !authenticated || !wallet) return null;

  const target = appChain().id;
  const wrong = walletChainIdNumber(wallet) !== target;
  if (!wrong) {
    return (
      <span className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-emerald-400">
        {appChainLabel()}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={() => wallet.switchChain(target)}
      className={cn(
        "animate-pulse rounded-full border border-amber-500/50 bg-amber-950/60 px-2 py-0.5 text-[10px] text-amber-100",
        "transition hover:bg-amber-900/80"
      )}
    >
      Switch to {appChainLabel()}
    </button>
  );
}

function AuthButtons() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const wallet = pickEthereumWallet(wallets);

  if (!ready || !walletsReady) {
    return (
      <span className="text-xs text-zinc-500" aria-live="polite">
        Loading…
      </span>
    );
  }

  if (!authenticated) {
    return (
      <button
        type="button"
        onClick={() => login()}
        className="rounded-full bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-900/30"
      >
        Log in
      </button>
    );
  }

  const addr = wallet?.address ?? user?.wallet?.address;
  const fc = user?.farcaster;
  const label = fc?.username
    ? `@${fc.username}`
    : addr
      ? `${addr.slice(0, 6)}…${addr.slice(-4)}`
      : "Connected";

  return (
    <div className="flex items-center gap-2">
      <span className="max-w-[140px] truncate text-xs text-zinc-400 md:max-w-[200px]" title={addr ?? undefined}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-full border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:border-emerald-500/40 hover:text-white"
      >
        Log out
      </button>
    </div>
  );
}

/** Navbar when Privy is configured (wrapped by PrivyProvider). */
export function NavbarPrivy() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-500/15 bg-zinc-950/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <NavbarBrand />
        <div className="flex items-center gap-2 md:gap-3">
          <NetworkHint />
          <WalletBalance />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}

export function NavbarBrand() {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Image
        src="/uf4apw1v_400x400.jpg"
        alt="Treegens"
        width={400}
        height={400}
        className="h-9 w-9 shrink-0 rounded-2xl object-cover shadow-[0_0_24px_rgba(213,226,107,0.38)] ring-1 ring-emerald-500/25"
        priority
      />
      <div className="min-w-0">
        <p className="font-display truncate text-base font-semibold tracking-tight text-zinc-100 md:text-lg">
          Treegens{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
            Voice Seeds
          </span>
        </p>
        <p className="truncate text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Forest DAO · Base · Privy
        </p>
      </div>
    </div>
  );
}
