'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Banknote, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import {
    PaymentMethod,
    PAYMENT_METHOD_LABELS,
    PAYMENT_METHOD_DESCRIPTIONS,
    calculatePlatformFee,
    formatUsdc,
} from '@/constants';
import { useWalletBalance } from '@/hooks/use-wallet-balance';
import { WalletConnect } from '@/components/web3/WalletConnect';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';

interface PaymentMethodSelectorProps {
    zarAmount: number;
    orderId: string;
    farmerAddress?: string;
    dispatcherAddress?: string;
    farmerZarAmount: number;
    dispatcherZarAmount: number;
    onPaymentSuccess: (paymentId: string, method: PaymentMethod) => void;
    onPaymentError: (error: string) => void;
}

export function PaymentMethodSelector({
    zarAmount,
    orderId,
    farmerZarAmount,
    dispatcherZarAmount,
    onPaymentSuccess,
    onPaymentError
}: PaymentMethodSelectorProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.USDC);
    const [isProcessing, setIsProcessing] = useState(false);

    const { isWalletConnected, walletAddress, isOnArc } = useWalletBalance();
    const updatePaymentMethod = useMutation(api.orders.updatePaymentMethod);

    const platformFee = calculatePlatformFee(farmerZarAmount + dispatcherZarAmount);
    const totalUsdc = farmerZarAmount + dispatcherZarAmount + platformFee;

    const handleConfirmSelection = async () => {
        if (selectedMethod === PaymentMethod.USDC && (!isWalletConnected || !isOnArc)) {
            toast.error('Connect a wallet on Arc to pay with USDC');
            return;
        }

        setIsProcessing(true);
        try {
            await updatePaymentMethod({
                orderId: orderId as Id<"orders">,
                paymentMethod: selectedMethod,
            });

            toast.success(`Payment method set to ${PAYMENT_METHOD_LABELS[selectedMethod]}.`);
            onPaymentSuccess('method-selected', selectedMethod);
        } catch (error) {
            console.error('Failed to update payment method:', error);
            toast.error('Failed to update payment method. Please try again.');
            onPaymentError('Failed to update payment method');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Pay with USDC</h2>
                <p className="text-gray-300">USDC on Arc is the default. Cash is available at delivery.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Card className={`bg-black/40 backdrop-blur-sm border transition-colors cursor-pointer ${selectedMethod === PaymentMethod.USDC ? 'border-blue-500' : 'border-gray-600'}`}>
                    <CardHeader className="pb-3 cursor-pointer" onClick={() => setSelectedMethod(PaymentMethod.USDC)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Wallet className="h-6 w-6 text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-lg">
                                        {PAYMENT_METHOD_LABELS[PaymentMethod.USDC]}
                                    </CardTitle>
                                    <p className="text-gray-400 text-sm">
                                        {PAYMENT_METHOD_DESCRIPTIONS[PaymentMethod.USDC]}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-blue-400 border-blue-400">
                                Default
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {!isWalletConnected || !isOnArc ? (
                            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-center space-x-2 text-amber-400">
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="text-sm">Connect a wallet on Arc</span>
                                </div>
                                <WalletConnect size="sm" variant="outline" />
                            </div>
                        ) : (
                            <div className="space-y-2 text-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Farmer</span>
                                    <span className="text-blue-400">{formatUsdc(farmerZarAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dispatcher</span>
                                    <span className="text-blue-400">{formatUsdc(dispatcherZarAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Platform fee</span>
                                    <span className="text-blue-400">{formatUsdc(platformFee)}</span>
                                </div>
                                <div className="flex justify-between font-semibold border-t border-gray-600 pt-2">
                                    <span>Total</span>
                                    <span className="text-blue-400">{formatUsdc(totalUsdc)}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-green-400 text-xs">
                                    <CheckCircle className="h-3 w-3" />
                                    <span>Wallet {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className={`bg-black/40 backdrop-blur-sm border transition-colors cursor-pointer ${selectedMethod === PaymentMethod.CASH ? 'border-green-500' : 'border-gray-600'}`}>
                    <CardHeader className="pb-3 cursor-pointer" onClick={() => setSelectedMethod(PaymentMethod.CASH)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Banknote className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-lg">
                                        {PAYMENT_METHOD_LABELS[PaymentMethod.CASH]}
                                    </CardTitle>
                                    <p className="text-gray-400 text-sm">
                                        {PAYMENT_METHOD_DESCRIPTIONS[PaymentMethod.CASH]}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-green-400 border-green-400">
                                {formatUsdc(zarAmount)}
                            </Badge>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="flex space-x-4">
                <Button
                    variant="outline"
                    onClick={() => onPaymentError('cancelled')}
                    className="flex-1 bg-transparent border-gray-600 text-white hover:bg-white/10 hover:border-white/20"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleConfirmSelection}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                    {isProcessing ? 'Processing...' : 'Confirm'}
                </Button>
            </div>
        </div>
    );
}
