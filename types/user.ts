import { AuthProvider } from '@/lib/enums';

export interface AuthUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    authProvider: AuthProvider;
    walletAddress: string;
}
