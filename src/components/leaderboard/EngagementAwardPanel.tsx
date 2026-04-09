"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { ShareArtifactCard } from "@/components/share/ShareArtifactCard";
import { appNetworkDescription } from "@/config/chain";
import { generateDemoWavBlob } from "@/lib/audio";
import {
  collectorRankForAddress,
  ENGAGEMENT_TOP_COLLECTORS,
  rankCollectors,
  type CollectorRow,
} from "@/lib/collector-rank";
import { cn } from "@/lib/cn";
import { getClaimedEngagementTokenId, hasClaimedEngagementAward, markEngagementAwardClaimed } from "@/lib/engagement-claim";
import { buildEngagementAwardMetadata } from "@/lib/engagement-metadata";
import { mintVoiceSeed, getVoiceSeedAddress } from "@/lib/contract";
import { uploadAudioToIpfs, uploadJsonToIpfs } from "@/lib/ipfs";
import { getEthersSigner, pickEthereumWallet } from "@/lib/privy-wallet";
import { upsertLocalSeed } from "@/lib/seed-index";
import { loadMergedSeeds } from "@/lib/seeds-loader";
import { sharePageUrl, twitterIntentUrl, warpcastComposeUrl } from "@/lib/share-links";

export function EngagementAwardPanel() {
  const { authenticated, ready } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();
  const [ranked, setRanked] = useState<CollectorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastMint, setLastMint] = useState<{
    tokenId: string;
    audioUrl: string;
    rank: number;
    imageUrl: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const merged = await loadMergedSeeds();
      setRanked(rankCollectors(merged));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const wallet = pickEthereumWallet(wallets);
  const address = wallet?.address;
  const rank = collectorRankForAddress(ranked, address);
  const eligible = rank !== null && rank >= 1 && rank <= ENGAGEMENT_TOP_COLLECTORS;
  const seedsForWallet = address
    ? ranked.find((r) => r.address === address.toLowerCase())?.count ?? 0
    : 0;
  const claimed = address ? hasClaimedEngagementAward(address) : false;
  const claimedTokenId = address ? getClaimedEngagementTokenId(address) : null;

  const runMint = useCallback(async () => {
    setErr(null);
    setLastMint(null);
    if (!ready || !walletsReady) {
      setErr("Wallet layer is still loading.");
      return;
    }
    if (!authenticated || !wallet || !address) {
      setErr("Connect a wallet to mint an engagement award.");
      return;
    }
    const contractAddr = getVoiceSeedAddress();
    if (!contractAddr) {
      setErr("Set NEXT_PUBLIC_VOICE_SEED_CONTRACT_ADDRESS.");
      return;
    }
    const r = collectorRankForAddress(ranked, address);
    if (r === null || r < 1 || r > ENGAGEMENT_TOP_COLLECTORS) {
      setErr(`Not in the top ${ENGAGEMENT_TOP_COLLECTORS} collectors for this index.`);
      return;
    }
    if (hasClaimedEngagementAward(address) && getClaimedEngagementTokenId(address)) {
      setErr("You already claimed an engagement award from this browser.");
      return;
    }

    setBusy(true);
    try {
      const wav = generateDemoWavBlob(5);
      const audioFile = new File([wav], "engagement-award.wav", { type: "audio/wav" });
      const { cid: audioCid, gatewayUrl: audioGatewayUrl } = await uploadAudioToIpfs(audioFile);

      const signer = await getEthersSigner(wallet);
      const addr = await signer.getAddress();

      const metaJson = buildEngagementAwardMetadata({
        rank: r,
        seedsCounted: seedsForWallet,
        totalRankedCollectors: ranked.length,
        walletAddress: addr,
        audioGatewayUrl,
        audioIpfsPath: `ipfs://${audioCid}`,
      });

      const { ipfsUri } = await uploadJsonToIpfs(metaJson as unknown as Record<string, unknown>);

      const { tokenId } = await mintVoiceSeed(signer, addr, ipfsUri);

      upsertLocalSeed({
        tokenId: tokenId.toString(),
        tokenURI: ipfsUri,
        owner: addr,
        metadata: metaJson,
        speaker: "Engagement Award",
        spaceTitle: "Leaderboard",
      });

      markEngagementAwardClaimed(addr, tokenId.toString());
      setLastMint({
        tokenId: tokenId.toString(),
        audioUrl: audioGatewayUrl,
        rank: r,
        imageUrl: metaJson.image,
      });
      void refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Mint failed");
    } finally {
      setBusy(false);
    }
  }, [
    ready,
    walletsReady,
    authenticated,
    wallet,
    address,
    ranked,
    seedsForWallet,
    refresh,
  ]);

  const mintLink = lastMint ? sharePageUrl(lastMint.tokenId) : "";

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/30 p-4 text-sm text-zinc-500">
        Loading collector ranks…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display text-base font-semibold text-emerald-100">Engagement awards</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Top {ENGAGEMENT_TOP_COLLECTORS} collectors (by minted Voice Seeds in this index, excluding prior
          engagement awards) can mint a one-time **Engagement Award** NFT — same VoiceSeed contract, distinct
          metadata on {appNetworkDescription()}.
        </p>
      </div>

      {ranked.length > 0 && (
        <ol className="space-y-2">
          {ranked.slice(0, ENGAGEMENT_TOP_COLLECTORS).map((row, i) => (
            <motion.li
              key={row.address}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-sm",
                address && row.address === address.toLowerCase()
                  ? "border-emerald-500/45 bg-emerald-950/20"
                  : "border-zinc-700/80 bg-zinc-900/40"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20 text-sm font-semibold text-amber-200">
                  {i + 1}
                </span>
                <span className="font-mono text-xs text-zinc-300">{row.address}</span>
              </span>
              <span className="font-mono text-emerald-400/90">{row.count} seeds</span>
            </motion.li>
          ))}
        </ol>
      )}

      {ranked.length === 0 && (
        <p className="text-sm text-zinc-500">No collector data yet — mint Voice Seeds from Tasks first.</p>
      )}

      {eligible && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
          <p className="text-sm text-amber-100/90">
            You&apos;re rank <span className="font-semibold text-amber-200">#{rank}</span> with{" "}
            <span className="font-mono">{seedsForWallet}</span> Voice Seeds — eligible for an engagement award.
          </p>
          {claimed && claimedTokenId && (
            <p className="mt-2 text-sm text-zinc-400">
              Claimed (token #{claimedTokenId}).{" "}
              <a href={sharePageUrl(claimedTokenId)} className="text-emerald-400 underline">
                View
              </a>
            </p>
          )}
          {!claimed && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={busy}
              onClick={() => void runMint()}
              className={cn(
                "mt-3 w-full rounded-xl bg-gradient-to-r from-amber-600/90 to-emerald-700/90 py-2.5 text-sm font-semibold text-white",
                "shadow-lg shadow-amber-900/30 disabled:opacity-50"
              )}
            >
              {busy ? "Minting engagement award…" : "Mint engagement award NFT"}
            </motion.button>
          )}
          {err && (
            <p className="mt-2 text-sm text-red-400" role="alert">
              {err}
            </p>
          )}
        </div>
      )}

      {!eligible && authenticated && address && ranked.length > 0 && (
        <p className="text-sm text-zinc-500">
          Your collector rank is #{rank ?? "—"} — reach the top {ENGAGEMENT_TOP_COLLECTORS} to unlock an
          engagement award.
        </p>
      )}

      {lastMint && (
        <div className="space-y-3">
          <ShareArtifactCard
            speaker={`Engagement · Rank #${lastMint.rank}`}
            quote="Top collector engagement award"
            audioUrl={lastMint.audioUrl}
            mintUrl={mintLink}
            imageUrl={lastMint.imageUrl}
            badgeLabel="Engagement award"
          />
          <div className="flex flex-wrap gap-3">
            <a
              href={twitterIntentUrl({
                text: `I minted a Treegens Engagement Award (rank #${lastMint.rank}) on Base`,
                url: mintLink,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:border-emerald-500/50"
            >
              Share on X
            </a>
            <a
              href={warpcastComposeUrl({
                text: `Treegens Engagement Award · rank #${lastMint.rank}`,
                embeds: [mintLink],
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:border-emerald-500/50"
            >
              Share on Farcaster
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
