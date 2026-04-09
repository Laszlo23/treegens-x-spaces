"use client";

import { NavbarBrand, NavbarPrivy } from "@/components/layout/NavbarPrivy";

/**
 * Renders Privy-powered auth only when `NEXT_PUBLIC_PRIVY_APP_ID` is set (see Web3Provider).
 * Avoids calling Privy hooks during static generation when the provider is absent.
 */
export function Navbar() {
  const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim());

  if (!hasPrivy) {
    return (
      <header className="sticky top-0 z-50 border-b border-emerald-500/15 bg-zinc-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <NavbarBrand />
          <span className="text-xs text-zinc-500">Configure Privy to enable login</span>
        </div>
      </header>
    );
  }

  return <NavbarPrivy />;
}
