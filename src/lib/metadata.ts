import { buildVoiceSeedImageDataUri } from "@/lib/nft-visual";
import type { SpaceMeta } from "./spaces";

/**
 * ERC721-compatible metadata for Voice Seeds (IPFS JSON).
 * Includes `animation_url` for audio players that support it; gateways often serve JSON over HTTPS.
 */

export type VoiceSeedAttributes = {
  space_title: string;
  speaker: string;
  timestamp: string;
  quote: string;
  audio_ipfs: string;
};

export type VoiceSeedMetadata = {
  name: string;
  description: string;
  image: string;
  animation_url: string;
  attributes: { trait_type: string; value: string }[];
};

export function buildVoiceSeedMetadata(input: {
  space: SpaceMeta;
  speakerName: string;
  quote: string;
  audioGatewayUrl: string;
  audioIpfsPath: string;
  /** When set, records verified Space listening time on-chain metadata. */
  participationNote?: string;
}): VoiceSeedMetadata {
  const timestamp = new Date().toISOString();
  const name = `Voice Seed · ${input.speakerName}`;
  const e = input.space.engagement;
  const description = `A collectible voice moment from “${input.space.title}”. ${input.quote}`;

  const attributes: VoiceSeedMetadata["attributes"] = [
    { trait_type: "Space Title", value: input.space.title },
    { trait_type: "Speaker", value: input.speakerName },
    { trait_type: "Timestamp", value: timestamp },
    { trait_type: "Quote", value: input.quote },
    { trait_type: "Space hearts", value: String(e.hearts) },
    { trait_type: "Space reaction taps (total)", value: String(e.totalTaps) },
    { trait_type: "Audio IPFS", value: input.audioIpfsPath },
  ];

  if (input.participationNote) {
    attributes.push({ trait_type: "Space participation", value: input.participationNote });
  }

  return {
    name,
    description,
    image: buildVoiceSeedImageDataUri({
      speakerName: input.speakerName,
      spaceTitle: input.space.title,
    }),
    animation_url: input.audioGatewayUrl,
    attributes,
  };
}
