'use client';

import { useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useMutation } from 'convex/react';

import { api } from '@/convex/_generated/api';
import { toConvexUserSyncPayload } from '@/lib/auth/sync-user';
import { walletUserFromAddress } from '@/lib/auth/wallet-user';
import { arc } from '@/constants';

/** Sync connected wallet → Convex userProfiles (id = wallet address). */
export function WalletConnectionTracker() {
    const { address, isConnected, chain } = useAccount();
    const createBasicUserProfile = useMutation(api.users.createBasicUserProfile);
    const updateUserWallet = useMutation(api.users.updateWalletData);
    const lastSynced = useRef<string | null>(null);

    useEffect(() => {
        if (!isConnected || !address) {
            lastSynced.current = null;
            return;
        }

        const key = `${address.toLowerCase()}:${chain?.id ?? 0}`;
        if (lastSynced.current === key) return;

        const user = walletUserFromAddress(address);
        const onArc = chain?.id === arc.id;

        void (async () => {
            try {
                await createBasicUserProfile(
                    toConvexUserSyncPayload(user, { arcAddress: onArc ? address : undefined }),
                );
                await updateUserWallet({
                    clerkUserId: user.id,
                    walletAddress: address,
                    arcAddress: onArc ? address : undefined,
                    walletConnectedAt: Date.now(),
                    walletProvider: 'walletconnect',
                });
                lastSynced.current = key;
            } catch (error) {
                console.error('Failed to sync wallet user to Convex:', error);
            }
        })();
    }, [address, chain?.id, createBasicUserProfile, isConnected, updateUserWallet]);

    return null;
}
