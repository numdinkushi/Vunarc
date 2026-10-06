#!/usr/bin/env tsx
/**
 * Pull Vunalet catalog (from tmp export) and push into Vunarc via importCatalog mutation.
 *
 * Usage:
 *   npx tsx scripts/seed-from-vunalet.ts
 */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

const VUNARC_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://curious-gerbil-938.convex.cloud';

function readJsonl<T>(path: string): T[] {
    return readFileSync(path, 'utf8')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => JSON.parse(line) as T);
}

async function main() {
    const root = resolve(__dirname, '..');
    const products = readJsonl<Record<string, unknown>>(resolve(root, 'tmp/vunarc-import/products.jsonl'));
    const categories = readJsonl<Record<string, unknown>>(resolve(root, 'tmp/vunarc-import/categories.jsonl'));

    console.log(`Seeding Vunarc (${VUNARC_URL})`);
    console.log(`  categories: ${categories.length}`);
    console.log(`  products: ${products.length}`);

    const client = new ConvexHttpClient(VUNARC_URL);
    const result = await client.mutation(api.importCatalog.importVunaletCatalog, {
        clearExisting: true,
        categories: categories as never,
        products: products as never,
    });

    console.log('Done:', result);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
