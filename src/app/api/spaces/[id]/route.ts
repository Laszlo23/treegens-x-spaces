import { NextResponse } from "next/server";
import { buildMockSpaceMeta } from "@/lib/spaces";
import { fetchTwitterSpaceMeta } from "@/lib/twitter-spaces";

function bearerToken(): string | null {
  const t =
    process.env.X_API_BEARER_TOKEN?.trim() ||
    process.env.TWITTER_BEARER_TOKEN?.trim() ||
    process.env.TWITTER_API_BEARER_TOKEN?.trim();
  return t || null;
}

/**
 * GET /api/spaces/:id — Space metadata from X API v2 when a bearer token is set; otherwise mock data.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: "Missing Space id" }, { status: 400 });
  }

  const token = bearerToken();
  if (!token) {
    return NextResponse.json(buildMockSpaceMeta(id));
  }

  try {
    const meta = await fetchTwitterSpaceMeta(id, token);
    return NextResponse.json(meta);
  } catch (e) {
    const message = e instanceof Error ? e.message : "X API request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
