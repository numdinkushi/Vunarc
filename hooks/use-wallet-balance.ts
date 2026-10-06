import { useAccount, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useMutation } from 'convex/react';
import { useUser } from '@/hooks/use-user';
import { api } from '@/convex/_generated/api';
import { useCallback, useEffect } from 'react';
import { arc } from '@/constants';

export function useWalletBalance() {
    const { user } = useUser();
    const { address, isConnected, chain } = useAccount();

    const { data: balanceData, isLoading: balanceLoading, refetch } = useBalance({
        address,
        chainId: arc.id,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const upsertBalance = useMutation((api as unknown as any).balances.upsertUserBalance);

    const usdcBalance = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;
    const usdcBalanceFormatted = usdcBalance.toFixed(2);
    const isOnArc = chain?.id === arc.id;

    useEffect(() => {
        if (!user?.id || !address || !balanceData) return;

        upsertBalance({
            clerkUserId: user.id,
            token: 'USDC',
            walletBalance: usdcBalance,
            ledgerBalance: 0,
        }).catch((error: unknown) => {
            console.error('Failed to store USDC balance:', error);
        });
    }, [user?.id, address, usdcBalance, balanceData, upsertBalance]);

    const refreshBalances = useCallback(async () => {
        await refetch();
    }, [refetch]);

    return {
        usdcBalance,
        usdcBalanceFormatted,
        usdcBalanceLoading: balanceLoading,
        isWalletConnected: isConnected,
        walletAddress: address,
        isOnArc,
        chainId: chain?.id,
        refreshBalances,
    };
}
