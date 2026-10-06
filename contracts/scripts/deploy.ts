/* eslint-disable */
import hre from "hardhat";
import { createPublicClient, createWalletClient, http, keccak256, stringToBytes, type Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const ARC_MAINNET: Chain = {
    id: 5042,
    name: "Arc",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc.mainnet.arc.io"] },
        public: { http: ["https://rpc.mainnet.arc.io"] },
    },
    blockExplorers: {
        default: { name: "Arc Explorer", url: "https://explorer.arc.io" },
    },
};

const ARC_TESTNET: Chain = {
    id: 5042002,
    name: "Arc Testnet",
    nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
    rpcUrls: {
        default: { http: ["https://rpc.testnet.arc.io"] },
        public: { http: ["https://rpc.testnet.arc.io"] },
    },
    blockExplorers: {
        default: { name: "Arc Explorer", url: "https://explorer.testnet.arc.io" },
    },
    testnet: true,
};

const MIN_MAX_FEE_PER_GAS = 20_000_000_000n;

async function main() {
    console.log("Deploying VunarcPayments contract...");

    const feeRecipient = process.env.FEE_RECIPIENT_ADDRESS || process.env.NEXT_PUBLIC_PLATFORM_ARC_ADDRESS;
    const secret = process.env.NEXT_PUBLIC_PAYMENT_SECRET || "vunarc_secure_payments";
    const privateKey = process.env.ARC_PRIVATE_KEY as `0x${string}` | undefined;

    if (!feeRecipient) {
        throw new Error("FEE_RECIPIENT_ADDRESS or NEXT_PUBLIC_PLATFORM_ARC_ADDRESS environment variable is required");
    }
    if (!privateKey) {
        throw new Error("ARC_PRIVATE_KEY is required to deploy");
    }

    const secretHash = keccak256(stringToBytes(secret));
    const chain = hre.network.name === "arcTestnet" ? ARC_TESTNET : ARC_MAINNET;
    const account = privateKeyToAccount(privateKey);
    const transport = http(chain.rpcUrls.default.http[0]);
    const publicClient = createPublicClient({ chain, transport });
    const walletClient = createWalletClient({ account, chain, transport });

    console.log("Fee recipient:", feeRecipient);
    console.log("Secret hash:", secretHash);
    console.log("Network:", chain.name, chain.id);
    console.log("Deployer:", account.address);

    const balance = await publicClient.getBalance({ address: account.address });
    console.log("Native USDC balance (wei):", balance.toString());
    if (balance === 0n) {
        throw new Error(
            `Deployer ${account.address} has 0 native USDC on ${chain.name}. Arc uses USDC for gas. Fund this wallet, then rerun.`,
        );
    }

    const artifact = await hre.artifacts.readArtifact("VunarcPayments");
    const hash = await walletClient.deployContract({
        abi: artifact.abi,
        bytecode: artifact.bytecode as `0x${string}`,
        args: [feeRecipient, secretHash],
        account,
        maxFeePerGas: MIN_MAX_FEE_PER_GAS,
        maxPriorityFeePerGas: MIN_MAX_FEE_PER_GAS,
    });

    console.log("Deploy tx:", hash);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const contractAddress = receipt.contractAddress;
    if (!contractAddress) {
        throw new Error("Deployment mined but no contract address was returned");
    }

    console.log("VunarcPayments deployed to:", contractAddress);

    console.log("\n=== Deployment Summary ===");
    console.log("Contract Address:", contractAddress);
    console.log("Fee Recipient:", feeRecipient);
    console.log("Platform Fee Rate: 250 basis points (2.5%)");
    console.log("Network:", chain.name);
    console.log("Secret Hash:", secretHash);
    console.log("Explorer:", `${chain.blockExplorers?.default.url}/address/${contractAddress}`);

    console.log("\n=== Next Steps ===");
    console.log("1. Update .env.local with:");
    console.log(`   NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=${contractAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
