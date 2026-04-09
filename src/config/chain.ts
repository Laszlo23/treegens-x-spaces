import { base, baseSepolia, type Chain } from "viem/chains";

/**
 * Set `NEXT_PUBLIC_USE_BASE_MAINNET=true` in `.env` when using a contract deployed to Base mainnet (8453).
 * Omit or false to stay on Base Sepolia (84532) for testing.
 */
export function isBaseMainnetEnv(): boolean {
  return process.env.NEXT_PUBLIC_USE_BASE_MAINNET?.trim() === "true";
}

/** Chain used by Privy, minting, and read-only RPC. */
export function appChain(): Chain {
  return isBaseMainnetEnv() ? base : baseSepolia;
}

/** Human label for the network badge. */
export function appChainLabel(): string {
  return isBaseMainnetEnv() ? "Base" : "Base Sepolia";
}

/** Longer copy for metadata / blurbs. */
export function appNetworkDescription(): string {
  return isBaseMainnetEnv() ? "Base mainnet" : "Base Sepolia";
}

/** Default JSON-RPC URL for the active app chain. */
export function appDefaultRpcUrl(): string {
  if (isBaseMainnetEnv()) {
    return (
      process.env.NEXT_PUBLIC_BASE_MAINNET_RPC?.trim() || "https://mainnet.base.org"
    );
  }
  return process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC?.trim() || "https://sepolia.base.org";
}
