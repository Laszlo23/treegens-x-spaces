"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useSpaceParticipation } from "@/components/providers/SpaceParticipationProvider";
import { useSpaceSession } from "@/components/providers/SpaceSessionProvider";
import { ShareArtifactCard } from "@/components/share/ShareArtifactCard";
import { generateDemoWavBlob } from "@/lib/audio";
import { mintVoiceSeed, getVoiceSeedAddress } from "@/lib/contract";
import { uploadAudioToIpfs, uploadJsonToIpfs } from "@/lib/ipfs";
import { buildVoiceSeedMetadata } from "@/lib/metadata";
import { getEthersSigner, pickEthereumWallet } from "@/lib/privy-wallet";
import { upsertLocalSeed } from "@/lib/seed-index";
import { sharePageUrl, twitterIntentUrl, warpcastComposeUrl } from "@/lib/share-links";
import { appNetworkDescription } from "@/config/chain";
import { SAMPLE_CAPTURE_EXAMPLE } from "@/lib/community-sample";
import { cn } from "@/lib/cn";
import { formatParticipationClock } from "@/lib/participation";

export function CaptureTabPrivy() {
  const { meta, spaceUrl, setSpaceUrl, loadFromUrl } = useSpaceSession();
  const { eligibleToMint, activeMs, requiredMs, resetAfterMint } = useSpaceParticipation();
  const { authenticated, ready } = usePrivy();
  const { wallets, ready: walletsReady } = useWallets();

  const [speaker, setSpeaker] = useState("");
  const [quote, setQuote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [lastMint, setLastMint] = useState<{
    tokenId: string;
    audioUrl: string;
    speaker: string;
    quote: string;
    imageUrl: string;
  } | null>(null);

  useEffect(() => {
    if (meta) {
      setSpeaker(meta.host.displayName);
      setQuote(`Resonance captured from “${meta.title}”`);
    }
  }, [meta]);

  const runCapture = useCallback(async () => {
    setErr(null);
    setLastMint(null);
    if (!meta) {
      setErr("Load a Space on the Space tab first (or paste URL below).");
      return;
    }
    if (!ready || !walletsReady) {
      setErr("Wallet layer is still loading.");
      return;
    }
    if (!authenticated) {
      setErr("Log in with Farcaster or a wallet first.");
      return;
    }
    const wallet = pickEthereumWallet(wallets);
    if (!wallet) {
      setErr("No Ethereum wallet connected. Complete login or connect a wallet in the Privy modal.");
      return;
    }
    const contractAddr = getVoiceSeedAddress();
    if (!contractAddr) {
      setErr("Set NEXT_PUBLIC_VOICE_SEED_CONTRACT_ADDRESS for the deployed VoiceSeed contract.");
      return;
    }
    if (!eligibleToMint) {
      const left = Math.max(0, requiredMs - activeMs);
      setErr(
        `Join the Space tab and stay for ${formatParticipationClock(requiredMs)} (visible time). About ${formatParticipationClock(left)} remaining.`
      );
      return;
    }

    setBusy(true);
    try {
      const wav = generateDemoWavBlob(10);
      const audioFile = new File([wav], "voice-seed-moment.wav", { type: "audio/wav" });
      const { cid: audioCid, gatewayUrl: audioGatewayUrl } = await uploadAudioToIpfs(audioFile);

      const metaJson = buildVoiceSeedMetadata({
        space: meta,
        speakerName: speaker || "Speaker",
        quote: quote || "—",
        audioGatewayUrl,
        audioIpfsPath: `ipfs://${audioCid}`,
        participationNote: "15 min session (simulated)",
      });

      const { ipfsUri } = await uploadJsonToIpfs(metaJson as unknown as Record<string, unknown>);

      const signer = await getEthersSigner(wallet);
      const address = await signer.getAddress();
      const { tokenId } = await mintVoiceSeed(signer, address, ipfsUri);

      upsertLocalSeed({
        tokenId: tokenId.toString(),
        tokenURI: ipfsUri,
        owner: address,
        metadata: metaJson,
        speaker: speaker || "Speaker",
        spaceTitle: meta.title,
      });

      setLastMint({
        tokenId: tokenId.toString(),
        audioUrl: audioGatewayUrl,
        speaker: speaker || "Speaker",
        quote: quote || "—",
        imageUrl: metaJson.image,
      });
      resetAfterMint();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }, [
    meta,
    ready,
    walletsReady,
    authenticated,
    wallets,
    speaker,
    quote,
    eligibleToMint,
    activeMs,
    requiredMs,
    resetAfterMint,
  ]);

  const mintLink = lastMint ? sharePageUrl(lastMint.tokenId) : "";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-500/20 bg-zinc-900/40 p-5 backdrop-blur-sm md:p-8">
        <h2 className="font-display text-lg font-semibold text-emerald-100">Tasks</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Capture a 10s moment, upload to IPFS, mint on {appNetworkDescription()}. After{" "}
          <span className="text-emerald-400/90">{formatParticipationClock(requiredMs)}</span> of participation
          on the Space tab, minting unlocks.
        </p>

        <div className="mt-4 rounded-xl border border-zinc-700/80 bg-zinc-950/50 p-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Sample fields (for demos)</p>
          <p className="mt-2 text-sm text-zinc-400">
            <span className="text-zinc-300">Speaker:</span> {SAMPLE_CAPTURE_EXAMPLE.speaker}
          </p>
          <blockquote className="mt-2 border-l-2 border-emerald-500/35 pl-3 text-sm italic leading-relaxed text-zinc-500">
            &ldquo;{SAMPLE_CAPTURE_EXAMPLE.quote}&rdquo;
          </blockquote>
          <button
            type="button"
            onClick={() => {
              setSpeaker(SAMPLE_CAPTURE_EXAMPLE.speaker);
              setQuote(SAMPLE_CAPTURE_EXAMPLE.quote);
            }}
            className="mt-3 text-sm font-medium text-emerald-400/95 hover:text-emerald-300 hover:underline"
          >
            Use this example in the form
          </button>
        </div>

        {meta && !eligibleToMint && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/25 p-4 text-sm text-amber-100/90">
            <p>
              Mint locked: participate in this Space for{" "}
              <span className="font-medium tabular-nums">{formatParticipationClock(requiredMs)}</span> of
              visible listening ({formatParticipationClock(Math.max(0, requiredMs - activeMs))} left). Use{" "}
              <span className="font-medium">Join session</span> on the Space tab.
            </p>
          </div>
        )}

        {meta && eligibleToMint && (
          <div className="mt-4 rounded-xl border border-emerald-500/35 bg-emerald-950/20 p-4 text-sm text-emerald-100/90">
            Participation complete — you can mint this Voice Seed.
          </div>
        )}

        {!meta && (
          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-sm text-amber-100/90">
            <p>No Space loaded. Enter a Space URL from the Space tab, or paste one here:</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={spaceUrl}
                onChange={(e) => setSpaceUrl(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                placeholder="https://x.com/i/spaces/..."
              />
              <button
                type="button"
                onClick={() => loadFromUrl()}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200"
              >
                Load
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-500">Speaker</span>
            <input
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="text-zinc-500">Quote</span>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
        </div>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={busy || !eligibleToMint}
          onClick={runCapture}
          className={cn(
            "mt-6 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 sm:w-auto sm:px-10",
            "disabled:opacity-50"
          )}
        >
          {busy ? "Capturing & minting…" : "Mint Voice Seed"}
        </motion.button>

        {err && (
          <p className="mt-4 text-sm text-red-400" role="alert">
            {err}
          </p>
        )}
      </div>

      {lastMint && (
        <div className="space-y-4">
          <ShareArtifactCard
            speaker={lastMint.speaker}
            quote={lastMint.quote}
            audioUrl={lastMint.audioUrl}
            mintUrl={mintLink}
            imageUrl={lastMint.imageUrl}
          />
          <div className="flex flex-wrap gap-3">
            <a
              href={twitterIntentUrl({
                text: `I minted a Voice Seed on Base — ${lastMint.speaker}`,
                url: mintLink,
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-emerald-500/50 hover:text-white"
            >
              Share on X
            </a>
            <a
              href={warpcastComposeUrl({
                text: `Minted a Voice Seed artifact · ${lastMint.speaker}`,
                embeds: [mintLink],
              })}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 transition hover:border-emerald-500/50 hover:text-white"
            >
              Share on Farcaster
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
