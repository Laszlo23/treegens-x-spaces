import { buildEngagementAwardImageDataUri } from "@/lib/nft-visual";
import type { VoiceSeedMetadata } from "@/lib/metadata";

const ENGAGEMENT_AWARD_MARKER = "Engagement Award";

/** Detects metadata for engagement-award mints (exclude from speaker/collector ranking base counts if needed). */
export function isEngagementAwardMetadata(m: VoiceSeedMetadata | null | undefined): boolean {
  if (!m) return false;
  if (m.name?.startsWith(ENGAGEMENT_AWARD_MARKER)) return true;
  return Boolean(m.attributes?.some((a) => a.trait_type === "Award" && String(a.value).includes("Engagement")));
}

export function buildEngagementAwardMetadata(input: {
  rank: number;
  seedsCounted: number;
  totalRankedCollectors: number;
  walletAddress: string;
  audioGatewayUrl: string;
  audioIpfsPath: string;
}): VoiceSeedMetadata {
  const walletLabel = `${input.walletAddress.slice(0, 6)}…${input.walletAddress.slice(-4)}`;
  const name = `${ENGAGEMENT_AWARD_MARKER} · Rank #${input.rank}`;
  const description = `Treegens engagement award for ranking #${input.rank} among collectors (${input.seedsCounted} Voice Seeds counted in this index).`;

  return {
    name,
    description,
    image: buildEngagementAwardImageDataUri({
      rank: input.rank,
      walletAddress: input.walletAddress,
    }),
    animation_url: input.audioGatewayUrl,
    attributes: [
      { trait_type: "Award", value: "Top collector — engagement" },
      { trait_type: "Leaderboard rank", value: String(input.rank) },
      { trait_type: "Voice Seeds owned (indexed)", value: String(input.seedsCounted) },
      { trait_type: "Collectors on leaderboard", value: String(input.totalRankedCollectors) },
      { trait_type: "Recipient", value: walletLabel },
      { trait_type: "Audio IPFS", value: input.audioIpfsPath },
    ],
  };
}
