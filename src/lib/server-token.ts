import { Contract } from "ethers";
import {
  getReadonlyProvider,
  getVoiceSeedAddress,
  VOICE_SEED_ABI,
} from "@/lib/contract";
import { tokenUriToHttp } from "@/lib/ipfs";
import type { VoiceSeedMetadata } from "@/lib/metadata";

export async function readTokenURI(tokenId: bigint): Promise<string | null> {
  const addr = getVoiceSeedAddress();
  if (!addr) return null;
  const p = getReadonlyProvider();
  const c = new Contract(addr, VOICE_SEED_ABI, p);
  try {
    return await c.tokenURI(tokenId);
  } catch {
    return null;
  }
}

export async function readOwner(tokenId: bigint): Promise<string | null> {
  const addr = getVoiceSeedAddress();
  if (!addr) return null;
  const p = getReadonlyProvider();
  const c = new Contract(addr, VOICE_SEED_ABI, p);
  try {
    return await c.ownerOf(tokenId);
  } catch {
    return null;
  }
}

export async function fetchMetadataForToken(
  tokenId: bigint
): Promise<VoiceSeedMetadata | null> {
  const uri = await readTokenURI(tokenId);
  if (!uri) return null;
  const url = tokenUriToHttp(uri);
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as VoiceSeedMetadata;
  } catch {
    return null;
  }
}
