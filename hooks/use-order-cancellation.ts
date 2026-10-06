import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { toast } from 'sonner';

interface CancelOrderParams {
    orderId: string;
    buyerId: string;
    buyerLiskId?: string;
    dispatcherId?: string;
    farmerId: string;
    totalCost: number;
    dispatcherAmount: number;
    farmerAmount: number;
    reason: string;
    paymentMethod?: 'usdc' | 'cash';
}

export function useOrderCancellation() {
    const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

    const cancelOrder = async ({
        orderId,
        reason,
        paymentMethod = 'usdc',
    }: CancelOrderParams): Promise<{ success: boolean; waitingForConfirmation?: boolean; }> => {
        try {
            await updateOrderStatus({
                orderId,
                orderStatus: 'cancelled',
                cancellationReason: reason,
            });

            if (paymentMethod === 'usdc') {
                toast.success('Order cancelled. A USDC payment that already settled on Arc is not reversed automatically.');
            } else {
                toast.success('Order cancelled');
            }

            return { success: true };
        } catch (error) {
            console.error('Order cancellation failed:', error);
            toast.error('Could not cancel this order.');
            return { success: false };
        }
    };

    return { cancelOrder };
}
