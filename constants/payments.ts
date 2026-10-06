import { formatEther, parseEther } from 'viem';

export enum PaymentMethod {
    USDC = 'usdc',
    CASH = 'cash',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
}

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PREPARING = 'preparing',
    READY = 'ready',
    IN_TRANSIT = 'in_transit',
    ARRIVED = 'arrived',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum Currency {
    USDC = 'USDC',
}

export const ARC_CHAIN_ID = 5042;

export const ARC_NETWORKS = {
    MAINNET: {
        chainId: ARC_CHAIN_ID,
        name: 'Arc',
        rpcUrl: 'https://rpc.mainnet.arc.io',
        blockExplorer: 'https://explorer.arc.io',
        nativeCurrency: {
            name: 'USDC',
            symbol: 'USDC',
            decimals: 18,
        },
    },
} as const;

export const PLATFORM_FEE_RATE_BASIS_POINTS = 250;
export const PLATFORM_FEE_RATE_PERCENTAGE = 2.5;

export const CONVERSION_RATES = {
    PLATFORM_FEE_RATE_BASIS_POINTS,
    PLATFORM_FEE_RATE_PERCENTAGE,
} as const;

export const PAYMENT_METHOD_LABELS = {
    [PaymentMethod.USDC]: 'USDC on Arc',
    [PaymentMethod.CASH]: 'Cash on Delivery',
} as const;

export const PAYMENT_METHOD_DESCRIPTIONS = {
    [PaymentMethod.USDC]: 'Pay with USDC. Gas is USDC too, and the payment settles on Arc.',
    [PaymentMethod.CASH]: 'Pay with cash when your order is delivered',
} as const;

export const PAYMENT_SECURITY = {
    SECRET: process.env.NEXT_PUBLIC_PAYMENT_SECRET || 'vunarc_secure_payments',
} as const;

export const formatUsdc = (amount: number): string => {
    return `${amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} USDC`;
};

export const calculatePlatformFee = (amount: number): number => {
    return Number(((amount * PLATFORM_FEE_RATE_PERCENTAGE) / 100).toFixed(6));
};

/**
 * Split a checkout into native USDC wei.
 * On Arc, msg.value is USDC with 18 decimals, and the three parts must sum exactly.
 */
export const splitUsdcPayment = (farmerAmount: number, dispatcherAmount: number) => {
    const farmerWei = parseEther(farmerAmount.toFixed(6));
    const dispatcherWei = parseEther(dispatcherAmount.toFixed(6));
    const platformWei = ((farmerWei + dispatcherWei) * BigInt(PLATFORM_FEE_RATE_BASIS_POINTS)) / BigInt(10000);
    const totalWei = farmerWei + dispatcherWei + platformWei;

    return {
        farmerWei,
        dispatcherWei,
        platformWei,
        totalWei,
        totalUsdc: Number(formatEther(totalWei)),
        platformUsdc: Number(formatEther(platformWei)),
    };
};

export const isValidPaymentMethod = (method: string): method is PaymentMethod => {
    return Object.values(PaymentMethod).includes(method as PaymentMethod);
};

export const isValidPaymentStatus = (status: string): status is PaymentStatus => {
    return Object.values(PaymentStatus).includes(status as PaymentStatus);
};

export const isValidOrderStatus = (status: string): status is OrderStatus => {
    return Object.values(OrderStatus).includes(status as OrderStatus);
};
