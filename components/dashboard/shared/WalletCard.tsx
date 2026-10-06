'use client';

import { useBalanceDisplay } from '../../../hooks/use-balance-display';
import { useWalletBalance } from '../../../hooks/use-wallet-balance';
import { BalanceLoading } from '../../ui/balance-loading';
import { WalletConnect } from '../../web3/WalletConnect';
import { Badge } from '../../ui/badge';
import { motion } from 'framer-motion';
import { RefreshCw, Wallet } from 'lucide-react';
import { CopyAddress } from '../../ui/copy-address';

interface WalletCardProps {
    className?: string;
}

export function WalletCard({ className = '' }: WalletCardProps) {
    const {
        walletBalanceFormatted,
        ledgerBalance,
        getBalanceColor,
        getBalanceIcon,
        formatLedgerBalance,
        formatUsdc,
        userRole,
        isLoading,
        isRefreshing,
        refreshBalance,
        isWalletConnected,
        isOnArc,
        walletAddress,
        walletBalance,
    } = useBalanceDisplay();

    const { refreshBalances } = useWalletBalance();

    const handleRefresh = async () => {
        await Promise.all([refreshBalance(), refreshBalances()]);
    };

    if (isLoading) {
        return (
            <BalanceLoading
                className={className}
                showRefreshButton={true}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
            />
        );
    }

    return (
        <motion.div
            className={`bg-white rounded-lg shadow p-6 ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Wallet Overview</h3>
                    {isOnArc ? (
                        <Badge className="bg-green-600 text-white text-xs">Arc</Badge>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    {!isWalletConnected && <WalletConnect size="sm" variant="outline" />}
                    <motion.button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            isRefreshing
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                        }`}
                        whileHover={!isRefreshing ? { scale: 1.1 } : {}}
                        whileTap={!isRefreshing ? { scale: 0.9 } : {}}
                        title="Refresh balance"
                    >
                        <motion.div
                            animate={isRefreshing ? { rotate: 360 } : {}}
                            transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                        >
                            <RefreshCw size={16} />
                        </motion.div>
                    </motion.button>
                </div>
            </div>

            {isWalletConnected && walletAddress ? (
                <motion.div
                    className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center gap-2 text-green-700">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm font-medium">Wallet Connected</span>
                    </div>
                    <CopyAddress address={walletAddress} />
                </motion.div>
            ) : (
                <motion.div
                    className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-amber-700">
                            <Wallet className="h-4 w-4" />
                            <span className="text-sm font-medium">Connect a wallet to see USDC on Arc</span>
                        </div>
                        <WalletConnect size="sm" variant="outline" />
                    </div>
                </motion.div>
            )}

            <div className="space-y-4">
                <motion.div
                    className="flex justify-between items-start"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="flex flex-col text-gray-600">
                        <span className="flex items-center">
                            <span className="mr-2">{getBalanceIcon('wallet', walletBalance)}</span>
                            USDC Balance
                        </span>
                        {/* Arc docs: native USDC and ERC-20 USDC are one balance — show a single row. */}
                        <span className="text-xs text-muted-foreground ml-6">
                            Native USDC on Arc (also pays gas)
                        </span>
                    </span>
                    <span className={`font-bold text-lg ${getBalanceColor('wallet', walletBalance)}`}>
                        {formatUsdc(Number(walletBalanceFormatted))}
                    </span>
                </motion.div>

                <motion.div
                    className="flex justify-between items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="flex items-center text-gray-600">
                        <span className="mr-2">{getBalanceIcon('ledger', ledgerBalance, userRole)}</span>
                        {userRole === 'buyer' ? 'Pending Payment' : 'Pending Earnings'}
                    </span>
                    <span className={`font-bold text-lg ${getBalanceColor('ledger', ledgerBalance, userRole)}`}>
                        {formatLedgerBalance(ledgerBalance, userRole)}
                    </span>
                </motion.div>
            </div>
        </motion.div>
    );
}
