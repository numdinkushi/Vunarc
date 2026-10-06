import { useState, useEffect } from 'react';
import { PaymentMethod, formatUsdc } from '@/constants';
import { useWalletBalance } from './use-wallet-balance';
import { useWalletProfile } from './use-wallet-profile';

interface PaymentMethodResult {
    selectedMethod: PaymentMethod;
    setSelectedMethod: (method: PaymentMethod) => void;
    availableMethods: PaymentMethod[];
    hasSufficientUsdc: boolean;
    isWalletConnected: boolean;
    getFormattedAmount: (amount: number) => string;
}

interface UsePaymentMethodProps {
    amount: number;
    initialMethod?: PaymentMethod;
}

export function usePaymentMethod({ amount, initialMethod }: UsePaymentMethodProps): PaymentMethodResult {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(
        initialMethod || PaymentMethod.USDC
    );

    const { preferredPaymentMethod } = useWalletProfile();
    const { usdcBalance, isWalletConnected } = useWalletBalance();
    const hasSufficientUsdc = isWalletConnected && usdcBalance >= amount;

    const availableMethods: PaymentMethod[] = [PaymentMethod.USDC, PaymentMethod.CASH];

    useEffect(() => {
        if (initialMethod) return;
        if (preferredPaymentMethod === PaymentMethod.CASH) {
            setSelectedMethod(PaymentMethod.CASH);
            return;
        }
        setSelectedMethod(PaymentMethod.USDC);
    }, [preferredPaymentMethod, initialMethod]);

    return {
        selectedMethod,
        setSelectedMethod,
        availableMethods,
        hasSufficientUsdc,
        isWalletConnected,
        getFormattedAmount: formatUsdc,
    };
}
