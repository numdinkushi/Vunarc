import {
    GOOGLE_AUTH_URL,
    GOOGLE_SCOPES,
    GOOGLE_TOKEN_INFO_URL,
    GOOGLE_TOKEN_URL,
} from '@/constants/auth';
import { AuthProvider } from '@/lib/enums';
import { requiredEnv } from '@/lib/utils/env';
import type { AuthUser } from '@/types/user';

interface GoogleTokenResponse {
    id_token?: string;
    error?: string;
    error_description?: string;
}

interface GoogleTokenInfo {
    aud?: string;
    sub?: string;
    email?: string;
    email_verified?: string;
    given_name?: string;
    family_name?: string;
    picture?: string;
    error?: string;
    error_description?: string;
}

export function getGoogleRedirectUri(): string {
    return requiredEnv('GOOGLE_REDIRECT_URI');
}

export function buildGoogleAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
        client_id: requiredEnv('GOOGLE_CLIENT_ID'),
        redirect_uri: getGoogleRedirectUri(),
        response_type: 'code',
        scope: GOOGLE_SCOPES,
        state,
        access_type: 'online',
        prompt: 'select_account',
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string): Promise<string> {
    const body = new URLSearchParams({
        client_id: requiredEnv('GOOGLE_CLIENT_ID'),
        client_secret: requiredEnv('GOOGLE_CLIENT_SECRET'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: getGoogleRedirectUri(),
    });

    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        cache: 'no-store',
    });

    const payload = (await response.json()) as GoogleTokenResponse;
    if (!response.ok || !payload.id_token) {
        throw new Error(payload.error_description || payload.error || 'Google token exchange failed');
    }
    return payload.id_token;
}

export async function verifyGoogleIdToken(idToken: string): Promise<AuthUser> {
    const url = new URL(GOOGLE_TOKEN_INFO_URL);
    url.searchParams.set('id_token', idToken);

    const response = await fetch(url, { cache: 'no-store' });
    const payload = (await response.json()) as GoogleTokenInfo;

    if (!response.ok || !payload.sub || !payload.email) {
        throw new Error(payload.error_description || payload.error || 'Google identity verification failed');
    }

    if (payload.aud !== requiredEnv('GOOGLE_CLIENT_ID')) {
        throw new Error('Google token was issued for a different client');
    }

    if (payload.email_verified === 'false') {
        throw new Error('Google email is not verified');
    }

    return {
        id: payload.sub,
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        imageUrl: payload.picture || null,
        authProvider: AuthProvider.Wallet,
        walletAddress: '',
    };
}
