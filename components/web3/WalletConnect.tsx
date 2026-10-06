'use client';

import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { arc, ARC_NETWORKS } from '@/constants';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface WalletConnectProps {
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'outline' | 'secondary' | 'ghost';
    showFullAddress?: boolean;
}

export function WalletConnect({
    size = 'sm',
    variant = 'outline',
    showFullAddress = false
}: WalletConnectProps) {
    const { address, isConnected, chain } = useAccount();
    const { connectors, connect, isPending } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain, isPending: isSwitching } = useSwitchChain();

    const [showNetworkSwitchDialog, setShowNetworkSwitchDialog] = useState(false);
    const [hasPromptedForSwitch, setHasPromptedForSwitch] = useState(false);

    const formatAddress = (addr: string) => {
        if (showFullAddress) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const isCorrectNetwork = () => chain?.id === arc.id;

    const handleSwitchToArc = async () => {
        try {
            await switchChain({ chainId: ARC_NETWORKS.MAINNET.chainId });
            toast.success('Switched to Arc');
            setShowNetworkSwitchDialog(false);
        } catch (error) {
            console.error('Failed to switch network:', error);
            toast.error('Failed to switch network. Switch to Arc in your wallet.');
        }
    };

    useEffect(() => {
        if (isConnected && address && !isCorrectNetwork() && !hasPromptedForSwitch) {
            setShowNetworkSwitchDialog(true);
            setHasPromptedForSwitch(true);
        }

        if (!isConnected) {
            setHasPromptedForSwitch(false);
        }
    }, [isConnected, address, chain?.id, hasPromptedForSwitch]);

    if (isConnected && address) {
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={variant} size={size} className="gap-2">
                            <Wallet className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {formatAddress(address)}
                            </span>
                            {isCorrectNetwork() ? (
                                <Badge variant="default" className="text-xs">Arc</Badge>
                            ) : (
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                        <div className="p-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Connected Wallet</span>
                                {isCorrectNetwork() ? (
                                    <Badge variant="default" className="text-xs">Arc</Badge>
                                ) : (
                                    <Badge variant="destructive" className="text-xs">Wrong Network</Badge>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                                {formatAddress(address)}
                            </div>
                            {!isCorrectNetwork() && (
                                <div className="text-xs text-red-500 mb-2 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" />
                                    Switch to Arc to pay with USDC
                                </div>
                            )}
                        </div>

                        {!isCorrectNetwork() && (
                            <>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs h-7"
                                        onClick={handleSwitchToArc}
                                        disabled={isSwitching}
                                    >
                                        {isSwitching ? (
                                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                        ) : (
                                            <ArrowRight className="h-3 w-3 mr-1" />
                                        )}
                                        Arc Mainnet
                                    </Button>
                                </div>
                            </>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => disconnect()} className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Disconnect
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <AlertDialog open={showNetworkSwitchDialog} onOpenChange={setShowNetworkSwitchDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-orange-500" />
                                Switch to Arc
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Your wallet is on <strong>{chain?.name || 'another network'}</strong>.
                                Vunarc settles orders in USDC on Arc, and Arc uses USDC for gas.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Button
                                className="w-full justify-between"
                                onClick={handleSwitchToArc}
                                disabled={isSwitching}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Arc Mainnet
                                </div>
                                {isSwitching ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <ArrowRight className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setShowNetworkSwitchDialog(false)}>
                                Maybe Later
                            </AlertDialogCancel>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} disabled={isPending}>
                    <Wallet className="mr-2 h-4 w-4" />
                    {isPending ? 'Connecting...' : 'Connect Wallet'}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="p-2 mb-2">
                    <div className="text-sm font-medium mb-1">Connect Wallet</div>
                    <div className="text-xs text-muted-foreground">
                        Connect a wallet that can hold USDC on Arc
                    </div>
                </div>
                <DropdownMenuSeparator />
                {connectors.map((connector) => (
                        <DropdownMenuItem
                            key={connector.uid}
                            onClick={() => connect({ connector, chainId: arc.id })}
                            className="cursor-pointer"
                            disabled={isPending}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Wallet className="h-3 w-3" />
                                </div>
                                <span>{connector.name}</span>
                                {(connector.id === 'metaMask' || connector.id === 'injected') && (
                                    <Badge variant="secondary" className="text-xs ml-auto">
                                        Browser
                                    </Badge>
                                )}
                                {connector.id === 'walletConnect' && (
                                    <Badge variant="secondary" className="text-xs ml-auto">
                                        Mobile
                                    </Badge>
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
