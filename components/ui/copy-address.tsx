'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyAddressProps {
    address: string;
    className?: string;
}

export function CopyAddress({ address, className }: CopyAddressProps) {
    const [copied, setCopied] = useState(false);

    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(address);
            setCopied(true);
            toast.success('Address copied');
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error('Could not copy the address');
        }
    };

    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
        <div className={cn('mt-1 flex items-center gap-1', className)}>
            <span className="font-mono text-xs text-green-600">{shortAddress}</span>
            <button
                type="button"
                onClick={copyAddress}
                className="cursor-pointer rounded-md p-0.5 text-green-700 transition-colors hover:bg-green-100"
                aria-label="Copy address"
                title={copied ? 'Copied' : 'Copy address'}
            >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
        </div>
    );
}
