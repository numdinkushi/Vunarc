'use client';

import { WalletConnect } from '@/components/web3/WalletConnect';
import { AuthStatus } from '@/lib/enums';
import { useMounted } from '@/hooks/use-mounted';
import { useUser } from '@/hooks/use-user';

interface AuthControlsProps {
    scrolled?: boolean;
    compact?: boolean;
}

export function AuthControls({ scrolled = true, compact = false }: AuthControlsProps) {
    const mounted = useMounted();
    const { status } = useUser();

    if (!mounted || status === AuthStatus.Loading) {
        return <span className="text-xs text-muted-foreground">Checking wallet…</span>;
    }

    return (
        <div className={compact ? 'space-y-3' : 'flex items-center gap-3'}>
            <WalletConnect
                size="sm"
                variant={scrolled || compact ? 'outline' : 'secondary'}
            />
        </div>
    );
}
