import {
  Contract,
  JsonRpcProvider,
  type ContractTransactionResponse,
  type Signer,
} from "ethers";
import { appDefaultRpcUrl } from "@/config/chain";
import VoiceSeedArtifact from "@/lib/abis/VoiceSeed.json";

const ABI = VoiceSeedArtifact.abi;

export function getVoiceSeedAddress(): string | null {
  const a = process.env.NEXT_PUBLIC_VOICE_SEED_CONTRACT_ADDRESS;
  if (!a || !/^0x[a-fA-F0-9]{40}$/.test(a)) return null;
  return a;
}

export function getReadonlyProvider(): JsonRpcProvider {
  return new JsonRpcProvider(appDefaultRpcUrl());
}

export function getVoiceSeedContract(provider: JsonRpcProvider) {
  const addr = getVoiceSeedAddress();
  if (!addr) throw new Error("NEXT_PUBLIC_VOICE_SEED_CONTRACT_ADDRESS is not set");
  return new Contract(addr, ABI, provider);
}

export function getVoiceSeedContractWithSigner(signer: Signer) {
  const addr = getVoiceSeedAddress();
  if (!addr) throw new Error("NEXT_PUBLIC_VOICE_SEED_CONTRACT_ADDRESS is not set");
  return new Contract(addr, ABI, signer);
}

export async function mintVoiceSeed(
  signer: Signer,
  to: string,
  tokenURI: string
): Promise<{ tx: ContractTransactionResponse; tokenId: bigint }> {
  const c = getVoiceSeedContractWithSigner(signer);
  const tx = await c.mintSeed(to, tokenURI);
  const receipt = await tx.wait();
  if (!receipt) throw new Error("Transaction failed");
  const iface = c.interface;
  let tokenId: bigint | null = null;
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      if (parsed?.name === "VoiceSeedMinted") {
        tokenId = parsed.args[0] as bigint;
        break;
      }
    } catch {
      /* not our event */
    }
  }
  if (tokenId === null) {
    throw new Error("Could not parse VoiceSeedMinted tokenId");
  }
  return { tx, tokenId };
}

export { ABI as VOICE_SEED_ABI };
