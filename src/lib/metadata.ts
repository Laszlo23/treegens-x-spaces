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

/** Inline SVG “seed” graphic as a data URI — no separate image upload required for demos. */
export function seedImageDataUri(): string {
  const svg = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#d5e26b"/>
          <stop offset="100%" stop-color="#3d4620"/>
        </radialGradient>
        <filter id="b"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect width="200" height="200" fill="#0a0f0d"/>
      <ellipse cx="100" cy="105" rx="48" ry="64" fill="url(#g)" filter="url(#b)"/>
      <ellipse cx="100" cy="72" rx="14" ry="20" fill="#e2eca8" opacity="0.95"/>
      <circle cx="100" cy="100" r="6" fill="#ecfdf5" opacity="0.35"/>
    </svg>`
  );
  return `data:image/svg+xml;charset=utf-8,${svg}`;
}

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
    image: seedImageDataUri(),
    animation_url: input.audioGatewayUrl,
    attributes,
  };
}
