import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as fs from "fs";
import * as path from "path";

// Native .env parser to avoid external dotenv dependency
function loadEnv() {
  const possiblePaths = [
    path.resolve(__dirname, ".env"),
    path.resolve(__dirname, "../../.env")
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const parts = trimmed.split("=");
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
            process.env[key] = value;
          }
        }
      }
      break;
    }
  }
}
loadEnv();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    pharosTestnet: {
      url: "https://atlantic.dplabs-internal.com",
      chainId: 688689,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
