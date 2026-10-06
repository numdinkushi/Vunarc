# Arc payment integration

Vunarc settles order payments on Arc mainnet. USDC is both the order currency and the gas token.

## Network

| | |
| --- | --- |
| Name | Arc |
| Chain ID | `5042` |
| RPC | `https://rpc.mainnet.arc.io` |
| Explorer | `https://explorer.arc.io` |
| Native currency | USDC, 18 decimals |

Defined in `constants/arc.ts` and `constants/payments.ts`. The optional ERC-20 view of native USDC is `0x3600000000000000000000000000000000000000`. It is the same balance as native USDC.

Arc testnet (chain ID `5042002`) exists in the Hardhat config for experiments. Arc Microgrants requires a project that is deployed and working on **mainnet**. A testnet-only deploy is not eligible.

## Contract

`VunarcPayments` (`contracts/contracts/VunarcPayments.sol`) accepts native USDC and splits it.

`processOrderPayment(orderId, farmer, dispatcher, farmerAmount, dispatcherAmount, platformAmount, secret)`

- `msg.value` must equal `farmerAmount + dispatcherAmount + platformAmount`
- the farmer address cannot be zero
- a zero dispatcher address skips the dispatcher transfer
- the payment secret must hash to `secretHash`
- the same order id cannot be paid twice

Deploy:

```bash
cd contracts
npm install
npm run deploy:arc
```

`ARC_PRIVATE_KEY` and `FEE_RECIPIENT_ADDRESS` must be set. Copy the deployed address into `NEXT_PUBLIC_ARC_CONTRACT_ADDRESS`. The platform payout address is `NEXT_PUBLIC_PLATFORM_ARC_ADDRESS`.

## App flow

`hooks/use-usdc-order-processing.ts`

1. Load the farmer Arc address.
2. Create the order in Convex with payment status `pending`.
3. The product page toasts and redirects to `/dashboard`.
4. `processUsdcPayment` sends `processOrderPayment` through wagmi.
5. After the receipt, the order is updated with the transaction hash.

The buyer must be connected to Arc. The wallet prompt tells them to switch network when they are not.

## Checkout amounts

The product page shows distance, delivery cost, product cost, the 2.5% platform fee, and the total in USDC. `splitUsdcPayment` converts the farmer and dispatcher amounts into wei and adds the platform share so the three parts sum exactly.
