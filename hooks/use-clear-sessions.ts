'use client';

import { useUser } from '@/hooks/use-user';
import { useState } from 'react';

export function useClearSessions() {
    const { signOut, isSignedIn } = useUser();
    const [isClearing, setIsClearing] = useState(false);

    const clearCurrentSession = async () => {
        if (!isSignedIn) return;
        setIsClearing(true);
        try {
            await signOut();
        } finally {
            setIsClearing(false);
        }
    };

    return {
        isClearing,
        clearCurrentSession,
        clearAllSessions: clearCurrentSession,
        hasActiveSession: isSignedIn,
    };
}
