import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig({ path: "../.env.local" });
dotEnvConfig({ path: "../.env" });

const deployerKey = process.env.ARC_PRIVATE_KEY;
if (!deployerKey) {
    console.warn("ARC_PRIVATE_KEY is not set; Arc deploys will fail.");
}

const config: HardhatUserConfig = {
    networks: {
        arc: {
            accounts: deployerKey ? [deployerKey] : [],
            url: "https://rpc.mainnet.arc.io",
            chainId: 5042,
        },
        arcTestnet: {
            accounts: deployerKey ? [deployerKey] : [],
            url: "https://rpc.testnet.arc.io",
            chainId: 5042002,
        },
    },
    sourcify: {
        enabled: false,
    },
    solidity: {
        version: "0.8.24",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
};

export default config;
