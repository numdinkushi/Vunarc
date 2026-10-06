import { api } from '@/convex/_generated/api';
import { getConvexClient } from '@/lib/convex/client';
import type { AuthUser } from '@/types/user';

export interface ConvexUserSyncPayload {
    clerkUserId: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    arcAddress?: string;
}

export function toConvexUserSyncPayload(user: AuthUser, options?: { arcAddress?: string }): ConvexUserSyncPayload {
    return {
        clerkUserId: user.id,
        email: user.email,
        firstName: user.firstName || shortFallback(user.id),
        lastName: user.lastName || '',
        ...(user.imageUrl ? { profilePicture: user.imageUrl } : {}),
        ...(options?.arcAddress ? { arcAddress: options.arcAddress } : {}),
    };
}

function shortFallback(id: string): string {
    return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

export async function syncAuthUserToConvex(user: AuthUser): Promise<void> {
    await getConvexClient().mutation(
        api.users.createBasicUserProfile,
        toConvexUserSyncPayload(user),
    );
}
