'use client';

import { Suspense } from 'react';

import { WalletAuthCard } from '@/components/auth/WalletAuthCard';

export default function SignInPage() {
    return (
        <Suspense>
            <WalletAuthCard
                title="Connect Wallet"
                description="Connect a wallet that supports Arc and USDC to use Vunarc"
            />
        </Suspense>
    );
}
