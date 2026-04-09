import type { IndexedSeed } from "@/lib/seed-index";
import { isEngagementAwardMetadata } from "@/lib/engagement-metadata";

export type CollectorRow = {
  /** Normalized lowercase address */
  address: string;
  /** Voice Seeds owned (excludes engagement-award NFTs from the count) */
  count: number;
};

/** Top N collectors eligible for engagement awards (default used by UI). */
export const ENGAGEMENT_TOP_COLLECTORS = 10;

/**
 * Ranks wallet addresses by how many Voice Seeds they hold in the merged index.
 * Engagement-award mints are excluded from counts so awards don't inflate rank.
 */
export function rankCollectors(seeds: IndexedSeed[]): CollectorRow[] {
  const map = new Map<string, number>();
  for (const s of seeds) {
    if (!s.owner) continue;
    if (isEngagementAwardMetadata(s.metadata ?? undefined)) continue;
    const a = s.owner.toLowerCase();
    map.set(a, (map.get(a) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([address, count]) => ({ address, count }))
    .sort((x, y) => y.count - x.count || x.address.localeCompare(y.address));
}

/** 1-based rank, or null if address not in list / has zero qualifying seeds. */
export function collectorRankForAddress(
  ranked: CollectorRow[],
  address: string | undefined
): number | null {
  if (!address) return null;
  const key = address.toLowerCase();
  const i = ranked.findIndex((r) => r.address === key);
  if (i < 0) return null;
  return i + 1;
}

export function isEligibleForEngagementAward(rank: number | null): boolean {
  return rank !== null && rank >= 1 && rank <= ENGAGEMENT_TOP_COLLECTORS;
}
