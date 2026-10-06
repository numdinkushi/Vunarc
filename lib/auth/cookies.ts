import {
    AUTH_COOKIE_MAX_AGE_SECONDS,
    AUTH_COOKIE_NAME,
    OAUTH_STATE_COOKIE_NAME,
    OAUTH_STATE_MAX_AGE_SECONDS,
} from '@/constants/auth';
import { isProduction } from '@/lib/utils/env';

export type AuthCookie = {
    name: string;
    value: string;
    httpOnly: true;
    sameSite: 'lax';
    path: '/';
    secure: boolean;
    maxAge: number;
};

function baseCookie(): Pick<AuthCookie, 'httpOnly' | 'sameSite' | 'path' | 'secure'> {
    return {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction(),
    };
}

export function sessionCookie(token: string): AuthCookie {
    return {
        name: AUTH_COOKIE_NAME,
        value: token,
        ...baseCookie(),
        maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    };
}

export function expiredSessionCookie(): AuthCookie {
    return {
        name: AUTH_COOKIE_NAME,
        value: '',
        ...baseCookie(),
        maxAge: 0,
    };
}

export function oauthStateCookie(state: string): AuthCookie {
    return {
        name: OAUTH_STATE_COOKIE_NAME,
        value: state,
        ...baseCookie(),
        maxAge: OAUTH_STATE_MAX_AGE_SECONDS,
    };
}

export function expiredOauthStateCookie(): AuthCookie {
    return {
        name: OAUTH_STATE_COOKIE_NAME,
        value: '',
        ...baseCookie(),
        maxAge: 0,
    };
}
