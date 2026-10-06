import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from '@/constants/auth';
import { AuthProvider } from '@/lib/enums';
import { requiredEnv } from '@/lib/utils/env';
import type { AuthUser } from '@/types/user';

interface SessionPayload extends AuthUser {
    exp: number;
}

function sign(value: string): string {
    return createHmac('sha256', requiredEnv('GOOGLE_CLIENT_SECRET')).update(value).digest('base64url');
}

export function createSessionToken(user: AuthUser): string {
    const payload: SessionPayload = {
        ...user,
        exp: Math.floor(Date.now() / 1000) + AUTH_COOKIE_MAX_AGE_SECONDS,
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${encoded}.${sign(encoded)}`;
}

export function readSessionToken(token: string): AuthUser | null {
    const [encoded, signature] = token.split('.');
    if (!encoded || !signature) return null;

    const expected = sign(encoded);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
        return null;
    }

    try {
        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload;
        if (!payload.id || !payload.email || payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return {
            id: payload.id,
            email: payload.email,
            firstName: payload.firstName || '',
            lastName: payload.lastName || '',
            imageUrl: payload.imageUrl || null,
            authProvider: payload.authProvider || AuthProvider.Wallet,
            walletAddress: payload.walletAddress || '',
        };
    } catch {
        return null;
    }
}

export async function getSessionUser(): Promise<AuthUser | null> {
    const jar = await cookies();
    const token = jar.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;
    return readSessionToken(token);
}
