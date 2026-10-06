import { NextApiRequest, NextApiResponse } from 'next';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const userProfile = await convex.query(api.users.getUserProfile, {
            clerkUserId: userId as string
        });

        if (!userProfile) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({
            userId: userProfile._id,
            arcAddress: userProfile.arcAddress || null,
            hasAddress: !!userProfile.arcAddress
        });
    } catch (error) {
        console.error('Error fetching Arc address:', error);
        return res.status(500).json({
            error: 'Failed to fetch Arc address',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
