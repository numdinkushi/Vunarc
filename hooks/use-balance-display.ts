import { useQuery } from 'convex/react';
import { useUser } from '@/hooks/use-user';
import { api } from '../convex/_generated/api';
import { useWalletBalance } from '@/hooks/use-wallet-balance';

export function formatUsdc(amount: number, sign: '' | '+' | '-' = ''): string {
    const value = Number.isFinite(amount) ? amount : 0;
    return `${sign}${value.toFixed(2)} USDC`;
}

export function useBalanceDisplay() {
    const { user } = useUser();
    const {
        usdcBalance,
        usdcBalanceFormatted,
        usdcBalanceLoading,
        isWalletConnected,
        isOnArc,
        walletAddress,
        refreshBalances,
    } = useWalletBalance();

    const userProfile = useQuery(api.users.getUserProfile, {
        clerkUserId: user?.id || '',
    });

    const balance = useQuery(api.balances.getUserBalanceWithLedger, {
        clerkUserId: user?.id || '',
        token: 'USDC',
        role: userProfile?.role || 'buyer',
    });

    const ledgerBalance = balance?.ledgerBalance ?? 0;
    // Prefer live on-chain USDC (native Arc gas + payments); fall back to stored Convex value.
    const walletBalance = isWalletConnected ? usdcBalance : (balance?.walletBalance ?? 0);
    const isLoading = userProfile === undefined || (user?.id ? balance === undefined : false);
    const isRefreshing = usdcBalanceLoading;

    const refreshBalance = async () => {
        await refreshBalances();
    };

    const getBalanceColor = (type: 'wallet' | 'ledger', amount: number, role?: string) => {
        if (type === 'ledger') {
            if (role === 'buyer') {
                return amount > 0 ? 'text-red-500' : 'text-gray-500';
            }
            if (role === 'farmer' || role === 'dispatcher') {
                return amount > 0 ? 'text-green-500' : 'text-gray-500';
            }
            return amount > 0 ? 'text-green-500' : amount < 0 ? 'text-red-500' : 'text-gray-500';
        }
        return 'text-blue-600';
    };

    const getBalanceIcon = (type: 'wallet' | 'ledger', amount: number, role?: string) => {
        if (type === 'ledger') {
            if (role === 'buyer') return amount > 0 ? '↘️' : '➖';
            if (role === 'farmer' || role === 'dispatcher') return amount > 0 ? '↗️' : '➖';
            return amount > 0 ? '↗️' : amount < 0 ? '↘️' : '➖';
        }
        return '💰';
    };

    const formatLedgerBalance = (amount: number, role?: string) => {
        if (role === 'buyer') {
            return amount > 0 ? formatUsdc(amount, '-') : formatUsdc(amount);
        }
        if (role === 'farmer' || role === 'dispatcher') {
            return amount > 0 ? formatUsdc(amount, '+') : formatUsdc(amount);
        }
        return formatUsdc(amount);
    };

    return {
        walletBalance,
        walletBalanceFormatted: isWalletConnected ? usdcBalanceFormatted : walletBalance.toFixed(2),
        /** Native Arc balance is USDC (gas + payments on Arc). */
        arcNativeBalance: walletBalance,
        arcNativeBalanceFormatted: isWalletConnected ? usdcBalanceFormatted : walletBalance.toFixed(2),
        ledgerBalance,
        isLoading,
        isRefreshing,
        isWalletConnected,
        isOnArc,
        walletAddress,
        refreshBalance,
        getBalanceColor,
        getBalanceIcon,
        formatLedgerBalance,
        formatUsdc,
        userRole: userProfile?.role,
    };
}
