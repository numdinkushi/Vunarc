'use client';

import { useState, useEffect } from 'react';
import { CeloPayment } from './CeloPayment';
import { Order } from '../dashboard/buyer/types';
import { toast } from 'sonner';

interface CeloPaymentWithAddressFallbackProps {
    order: Order;
    onPaymentSuccess: (txHash: string) => void;
    onPaymentError: (error: string) => void;
}

export function CeloPaymentWithAddressFallback({
    order,
    onPaymentSuccess,
    onPaymentError
}: CeloPaymentWithAddressFallbackProps) {
    const [arcAddresses, setCeloAddresses] = useState<{
        farmerAddress: string | null;
        dispatcherAddress: string | null;
    }>({
        farmerAddress: null,
        dispatcherAddress: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('CeloPaymentWithAddressFallback mounted, starting fetch...');
        // Always fetch addresses from user profiles for reliability
        fetchAddressesFromProfiles();
    }, []);

    const fetchAddressesFromProfiles = async () => {
        console.log('Starting fetchAddressesFromProfiles...');
        setIsLoading(true);
        setError(null);

        try {
            console.log('Fetching CELO addresses from profiles for:', {
                farmerId: order.farmerId,
                dispatcherId: order.dispatcherId
            });

            const [farmerResponse, dispatcherResponse] = await Promise.all([
                fetch(`/api/users/arc-address?userId=${order.farmerId}`),
                fetch(`/api/users/arc-address?userId=${order.dispatcherId}`)
            ]);

            console.log('API responses:', {
                farmerStatus: farmerResponse.status,
                dispatcherStatus: dispatcherResponse.status
            });

            if (!farmerResponse.ok || !dispatcherResponse.ok) {
                const errorMsg = `API request failed: ${farmerResponse.status} ${dispatcherResponse.status}`;
                setError(errorMsg);
                toast.error('Failed to fetch addresses');
                return;
            }

            const [farmerData, dispatcherData] = await Promise.all([
                farmerResponse.json(),
                dispatcherResponse.json()
            ]);

            console.log('API data received:', { farmerData, dispatcherData });

            const farmerAddress = farmerData.arcAddress;
            const dispatcherAddress = dispatcherData.arcAddress;

            console.log('Extracted addresses:', { farmerAddress, dispatcherAddress });

            // Check if addresses are valid
            if (!farmerAddress || !dispatcherAddress) {
                const missingAddresses = [];
                if (!farmerAddress) missingAddresses.push('Farmer');
                if (!dispatcherAddress) missingAddresses.push('Dispatcher');

                const errorMsg = `${missingAddresses.join(' and ')} Arc address${missingAddresses.length > 1 ? 'es are' : ' is'} not configured`;
                setError(errorMsg);
                toast.error('Arc payout addresses are not configured');
                return;
            }

            setCeloAddresses({
                farmerAddress,
                dispatcherAddress,
            });

            console.log('Addresses set successfully:', { farmerAddress, dispatcherAddress });
            toast.success('Arc payout addresses loaded');

        } catch (error) {
            // Handle errors gracefully without throwing
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch CELO addresses';

            // Truncate long error messages for better UX
            const truncatedError = errorMessage.length > 100
                ? errorMessage.substring(0, 100) + '...'
                : errorMessage;

            setError(truncatedError);
            toast.error('Failed to load addresses');
        } finally {
            console.log('Setting isLoading to false');
            setIsLoading(false);
        }
    };

    console.log('Render state:', { isLoading, error, arcAddresses });

    if (isLoading) {
        return (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-blue-600 text-sm">Loading Arc payout addresses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                    ⚠️ {error}
                </p>
                <button
                    onClick={fetchAddressesFromProfiles}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!arcAddresses.farmerAddress || !arcAddresses.dispatcherAddress) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">
                    Arc payout addresses are missing. Ask the farmer and dispatcher to connect a wallet on Arc.
                </p>
            </div>
        );
    }

    console.log('Rendering CeloPayment with addresses:', arcAddresses);

    return (
        <CeloPayment
            zarAmount={order.totalCost}
            orderId={order._id}
            farmerAddress={arcAddresses.farmerAddress}
            dispatcherAddress={arcAddresses.dispatcherAddress}
            farmerZarAmount={order.farmerAmount || 0}
            dispatcherZarAmount={order.dispatcherAmount || 0}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
        />
    );
}
