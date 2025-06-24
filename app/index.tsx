// app/index.tsx

import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import WelcomeScreens from '@/components/onboarding/WelcomeScreens';
import { configureAmplify } from '@/config/amplify';
import { AppDispatch } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import { authService } from '@/utils/auth';
import React, { useEffect, useState } from 'react';

import { router } from 'expo-router';

import { useDispatch } from 'react-redux';

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userHasName, setUserHasName] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch<AppDispatch>();

    // Initialize Amplify first
    useEffect(() => {
        configureAmplify();
    }, []);

    // Effect for initial auth check and user data fetch
    useEffect(() => {
        const checkAuthAndFetchUserData = async () => {
            try {
                const { isAuthenticated: sessionAuthenticated } = await authService.checkSession();
                setIsAuthenticated(sessionAuthenticated);

                if (sessionAuthenticated) {
                    // Use cache-aware getUserAsync for faster startup
                    const resultAction = await dispatch(getUserAsync({ useCache: true }));
                    if (getUserAsync.fulfilled.match(resultAction)) {
                        const userData = resultAction.payload;
                        if (!userData) {
                            setIsAuthenticated(false);
                            setIsLoading(false);
                            return;
                        }
                        setUserHasName(!!userData.FirstName);
                    } else {
                        setIsAuthenticated(false);
                    }
                }
                setIsLoading(false);
            } catch (error) {
                console.log(error);
                setIsAuthenticated(false);
                setIsLoading(false);
            }
        };

        checkAuthAndFetchUserData();
    }, [dispatch]);

    // Separate effect for handling navigation based on auth state
    useEffect(() => {
        if (isLoading) {
            return; // Still loading
        }
        if (isAuthenticated === false) {
            return; // WelcomeScreens will be rendered
        }
        if (isAuthenticated && userHasName === false) {
            router.replace('/(app)/onboarding/name-collection');
            return;
        }
        if (isAuthenticated && userHasName) {
            router.replace('/(app)/initialization');
            return;
        }
    }, [isAuthenticated, userHasName, isLoading]);

    // Render logic
    if (isAuthenticated === false && !isLoading) {
        return <WelcomeScreens />;
    }

    // Show loading splash while authenticating or fetching user data
    return <DumbbellSplash isDataLoaded={!isLoading} showLoadingText={false} />;
}
