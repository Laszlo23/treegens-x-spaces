/**
 * Load VoiceSeedMinted events from Base Sepolia for gallery sync (best-effort).
 */

import { Contract } from "ethers";
import { getReadonlyProvider, getVoiceSeedAddress, VOICE_SEED_ABI } from "./contract";

export async function fetchMintedTokenIds(fromBlock?: number): Promise<bigint[]> {
  const addr = getVoiceSeedAddress();
  if (!addr) return [];
  const provider = getReadonlyProvider();
  const c = new Contract(addr, VOICE_SEED_ABI, provider);
  const filter = c.filters.VoiceSeedMinted();
  const start =
    fromBlock ??
    (Number(process.env.NEXT_PUBLIC_VOICE_SEED_FROM_BLOCK || 0) || 0);
  const latest = await provider.getBlockNumber();
  const ids: bigint[] = [];
  try {
    const events = await c.queryFilter(filter, start, latest);
    for (const ev of events) {
      if ("args" in ev && ev.args && typeof ev.args[0] === "bigint") {
        ids.push(ev.args[0] as bigint);
      }
    }
  } catch {
    /* RPC may reject wide ranges */
  }
  return ids.sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));
}
