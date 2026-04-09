import { isEngagementAwardMetadata } from "@/lib/engagement-metadata";
import type { IndexedSeed } from "./seed-index";
import type { VoiceSeedMetadata } from "./metadata";

function speakerFromMetadata(m: VoiceSeedMetadata | null | undefined): string | undefined {
  if (!m?.attributes) return undefined;
  const a = m.attributes.find((x) => x.trait_type === "Speaker");
  return a?.value;
}

export function rankSpeakers(seeds: IndexedSeed[]): { speaker: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of seeds) {
    if (isEngagementAwardMetadata(s.metadata ?? undefined)) continue;
    const sp = speakerFromMetadata(s.metadata) || s.speaker;
    if (!sp) continue;
    map.set(sp, (map.get(sp) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([speaker, count]) => ({ speaker, count }))
    .sort((a, b) => b.count - a.count || a.speaker.localeCompare(b.speaker));
}
