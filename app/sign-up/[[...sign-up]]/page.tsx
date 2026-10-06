'use client';

import { Suspense } from 'react';

import { WalletAuthCard } from '@/components/auth/WalletAuthCard';

export default function SignUpPage() {
    return (
        <Suspense>
            <WalletAuthCard
                title="Join Vunarc"
                description="Connect a wallet that supports Arc and USDC to get started"
            />
        </Suspense>
    );
}
