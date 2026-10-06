import { AuthProvider } from '@/lib/enums';
import type { AuthUser } from '@/types/user';

export function shortAddress(address: string): string {
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function normalizeWalletAddress(address: string): string {
    return address.toLowerCase();
}

export function walletUserFromAddress(address: string): AuthUser {
    const walletAddress = normalizeWalletAddress(address);
    return {
        id: walletAddress,
        email: `${walletAddress}@wallet.vunarc.local`,
        firstName: shortAddress(address),
        lastName: '',
        imageUrl: null,
        authProvider: AuthProvider.Wallet,
        walletAddress,
    };
}
