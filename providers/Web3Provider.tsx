'use client';

import type { ReactNode } from 'react';
import { createConfig, http, WagmiProvider, type CreateConnectorFn } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

import { arc, ARC_NETWORKS, WALLET_APP_METADATA, WALLET_CONNECT_PROJECT_ID } from '@/constants';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

function buildConnectors(): CreateConnectorFn[] {
    const list: CreateConnectorFn[] = [
        injected({ shimDisconnect: true }),
        metaMask({
            dappMetadata: {
                name: WALLET_APP_METADATA.name,
                url: WALLET_APP_METADATA.url,
            },
        }),
    ];

    if (WALLET_CONNECT_PROJECT_ID && !/^0+$/.test(WALLET_CONNECT_PROJECT_ID)) {
        list.push(
            walletConnect({
                projectId: WALLET_CONNECT_PROJECT_ID,
                metadata: {
                    name: WALLET_APP_METADATA.name,
                    description: WALLET_APP_METADATA.description,
                    url: WALLET_APP_METADATA.url,
                    icons: WALLET_APP_METADATA.icons,
                },
                showQrModal: true,
            }),
        );
    }

    return list;
}

export const wagmiConfig = createConfig({
    chains: [arc],
    transports: {
        [arc.id]: http(ARC_NETWORKS.MAINNET.rpcUrl),
    },
    connectors: buildConnectors(),
    ssr: true,
});

export default function Web3Provider({ children }: { children: ReactNode }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    );
}
