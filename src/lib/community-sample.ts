/**
 * Sample copy and demo values so newcomers understand the flow before real on-chain data exists.
 */

/** Works with `parseSpaceIdFromUrl` — deterministic mock metadata from `tryFetchSpaceMeta`. */
export const SAMPLE_SPACE_URL = "https://x.com/i/spaces/1zqKVPRPEVPJB";

export const COMMUNITY_STEPS: readonly { title: string; body: string }[] = [
  {
    title: "Space",
    body: "Paste any public X Space URL. Title, host, speakers, and engagement numbers are illustrative demo data until an X API backend is connected.",
  },
  {
    title: "Participate",
    body: "Tap Join session and keep this browser tab in the foreground. After 15 minutes of visible time for that Space, minting unlocks for one Voice Seed (then the timer resets for another mint).",
  },
  {
    title: "Tasks",
    body: "Record a short demo clip, upload audio + JSON to IPFS, and mint an ERC-721 Voice Seed on Base Sepolia with your Privy wallet.",
  },
  {
    title: "Profile",
    body: "Your Farcaster or wallet identity plus every Voice Seed this browser has indexed (local + contract events).",
  },
  {
    title: "Leaderboard",
    body: "Speakers ranked by how many minted Voice Seeds reference them in metadata — not X follower counts.",
  },
];

/** Shown as a dashed “preview” when no seeds exist yet. Not real rankings. */
export const SAMPLE_LEADERBOARD_ROWS: readonly { speaker: string; count: number }[] = [
  { speaker: "Alex Rivers", count: 12 },
  { speaker: "Mira Chen", count: 9 },
  { speaker: "Jordan K.", count: 7 },
  { speaker: "Nova (illustrative)", count: 4 },
];

/** Example mint fields — Tasks tab can show this as inspiration. */
export const SAMPLE_CAPTURE_EXAMPLE = {
  speaker: "Alex Rivers",
  quote: "Regeneration isn’t a season — it’s how we fund the next decade of public goods.",
} as const;
