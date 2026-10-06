export enum AuthProvider {
    Wallet = 'wallet',
}

export enum AuthStatus {
    Loading = 'loading',
    Authenticated = 'authenticated',
    Unauthenticated = 'unauthenticated',
}

export enum AuthError {
    Denied = 'denied',
    Failed = 'failed',
}
