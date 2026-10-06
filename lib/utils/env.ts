export function requiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
}
