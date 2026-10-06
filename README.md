# Vunarc

Vunarc is a farm-to-door marketplace for South Africa. Farmers list produce, buyers place an order with a delivery address, and dispatchers move it. Checkout is priced in USDC, and the payment settles on Arc.

**Live demo:** [https://vunarc.vercel.app/](https://vunarc.vercel.app/)

**Repository:** [https://github.com/numdinkushi/Vunarc](https://github.com/numdinkushi/Vunarc)

## What it uses Arc for

Vunarc runs payments on **Arc mainnet** (chain ID `5042`, RPC `https://rpc.mainnet.arc.io`). On Arc, USDC is the native gas token. Native USDC and the ERC-20 view of USDC are one balance, so a wallet does not need a second token to pay gas.

A buyer confirms an order and sees:

- distance and delivery cost
- product cost
- a **2.5% platform fee**
- the total in USDC

They can pay with **USDC on Arc** or choose cash on delivery. A USDC order is saved, a confirmation toast appears, and the app opens the dashboard so they can pay from there.

Paying calls `VunarcPayments.processOrderPayment`. One transaction splits the USDC three ways:

- the farmer
- the dispatcher
- the platform fee (250 basis points on the farmer and dispatcher amounts)

Cash on delivery does not touch the contract.

## Roles

| Role | What they do |
| --- | --- |
| Buyer | Orders produce and pays in USDC on Arc, or in cash on delivery |
| Farmer | Lists products and receives the product amount on their Arc address |
| Dispatcher | Claims deliveries and receives the delivery amount on their Arc address |

Each dashboard shows the connected Arc address in short form, with a copy button that copies the full address. The wallet card also shows the USDC balance and pending earnings or pending payment.

## Hackathon

This build is for the [Arc Microgrants](https://community.arc.io/public/events/arc-microgrants-f8tijfjhyq) program. Submissions close **14 October 2026, 23:59 ET**.

The program asks for:

- a project already deployed and working on **Arc mainnet**
- a link to the live app
- a public repository
- a short description of what the project does and what it uses Arc for
- a public builder profile on GitHub, X, or Farcaster

Testnet-only builds, mockups, and slide decks are not eligible. This repository targets Arc mainnet. The deployed contract address is `NEXT_PUBLIC_ARC_CONTRACT_ADDRESS`. Gas and order value are both USDC.

## Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS, Radix UI, Framer Motion
- Convex for orders, products, and profiles
- Cloudinary for images
- wagmi and viem for wallet connection
- Solidity (`contracts/contracts/VunarcPayments.sol`) on Arc

Sign-in is a wallet connection on Arc.

## Getting started

Requirements: Node.js 18+, a Convex project, a Cloudinary account, and a WalletConnect project id.

```bash
npm install
npx convex dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Environment variables:

```env
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
NEXT_PUBLIC_ARC_CONTRACT_ADDRESS=
NEXT_PUBLIC_PLATFORM_ARC_ADDRESS=
NEXT_PUBLIC_APP_URL=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Contract deploy only. Do not commit these.
ARC_PRIVATE_KEY=
FEE_RECIPIENT_ADDRESS=
NEXT_PUBLIC_PAYMENT_SECRET=
```

Deploy the payment contract to Arc mainnet from `contracts/`:

```bash
npm run deploy:arc
```

Then set `NEXT_PUBLIC_ARC_CONTRACT_ADDRESS` to the deployed address. A buyer, farmer, and the platform each need an Arc address before a USDC payment can split.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Arc payments](docs/ARC_INTEGRATION.md)
- [Testing](docs/TESTING_GUIDE.md)
- [Contract security and withdrawals](docs/SECURITY_AND_WITHDRAWALS.md)

## License

MIT
