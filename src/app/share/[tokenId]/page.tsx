import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicBaseUrl } from "@/config/site";
import { fetchMetadataForToken, readOwner } from "@/lib/server-token";
import { SharePageClient } from "./SharePageClient";

type Props = { params: { tokenId: string } };

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { tokenId } = props.params;
  let meta = null;
  try {
    meta = await fetchMetadataForToken(BigInt(tokenId));
  } catch {
    meta = null;
  }
  const base = getPublicBaseUrl();
  const title = meta?.name || `Voice Seed #${tokenId}`;
  const description = meta?.description || "Treegens Voice Seed collectible artifact.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${base}/share/${tokenId}`,
      type: "website",
      images: [
        {
          url: `${base}/share/${tokenId}/opengraph-image`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharePage(props: Props) {
  const { tokenId } = props.params;
  let id: bigint;
  try {
    id = BigInt(tokenId);
  } catch {
    notFound();
  }
  const meta = await fetchMetadataForToken(id);
  if (!meta) notFound();
  const owner = await readOwner(id);
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SharePageClient meta={meta} owner={owner} tokenId={tokenId} />
    </div>
  );
}
