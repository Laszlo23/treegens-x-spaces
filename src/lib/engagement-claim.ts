/**
 * Best-effort client flag so users don't spam engagement mints from the same wallet.
 * Not enforced on-chain; clearable via devtools.
 */

const STORAGE_KEY = "treegens_engagement_award_claimed_v1";

function loadMap(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const p = JSON.parse(raw) as Record<string, string>;
    return typeof p === "object" && p !== null ? p : {};
  } catch {
    return {};
  }
}

function saveMap(m: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
}

export function hasClaimedEngagementAward(walletAddress: string): boolean {
  const key = walletAddress.toLowerCase();
  return Boolean(loadMap()[key]);
}

export function markEngagementAwardClaimed(walletAddress: string, tokenId: string) {
  const key = walletAddress.toLowerCase();
  const m = loadMap();
  m[key] = tokenId;
  saveMap(m);
}

export function getClaimedEngagementTokenId(walletAddress: string): string | null {
  const key = walletAddress.toLowerCase();
  return loadMap()[key] ?? null;
}
