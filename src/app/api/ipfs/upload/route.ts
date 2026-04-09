import { NextRequest, NextResponse } from "next/server";

/**
 * Pin arbitrary file bytes to IPFS via Pinata (JWT stays server-side for Vercel).
 */

export async function POST(req: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: "PINATA_JWT is not configured. Add it in .env for IPFS uploads." },
      { status: 503 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Expected multipart field 'file'" }, { status: 400 });
  }

  const pinata = new FormData();
  pinata.append("file", file, "audio.wav");

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: pinata,
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
  const gatewayBase =
    process.env.NEXT_PUBLIC_IPFS_GATEWAY?.replace(/\/$/, "") ||
    "https://gateway.pinata.cloud/ipfs";
  const gatewayUrl = `${gatewayBase}/${cid}`;

  return NextResponse.json({ cid, gatewayUrl });
}
