import type { ConnectedWallet } from "@privy-io/react-auth";
import { BrowserProvider } from "ethers";
import { appChain } from "@/config/chain";

/**
 * Resolve the active EVM wallet from Privy’s list for signing / RPC.
 */
export function pickEthereumWallet(
  wallets: ConnectedWallet[]
): ConnectedWallet | undefined {
  return wallets.find((w) => w.type === "ethereum");
}

/** Normalize Privy’s CAIP-2 / hex chain id to a number. */
export function walletChainIdNumber(wallet: ConnectedWallet): number {
  const id = wallet.chainId;
  if (id.includes(":")) {
    const parts = id.split(":");
    return Number(parts[parts.length - 1]);
  }
  if (id.startsWith("0x")) return parseInt(id, 16);
  return Number(id);
}

export async function ensureAppChain(wallet: ConnectedWallet): Promise<void> {
  const target = appChain().id;
  if (walletChainIdNumber(wallet) !== target) {
    await wallet.switchChain(target);
  }
}

/**
 * Ethers v6 signer for contract calls — matches Privy’s recommended flow.
 * @see https://docs.privy.io/wallets/connectors/ethereum/integrations/ethers
 */
export async function getEthersSigner(wallet: ConnectedWallet) {
  await ensureAppChain(wallet);
  const eip1193 = await wallet.getEthereumProvider();
  const provider = new BrowserProvider(eip1193);
  return provider.getSigner();
}
