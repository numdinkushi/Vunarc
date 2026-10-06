import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';

import { oauthStateCookie } from '@/lib/auth/cookies';
import { buildGoogleAuthorizationUrl } from '@/lib/auth/google';

export async function GET() {
    try {
        const state = randomUUID();
        const response = NextResponse.redirect(buildGoogleAuthorizationUrl(state));
        response.cookies.set(oauthStateCookie(state));
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Google sign-in is not configured';
        console.error('Google OAuth start error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
