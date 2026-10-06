'use client';

import { useMemo } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { AuthStatus } from '@/lib/enums';
import type { AuthUser } from '@/types/user';
import { shortAddress, walletUserFromAddress } from '@/lib/auth/wallet-user';

interface UseUserResult {
    user: AuthUser | null;
    status: AuthStatus;
    isLoaded: boolean;
    isSignedIn: boolean;
    signIn: () => void;
    signOut: () => Promise<void>;
}

export function useUser(): UseUserResult {
    const { address, isConnected, isConnecting, isReconnecting, status: accountStatus } = useAccount();
    const { connectors, connect } = useConnect();
    const { disconnectAsync } = useDisconnect();

    const isLoaded = accountStatus !== 'connecting' && !isReconnecting;
    const user = useMemo(
        () => (isConnected && address ? walletUserFromAddress(address) : null),
        [isConnected, address]
    );

    function signIn() {
        const preferred =
            connectors.find((c) => c.id === 'walletConnect') ||
            connectors.find((c) => c.id === 'metaMask') ||
            connectors[0];
        if (preferred) connect({ connector: preferred });
    }

    async function signOut() {
        await disconnectAsync();
    }

    return {
        user,
        status: !isLoaded || isConnecting
            ? AuthStatus.Loading
            : user
                ? AuthStatus.Authenticated
                : AuthStatus.Unauthenticated,
        isLoaded,
        isSignedIn: Boolean(user),
        signIn,
        signOut,
    };
}

export { shortAddress };
