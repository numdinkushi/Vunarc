'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWalletBalance } from '@/hooks/use-wallet-balance';

interface BalanceDisplayProps {
    showActions?: boolean;
    compact?: boolean;
}

export function BalanceDisplay({ showActions = true, compact = false }: BalanceDisplayProps) {
    const {
        usdcBalanceFormatted,
        usdcBalanceLoading,
        isWalletConnected,
        isOnArc,
        walletAddress,
        refreshBalances,
    } = useWalletBalance();

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                    {isWalletConnected ? `${usdcBalanceFormatted} USDC` : 'USDC'}
                </span>
                {usdcBalanceLoading && (
                    <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
            </div>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                        USDC on Arc
                    </div>
                    <div className="flex items-center gap-2">
                        {isWalletConnected && isOnArc ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <Badge variant={isWalletConnected && isOnArc ? "default" : "secondary"} className="text-xs">
                            {isWalletConnected && isOnArc ? "Arc" : "Not on Arc"}
                        </Badge>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {isWalletConnected ? (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                    {usdcBalanceFormatted} USDC
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Native balance. This also pays Arc gas.
                                </div>
                            </div>
                            {usdcBalanceLoading && (
                                <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                            )}
                        </div>

                        {walletAddress && (
                            <div className="text-xs text-muted-foreground">
                                Wallet: {formatAddress(walletAddress)}
                            </div>
                        )}

                        {showActions && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refreshBalances()}
                                disabled={usdcBalanceLoading}
                                className="w-full"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh Balance
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="text-muted-foreground mb-2">
                            Connect a wallet on Arc to see your USDC balance
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
