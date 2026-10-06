import { ConvexHttpClient } from 'convex/browser';

import { requiredEnv } from '@/lib/utils/env';

let client: ConvexHttpClient | null = null;

export function getConvexClient(): ConvexHttpClient {
    if (!client) {
        client = new ConvexHttpClient(requiredEnv('NEXT_PUBLIC_CONVEX_URL'));
    }
    return client;
}
