"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShareArtifactCard } from "@/components/share/ShareArtifactCard";
import type { VoiceSeedMetadata } from "@/lib/metadata";
import { sharePageUrl, twitterIntentUrl, warpcastComposeUrl } from "@/lib/share-links";

export function SharePageClient(props: {
  meta: VoiceSeedMetadata;
  owner: string | null;
  tokenId: string;
}) {
  const isEngagement = Boolean(props.meta.name?.startsWith("Engagement Award"));
  const speakerAttr =
    props.meta.attributes?.find((a) => a.trait_type === "Speaker")?.value || "";
  const headline =
    isEngagement && props.meta.name ? props.meta.name : speakerAttr || "Speaker";
  const quote =
    props.meta.attributes?.find((a) => a.trait_type === "Quote")?.value ||
    props.meta.description.slice(0, 200);
  const audio = props.meta.animation_url;
  const mintUrl = sharePageUrl(props.tokenId);
  const badgeLabel = isEngagement ? "Engagement award" : "Voice Seed";
  const shareBlurb = isEngagement ? `Treegens · ${headline}` : `Voice Seed artifact · ${headline}`;

  return (
    <div className="mx-auto max-w-lg space-y-8 px-4 py-12">
      <Link
        href="/"
        className="text-sm text-emerald-500/90 underline-offset-4 hover:text-emerald-400 hover:underline"
      >
        ← Forest DAO dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <ShareArtifactCard
          speaker={headline}
          quote={quote}
          audioUrl={audio}
          mintUrl={mintUrl}
          imageUrl={props.meta.image}
          badgeLabel={badgeLabel}
        />
      </motion.div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
        <p>
          <span className="text-zinc-500">Owner</span>{" "}
          <span className="break-all font-mono text-xs text-zinc-300">{props.owner || "—"}</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href={twitterIntentUrl({
            text: shareBlurb,
            url: mintUrl,
          })}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:border-emerald-500/50"
        >
          Share on X
        </a>
        <a
          href={warpcastComposeUrl({ text: shareBlurb, embeds: [mintUrl] })}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:border-emerald-500/50"
        >
          Share on Farcaster
        </a>
      </div>
    </div>
  );
}
