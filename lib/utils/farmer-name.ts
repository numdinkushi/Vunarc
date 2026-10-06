import { shortAddress } from '@/lib/auth/wallet-user';

export interface FarmerNameFields {
    firstName?: string | null;
    lastName?: string | null;
    businessName?: string | null;
    clerkUserId?: string | null;
}

function looksLikeWalletLabel(value: string): boolean {
    const trimmed = value.trim();
    return /^0x[a-fA-F0-9]{4}/.test(trimmed) || /^0x[a-fA-F0-9]{1,6}[.…]+[a-fA-F0-9]{3,}$/i.test(trimmed);
}

/** Prefer farm / person name over a wallet address label. */
export function getFarmerDisplayName(farmer?: FarmerNameFields | null, fallback = 'Unknown Farmer'): string {
    if (!farmer) return fallback;

    const business = farmer.businessName?.trim();
    if (business) return business;

    const full = [farmer.firstName, farmer.lastName].filter(Boolean).join(' ').trim();
    if (full && !looksLikeWalletLabel(full)) return full;

    if (farmer.clerkUserId) return shortAddress(farmer.clerkUserId);
    return fallback;
}
