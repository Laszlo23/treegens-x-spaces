"use client";

import { CaptureTabPrivy } from "@/components/capture/CaptureTabPrivy";

export function CaptureTab() {
  const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID?.trim());

  if (!hasPrivy) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-6 text-sm text-amber-100">
        Add <code className="rounded bg-black/30 px-1">NEXT_PUBLIC_PRIVY_APP_ID</code> to enable Privy login and
        minting.
      </div>
    );
  }

  return <CaptureTabPrivy />;
}
