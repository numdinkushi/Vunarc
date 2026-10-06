export const API_ROUTES = {
    me: '/api/me',
    googleLogin: '/api/auth/google',
    googleCallback: '/api/auth/callback/google',
    logout: '/api/auth/logout',
} as const;

export const AUTH_COOKIE_NAME = 'vunarc_session';
export const OAUTH_STATE_COOKIE_NAME = 'vunarc_oauth_state';
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const OAUTH_STATE_MAX_AGE_SECONDS = 60 * 10;

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
export const GOOGLE_SCOPES = 'openid email profile';
