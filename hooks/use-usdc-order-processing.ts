import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';
import { ARC_CONTRACT_ADDRESS, VUNARC_PAYMENTS_ABI } from '../constants/arc';
import { PAYMENT_SECURITY, splitUsdcPayment } from '../constants/payments';

interface OrderData {
    buyerId: string;
    farmerId: string;
    products: Array<{
        productId: string;
        name: string;
        price: number;
        quantity: number;
        unit: string;
    }>;
    totalAmount: number;
    farmerAmount: number;
    dispatcherAmount: number;
    deliveryAddress: string;
    deliveryCoordinates?: {
        lat: number;
        lng: number;
    };
    pickupLocation?: string;
    pickupCoordinates?: {
        lat: number;
        lng: number;
    };
    deliveryDistance: number;
    deliveryCost: number;
    totalCost: number;
    specialInstructions?: string;
    estimatedPickupTime?: string;
    estimatedDeliveryTime?: string;
}

export function useUsdcOrderProcessing() {
    const { user } = useUser();
    const { address, isConnected } = useAccount();
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [currentTotalAmount, setCurrentTotalAmount] = useState(0);

    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const createOrder = useMutation(api.orders.createOrder);
    const updateUsdcPayment = useMutation(api.orders.updateUsdcPayment);

    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (isConfirmed && hash && currentOrderId) {
            handleTransactionSuccess(
                currentOrderId,
                hash,
                receipt?.blockNumber ? Number(receipt.blockNumber) : undefined,
                currentTotalAmount
            );
            setCurrentOrderId(null);
            setCurrentTotalAmount(0);
        }
    }, [isConfirmed, hash, currentOrderId, receipt, currentTotalAmount]);

    const processOrderWithUsdcPayment = async (orderData: OrderData) => {
        if (!user || !address || !isConnected) {
            toast.error('Please connect your wallet and sign in');
            return { success: false };
        }

        if (isProcessing) {
            toast.error('Order is already being processed. Please wait...');
            return { success: false };
        }

        setIsProcessing(true);

        try {
            const farmerProfile = await fetch(`/api/users/arc-address?userId=${orderData.farmerId}`)
                .then(r => r.json())
                .catch(() => null);

            const farmerAddress = farmerProfile?.arcAddress;
            const platformAddress = process.env.NEXT_PUBLIC_PLATFORM_ARC_ADDRESS;

            if (!farmerAddress || farmerAddress === 'unset') {
                toast.error('Farmer Arc address is not configured. Ask them to connect a wallet on Arc.');
                return { success: false };
            }

            const orderId = await createOrder({
                ...orderData,
                dispatcherId: undefined,
                paymentMethod: 'usdc' as const,
                paymentStatus: 'pending' as const,
                orderStatus: 'pending' as const,
                usdcFromAddress: address,
                usdcFarmerAddress: farmerAddress,
                usdcDispatcherAddress: undefined,
                usdcPlatformAddress: platformAddress,
            });

            return { success: true, orderId };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Order processing failed';
            toast.error(`Order failed: ${errorMessage}`);
            return { success: false, error: errorMessage };
        } finally {
            setIsProcessing(false);
        }
    };

    const processUsdcPayment = async (orderId: string, farmerAmount: number, dispatcherAmount: number) => {
        if (!user || !address || !isConnected) {
            toast.error('Please connect your wallet and sign in');
            return { success: false };
        }

        if (!ARC_CONTRACT_ADDRESS) {
            toast.error('Arc contract address is not configured.');
            return { success: false };
        }

        if (isProcessing) {
            toast.error('Payment is already being processed. Please wait...');
            return { success: false };
        }

        setIsProcessing(true);

        try {
            const order = await fetch(`/api/orders/${orderId}`).then(r => r.json()).catch(() => null);
            if (!order) {
                toast.error('Order not found');
                return { success: false };
            }

            if (!order.usdcFarmerAddress || !order.usdcPlatformAddress) {
                toast.error('Arc payout addresses are missing on this order.');
                return { success: false };
            }

            const split = splitUsdcPayment(
                farmerAmount || order.farmerAmount,
                dispatcherAmount || order.dispatcherAmount || 0
            );
            const dispatcherAddress = order.usdcDispatcherAddress || '0x0000000000000000000000000000000000000000';

            setCurrentOrderId(orderId);
            setCurrentTotalAmount(split.totalUsdc);

            await writeContract({
                address: ARC_CONTRACT_ADDRESS,
                abi: VUNARC_PAYMENTS_ABI,
                functionName: 'processOrderPayment',
                args: [
                    orderId,
                    order.usdcFarmerAddress as `0x${string}`,
                    dispatcherAddress as `0x${string}`,
                    split.farmerWei,
                    split.dispatcherWei,
                    split.platformWei,
                    PAYMENT_SECURITY.SECRET,
                ],
                value: split.totalWei,
            });

            toast.success('USDC payment submitted. Waiting for Arc finality...');
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';
            toast.error(`Payment failed: ${errorMessage}`);
            return { success: false, error: errorMessage };
        } finally {
            setIsProcessing(false);
        }
    };

    const handleTransactionSuccess = async (orderId: string, txHash: string, blockNumber?: number, totalAmount?: number) => {
        try {
            await updateUsdcPayment({
                orderId: orderId as Id<"orders">,
                usdcTxHash: txHash,
                usdcBlockNumber: blockNumber,
                usdcFromAddress: address!,
                usdcAmountPaid: totalAmount || 0,
            });
            toast.success('USDC payment settled on Arc.');
        } catch (error) {
            console.error('Failed to update USDC payment details:', error);
            toast.error('Payment processed but failed to update the order. Please contact support.');
        }
    };

    return {
        processOrderWithUsdcPayment,
        processUsdcPayment,
        isProcessing: isProcessing || isPending || isConfirming,
        hash,
        isConfirmed,
        error,
        formatEther,
    };
}
