import { NextRequest, NextResponse } from "next/server";

/**
 * Pin JSON metadata (NFT tokenURI payload) to IPFS via Pinata.
 */

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "PINATA_JWT is not configured. Add it in .env for IPFS uploads." },
      { status: 503 }
    );
  }

  const { body, name } = (await req.json()) as {
    body?: Record<string, unknown>;
    name?: string;
  };
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Expected { body: object }" }, { status: 400 });
  }

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pinataContent: body,
      pinataMetadata: { name: name || "metadata.json" },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    const hint =
      res.status === 401
        ? " Check PINATA_JWT: use a Pinata API JWT (pinning enabled), no quotes/newlines, no 'Bearer ' prefix."
        : "";
    return NextResponse.json(
      { error: `Pinata error: ${res.status} ${t.slice(0, 200)}${hint}` },
      { status: 502 }
    );
  }

  const data = (await res.json()) as { IpfsHash: string };
  const cid = data.IpfsHash;
  const ipfsUri = `ipfs://${cid}`;
  const gatewayBase =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY?.replace(/\/$/, "") ||
    "https://gateway.pinata.cloud/ipfs";
  const gatewayUrl = `${gatewayBase}/${cid}`;

  return NextResponse.json({ cid, gatewayUrl, ipfsUri });
}
