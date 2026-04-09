import dotenv from "dotenv";

dotenv.config();

import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

function deployerAccounts(): string[] {
  const raw = process.env.DEPLOYER_PRIVATE_KEY?.trim();
  if (!raw) return [];
  const key = raw.startsWith("0x") ? raw : `0x${raw}`;
  return [key];
}

/**
 * Hardhat config for compiling VoiceSeed.sol.
 * Deploy: `npm run deploy:base-sepolia` or `npm run deploy:base` (loads `.env` via dotenv)
 */
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    hardhat: {},
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: deployerAccounts(),
      chainId: 84532,
    },
    base: {
      url: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
      accounts: deployerAccounts(),
      chainId: 8453,
    },
  },
};

export default config;
