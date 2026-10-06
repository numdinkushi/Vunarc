import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';
import { useUsdcOrderProcessing } from './use-usdc-order-processing';

interface ConfirmOrderParams {
    orderId: string;
    buyerId: string;
    buyerLiskId?: string;
    dispatcherId?: string;
    farmerId: string;
    totalCost: number;
    dispatcherAmount: number;
    farmerAmount: number;
    paymentMethod?: 'usdc' | 'cash';
}

export function useOrderConfirmation() {
    const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
    const updatePaymentStatus = useMutation(api.orders.updatePaymentStatus);
    const { processUsdcPayment } = useUsdcOrderProcessing();

    const confirmOrder = async ({
        orderId,
        dispatcherAmount,
        farmerAmount,
        paymentMethod = 'usdc',
    }: ConfirmOrderParams) => {
        try {
            if (paymentMethod === 'usdc') {
                const paymentResult = await processUsdcPayment(orderId, farmerAmount, dispatcherAmount);
                if (paymentResult.success) {
                    toast.success('USDC payment submitted. Waiting for Arc finality...');
                    return { success: true, waitingForConfirmation: true };
                }
                toast.error('USDC payment failed. Please try again.');
                return { success: false };
            }

            await Promise.all([
                updateOrderStatus({
                    orderId,
                    orderStatus: 'delivered',
                }),
                updatePaymentStatus({
                    orderId,
                    paymentStatus: 'paid',
                }),
            ]);

            toast.success('Cash order confirmed');
            return { success: true };
        } catch (error) {
            console.error('Order confirmation failed:', error);
            return { success: false };
        }
    };

    return { confirmOrder };
}
