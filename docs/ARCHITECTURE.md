# Vunarc architecture

Vunarc connects South African farmers, buyers, and dispatchers. Orders are stored in Convex. USDC payments settle on Arc mainnet in one transaction that pays the farmer, the dispatcher, and a 2.5% platform fee.

## Stack

- **App**: Next.js 15, React 19, TypeScript
- **Data**: Convex
- **Images**: Cloudinary
- **Wallet**: wagmi and viem
- **Chain**: Arc mainnet, chain ID `5042`
- **Contract**: `contracts/contracts/VunarcPayments.sol`

## Sign-in and profiles

A user connects a wallet that can hold USDC on Arc. `useUser` treats the connected address as the signed-in user.

After connecting, they pick a role and complete a profile:

- `buyer`
- `farmer`
- `dispatcher`

The profile is stored in Convex. The id field is still named `clerkUserId` and holds the wallet address. The Arc address used for payouts is stored separately and must be set before a USDC split can be sent.

## Order flow

1. A buyer opens a product and enters a delivery address.
2. The app calculates distance, delivery cost, product cost, the 2.5% platform fee, and the USDC total.
3. **USDC on Arc**: `useUsdcOrderProcessing` creates a pending order, shows a success toast, and the product page sends the buyer to `/dashboard`.
4. **Cash on delivery**: the order is created without an Arc transaction. Payment happens off chain when the order arrives.

From the dashboard, a USDC payment calls `processOrderPayment` with:

- the order id
- the farmer Arc address
- the dispatcher Arc address, or the zero address if none is assigned yet
- farmer, dispatcher, and platform amounts in wei
- the frontend payment secret
- `msg.value` equal to the sum of those three amounts

On Arc, `msg.value` is native USDC with 18 decimals. The contract requires the three amounts to add up to `msg.value`, then transfers each share.

## Fee

`PLATFORM_FEE_RATE_BASIS_POINTS` is `250` (2.5%). The fee is applied to the farmer amount plus the dispatcher amount. `splitUsdcPayment` in `constants/payments.ts` is the source of the wei values sent to the contract.
