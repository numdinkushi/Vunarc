'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import { WalletConnect } from '@/components/web3/WalletConnect';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { useUser } from '@/hooks/use-user';

interface WalletAuthCardProps {
    title: string;
    description: string;
}

export function WalletAuthCard({ title, description }: WalletAuthCardProps) {
    const router = useRouter();
    const { isSignedIn, isLoaded } = useUser();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.replace('/dashboard');
        }
    }, [isLoaded, isSignedIn, router]);

    return (
        <div className="min-h-screen relative">
            <div className="absolute inset-0 z-0">
                <VideoBackground videoUrl="/assets/video/falling_leaves.mp4" fallbackImage="/assets/background_images/image4.jpg" />
            </div>
            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
                        <p className="text-gray-600 mb-8">{description}</p>
                        <div className="flex justify-center">
                            <WalletConnect size="lg" variant="default" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
