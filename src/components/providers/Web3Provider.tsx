"use client";

/**
 * Privy: Farcaster login, external wallets, and embedded Ethereum wallets on Base (Sepolia or mainnet).
 * Enable **Farcaster** + **Wallet** (and embedded wallets) in the Privy Dashboard for this app.
 */

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";
import { appChain } from "@/config/chain";

export function Web3Provider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim();

  if (!appId) {
    return (
      <>
        <div className="border-b border-amber-500/40 bg-amber-950/80 px-4 py-2 text-center text-sm text-amber-100">
          Set{" "}
          <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_PRIVY_APP_ID</code> from{" "}
          <a
            href="https://dashboard.privy.io"
            className="text-emerald-400 underline"
            target="_blank"
            rel="noreferrer"
          >
            dashboard.privy.io
          </a>{" "}
          (enable Farcaster + wallet login).
        </div>
        {children}
      </>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        defaultChain: appChain(),
        supportedChains: [appChain()],
        loginMethods: ["farcaster", "wallet"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        appearance: {
          theme: "dark",
          accentColor: "#d5e26b",
          loginMessage: "Treegens Voice Seeds — Farcaster or wallet",
          showWalletLoginFirst: false,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
