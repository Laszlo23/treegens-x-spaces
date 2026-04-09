/**
 * X (Twitter) Spaces metadata.
 *
 * Public Space metadata is not available without X API credentials, so this module
 * returns deterministic mock data keyed by Space id. Replace `tryFetchSpaceMeta` with
 * a real HTTP call to your backend that proxies the X API when you have access.
 */

export type SpaceParticipant = {
  displayName: string;
  handle: string;
};

/**
 * Reaction / “emotion” engagement for a Space session.
 *
 * X does not expose live reaction tallies without authenticated API access; this shape is what a
 * real `tryFetchSpaceMeta` would return when your backend can aggregate Space events. The mock
 * implementation uses deterministic numbers seeded by `spaceId`.
 */
export type SpaceEngagement = {
  /** Heart / like taps (the main “emotion” counter users often mean). */
  hearts: number;
  /** Other common Space reaction types (labels align with typical live UI). */
  reactions: {
    fire: number;
    clap: number;
    laugh: number;
    thinking: number;
  };
  /** Sum of every reaction tap across the whole Space session. */
  totalTaps: number;
};

export type SpaceMeta = {
  id: string;
  title: string;
  host: { displayName: string; handle: string };
  participants: SpaceParticipant[];
  engagement: SpaceEngagement;
  /** True when using local deterministic demo data (no X bearer token or fallback). */
  isMock: boolean;
};

/** Extract Space id from common X / Twitter Space URL shapes. */
export function parseSpaceIdFromUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const u = new URL(trimmed.includes("http") ? trimmed : `https://${trimmed}`);
    const path = u.pathname;
    const m =
      path.match(/\/spaces\/([A-Za-z0-9]+)/i) ||
      path.match(/\/i\/spaces\/([A-Za-z0-9]+)/i);
    return m?.[1] ?? null;
  } catch {
    const m = trimmed.match(/spaces\/([A-Za-z0-9]+)/i);
    return m?.[1] ?? null;
  }
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deterministic engagement stats for demo Spaces — mirrors a plausible reaction distribution. */
function mockEngagement(spaceId: string): SpaceEngagement {
  const h = hashSeed(spaceId + ":engagement");
  const totalTaps = 1800 + (h % 22000) + ((h >>> 8) % 8000);
  const mix = (h % 97) / 400;
  const hearts = Math.floor(totalTaps * (0.38 + mix));
  const fire = Math.floor(totalTaps * (0.17 + ((h >> 3) % 17) / 200));
  const clap = Math.floor(totalTaps * (0.14 + ((h >> 5) % 13) / 200));
  const laugh = Math.floor(totalTaps * (0.12 + ((h >> 7) % 11) / 200));
  const used = hearts + fire + clap + laugh;
  const thinking = Math.max(0, totalTaps - used);
  return {
    hearts,
    reactions: { fire, clap, laugh, thinking },
    totalTaps,
  };
}

/** Deterministic demo Space — used when no X API bearer token is configured. */
export function buildMockSpaceMeta(spaceId: string): SpaceMeta {
  const h = hashSeed(spaceId);
  const titles = [
    "Regen Finance & Public Goods",
    "Base Builders Night",
    "DAO Governance AMA",
    "Forest Protocol Community Call",
  ];
  const hosts = [
    { displayName: "Alex Rivers", handle: "alexrivers" },
    { displayName: "Mira Chen", handle: "mirachen" },
    { displayName: "Jordan K.", handle: "jordank" },
  ];
  const pool = ["sam", "taylor", "river", "nova", "kai", "eden", "sol"];
  const n = 3 + (h % 5);
  const participants: SpaceParticipant[] = Array.from({ length: n }, (_, i) => ({
    displayName: `Speaker ${pool[(h + i) % pool.length]}`,
    handle: `${pool[(h + i) % pool.length]}_voice`,
  }));
  return {
    id: spaceId,
    title: titles[h % titles.length],
    host: hosts[h % hosts.length],
    participants,
    engagement: mockEngagement(spaceId),
    isMock: true,
  };
}

/**
 * Loads Space metadata via `GET /api/spaces/:id` (server uses X API v2 when `X_API_BEARER_TOKEN` or
 * `TWITTER_BEARER_TOKEN` / `TWITTER_API_BEARER_TOKEN` is set; otherwise returns mock data).
 */
export async function tryFetchSpaceMeta(spaceId: string): Promise<SpaceMeta> {
  const path = `/api/spaces/${encodeURIComponent(spaceId)}`;
  const origin =
    typeof window === "undefined"
      ? (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "")
      : "";
  const url = origin ? `${origin}${path}` : path;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const j = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(j.error || `Failed to load Space (${res.status})`);
  }
  return res.json() as Promise<SpaceMeta>;
}
