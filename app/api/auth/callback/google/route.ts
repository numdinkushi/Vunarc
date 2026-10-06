import { NextRequest, NextResponse } from 'next/server';

import { OAUTH_STATE_COOKIE_NAME } from '@/constants/auth';
import { AuthError } from '@/lib/enums';
import { expiredOauthStateCookie, sessionCookie } from '@/lib/auth/cookies';
import { exchangeGoogleCode, verifyGoogleIdToken } from '@/lib/auth/google';
import { createSessionToken } from '@/lib/auth/session';
import { syncAuthUserToConvex } from '@/lib/auth/sync-user';

function redirectAfterAuth(request: NextRequest, error?: AuthError) {
    const url = new URL(error ? '/sign-in' : '/dashboard', request.url);
    if (error) url.searchParams.set('auth', error);
    const response = NextResponse.redirect(url);
    response.cookies.set(expiredOauthStateCookie());
    return response;
}

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const expectedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;

    if (!code || !state || !expectedState || state !== expectedState) {
        return redirectAfterAuth(request, AuthError.Denied);
    }

    try {
        const idToken = await exchangeGoogleCode(code);
        const user = await verifyGoogleIdToken(idToken);

        try {
            await syncAuthUserToConvex(user);
        } catch (syncError) {
            console.error('Convex user sync failed after Google login:', syncError);
        }

        const response = redirectAfterAuth(request);
        response.cookies.set(sessionCookie(createSessionToken(user)));
        return response;
    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return redirectAfterAuth(request, AuthError.Failed);
    }
}
