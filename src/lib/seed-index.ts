/**
 * Client-side index of minted Voice Seeds (complements on-chain events when no indexer exists).
 * Merges localStorage with optional on-chain event scans.
 */

import type { VoiceSeedMetadata } from "./metadata";

const STORAGE_KEY = "treegens_voice_seeds_v1";

export type IndexedSeed = {
  tokenId: string;
  tokenURI?: string;
  owner?: string;
  metadata?: VoiceSeedMetadata | null;
  /** Cached for leaderboard / gallery when metadata fetch fails */
  speaker?: string;
  spaceTitle?: string;
};

export function loadLocalSeeds(): IndexedSeed[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IndexedSeed[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSeeds(seeds: IndexedSeed[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
}

export function upsertLocalSeed(entry: IndexedSeed) {
  const cur = loadLocalSeeds();
  const idx = cur.findIndex((s) => s.tokenId === entry.tokenId);
  if (idx >= 0) cur[idx] = { ...cur[idx], ...entry };
  else cur.unshift(entry);
  saveLocalSeeds(cur);
}

export function mergeSeedsUnique(a: IndexedSeed[], b: IndexedSeed[]): IndexedSeed[] {
  const map = new Map<string, IndexedSeed>();
  for (const x of [...a, ...b]) {
    const prev = map.get(x.tokenId);
    map.set(x.tokenId, prev ? { ...prev, ...x } : x);
  }
  return Array.from(map.values()).sort((p, q) =>
    BigInt(q.tokenId) > BigInt(p.tokenId) ? 1 : BigInt(q.tokenId) < BigInt(p.tokenId) ? -1 : 0
  );
}
