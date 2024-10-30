// app/index.tsx

import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import WelcomeScreens from '@/components/onboarding/WelcomeScreens';

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            await getCurrentUser();
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(false);
        }
    }

    if (isAuthenticated === null) {
        return null;
    }

    if (isAuthenticated) {
        return <Redirect href='/initialization' />;
    }

    return <WelcomeScreens />;
}
