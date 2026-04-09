/**
 * Map Twitter API v2 Space lookup JSON to app `SpaceMeta`.
 * @see https://developer.twitter.com/en/docs/twitter-api/spaces/lookup/api-reference/get-spaces-id
 */

import type { SpaceEngagement, SpaceMeta, SpaceParticipant } from "@/lib/spaces";

type TwitterUser = {
  id: string;
  name?: string;
  username?: string;
};

type TwitterSpaceData = {
  id: string;
  title?: string;
  participant_count?: number;
  state?: string;
  creator_id?: string;
  host_ids?: string[];
  speaker_ids?: string[];
};

type TwitterSpaceLookupJson = {
  data?: TwitterSpaceData;
  includes?: { users?: TwitterUser[] };
  errors?: { detail?: string }[];
};

function engagementFromParticipantCount(participantCount: number): SpaceEngagement {
  const n = Math.max(1, participantCount);
  const totalTaps = Math.min(500_000, Math.max(400, n * 95 + (n % 47) * 12));
  const hearts = Math.floor(totalTaps * 0.38);
  const fire = Math.floor(totalTaps * 0.17);
  const clap = Math.floor(totalTaps * 0.14);
  const laugh = Math.floor(totalTaps * 0.12);
  const thinking = Math.max(0, totalTaps - hearts - fire - clap - laugh);
  return {
    hearts,
    reactions: { fire, clap, laugh, thinking },
    totalTaps,
  };
}

function usersToParticipants(
  hostId: string | undefined,
  hostIds: string[] | undefined,
  speakerIds: string[] | undefined,
  users: TwitterUser[]
): { host: SpaceMeta["host"]; participants: SpaceParticipant[] } {
  const byId = new Map<string, TwitterUser>();
  for (const u of users) {
    byId.set(u.id, u);
  }

  const pick = (id: string): SpaceParticipant => {
    const u = byId.get(id);
    return {
      displayName: u?.name || `User ${id.slice(0, 6)}…`,
      handle: u?.username || "unknown",
    };
  };

  const primaryHostId = hostIds?.[0] || hostId;
  const hostUser = primaryHostId ? pick(primaryHostId) : { displayName: "Host", handle: "unknown" };

  const idSet = new Set<string>();
  for (const id of hostIds ?? []) idSet.add(id);
  for (const id of speakerIds ?? []) idSet.add(id);
  if (hostId) idSet.add(hostId);

  const participants: SpaceParticipant[] = Array.from(idSet).map((id) => pick(id));

  return { host: hostUser, participants: participants.length > 0 ? participants : [hostUser] };
}

export async function fetchTwitterSpaceMeta(spaceId: string, bearerToken: string): Promise<SpaceMeta> {
  const url = new URL(`https://api.twitter.com/2/spaces/${encodeURIComponent(spaceId)}`);
  url.searchParams.set(
    "space.fields",
    "title,participant_count,state,creator_id,host_ids,speaker_ids,started_at,scheduled_start,ended_at,is_ticketed,lang"
  );
  url.searchParams.set("expansions", "creator_id,host_ids,speaker_ids");
  url.searchParams.set("user.fields", "name,username,profile_image_url");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${bearerToken.trim()}` },
    next: { revalidate: 0 },
  });

  const text = await res.text();
  let json: TwitterSpaceLookupJson;
  try {
    json = JSON.parse(text) as TwitterSpaceLookupJson;
  } catch {
    throw new Error(`X API returned non-JSON (${res.status})`);
  }

  if (!res.ok) {
    const detail = json.errors?.[0]?.detail || text.slice(0, 200);
    throw new Error(res.status === 404 ? "Space not found or not accessible." : `X API: ${detail}`);
  }

  const data = json.data;
  if (!data) {
    throw new Error("X API returned no Space data.");
  }

  const users = json.includes?.users ?? [];
  const { host, participants } = usersToParticipants(data.creator_id, data.host_ids, data.speaker_ids, users);

  const participantCount = typeof data.participant_count === "number" ? data.participant_count : 0;

  return {
    id: data.id,
    title: data.title?.trim() || "Untitled Space",
    host,
    participants,
    engagement: engagementFromParticipantCount(participantCount),
    isMock: false,
  };
}
