# Testing Vunarc on Arc

Use Arc mainnet. The hackathon submission has to be deployed and working there. Testnet is not a valid submission network.

## Before you start

- Node.js 18+
- A wallet that can add Arc (chain ID `5042`)
- A small amount of USDC on Arc for gas and for the order
- `NEXT_PUBLIC_ARC_CONTRACT_ADDRESS` set to the mainnet deployment
- `NEXT_PUBLIC_PLATFORM_ARC_ADDRESS` set
- Convex running (`npx convex dev` locally, or the production deployment for the live app)

## Contract

```bash
cd contracts
npm install
npx hardhat compile
npm run deploy:arc
```

Confirm the new address on [explorer.arc.io](https://explorer.arc.io), then put it in `NEXT_PUBLIC_ARC_CONTRACT_ADDRESS`.

## Buyer order

1. Open the app and connect a wallet on Arc.
2. Complete a profile. For a full split, you also need a farmer profile whose Arc address is saved.
3. Open a product, enter a South African delivery address, and wait for the distance and costs.
4. Leave the payment method on **USDC on Arc**.
5. Confirm the purchase.
6. You should see one success toast, then land on `/dashboard`.
7. Pay the order from the dashboard.
8. Open the transaction on [explorer.arc.io](https://explorer.arc.io). The value is USDC, and the receipt should show transfers to the farmer, the dispatcher when one is set, and the platform address.

## Dispatcher

1. Connect the dispatcher wallet on Arc.
2. Open `/dashboard`.
3. The wallet card should show the short address, a copy button, the USDC balance, and pending earnings.
4. Copy should put the full address on the clipboard.

## Cash on delivery

Choosing cash on delivery creates an order and does not send an Arc transaction. That path is not the Arc submission demo.
