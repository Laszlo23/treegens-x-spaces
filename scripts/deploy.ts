import hre from "hardhat";

/**
 * Deploy VoiceSeed (run with `--network baseSepolia` or `--network base`).
 * Requires `DEPLOYER_PRIVATE_KEY` and optional RPC URLs in `.env` — loaded by Hardhat config.
 */
async function main() {
  const pk = process.env.DEPLOYER_PRIVATE_KEY?.trim();
  if (!pk) {
    throw new Error(
      "Missing DEPLOYER_PRIVATE_KEY in environment. Add it to .env (see project docs). Never commit keys."
    );
  }

  const net = await hre.ethers.provider.getNetwork();
  const chainId = net.chainId;
  const isMainnet = chainId === 8453n;

  const f = await hre.ethers.getContractFactory("VoiceSeed");
  const voiceSeed = await f.deploy();
  await voiceSeed.waitForDeployment();
  const address = await voiceSeed.getAddress();
  console.log("Network chainId:", chainId.toString());
  console.log("VoiceSeed deployed to:", address);
  console.log("");
  console.log("Add to .env for the Next.js app:");
  console.log(`NEXT_PUBLIC_VOICE_SEED_CONTRACT_ADDRESS=${address}`);
  if (isMainnet) {
    console.log("");
    console.log("Base mainnet: set also");
    console.log("NEXT_PUBLIC_USE_BASE_MAINNET=true");
    console.log("NEXT_PUBLIC_BASE_MAINNET_RPC=https://mainnet.base.org  # or your RPC");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
