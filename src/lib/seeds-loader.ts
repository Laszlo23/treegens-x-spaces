import { Contract } from "ethers";
import { fetchMintedTokenIds } from "./chain-events";
import {
  getReadonlyProvider,
  getVoiceSeedAddress,
  VOICE_SEED_ABI,
} from "./contract";
import { tokenUriToHttp } from "./ipfs";
import type { VoiceSeedMetadata } from "./metadata";
import {
  loadLocalSeeds,
  mergeSeedsUnique,
  type IndexedSeed,
} from "./seed-index";

export async function hydrateSeed(s: IndexedSeed): Promise<IndexedSeed> {
  const addr = getVoiceSeedAddress();
  if (!addr || !s.tokenId) return s;
  const provider = getReadonlyProvider();
  const c = new Contract(addr, VOICE_SEED_ABI, provider);
  const id = BigInt(s.tokenId);
  let tokenURI = s.tokenURI;
  let owner = s.owner;
  try {
    if (!tokenURI) tokenURI = await c.tokenURI(id);
  } catch {
    /* ignore */
  }
  try {
    owner = await c.ownerOf(id);
  } catch {
    /* ignore */
  }
  let metadata = s.metadata;
  if (!metadata && tokenURI) {
    try {
      const url = tokenUriToHttp(tokenURI);
      const res = await fetch(url);
      if (res.ok) metadata = (await res.json()) as VoiceSeedMetadata;
    } catch {
      /* ignore */
    }
  }
  const speaker =
    s.speaker ||
    metadata?.attributes?.find((a) => a.trait_type === "Speaker")?.value;
  const spaceTitle =
    s.spaceTitle ||
    metadata?.attributes?.find((a) => a.trait_type === "Space Title")?.value;
  return { ...s, tokenURI, owner, metadata, speaker, spaceTitle };
}

/** Merge localStorage mints with on-chain events and hydrate metadata / owners. */
export async function loadMergedSeeds(): Promise<IndexedSeed[]> {
  const local = loadLocalSeeds();
  const ids = await fetchMintedTokenIds();
  const addr = getVoiceSeedAddress();
  const fromChain: IndexedSeed[] = [];
  if (addr) {
    const provider = getReadonlyProvider();
    const c = new Contract(addr, VOICE_SEED_ABI, provider);
    for (const id of ids) {
      const sid = id.toString();
      let tokenURI: string | undefined;
      let owner: string | undefined;
      try {
        tokenURI = await c.tokenURI(id);
      } catch {
        /* */
      }
      try {
        owner = await c.ownerOf(id);
      } catch {
        /* */
      }
      fromChain.push({ tokenId: sid, tokenURI, owner });
    }
  }
  const merged = mergeSeedsUnique(local, fromChain);
  return Promise.all(merged.map((x) => hydrateSeed(x)));
}
