// app/index.tsx

import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import WelcomeScreens from '@/components/onboarding/WelcomeScreens';
import { authService } from '@/utils/auth';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import { configureAmplify } from '@/config/amplify';
import { BasicSplash } from '@/components/base/BasicSplash';

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userHasName, setUserHasName] = useState<boolean | null>(null);
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
                    const resultAction = await dispatch(getUserAsync());
                    if (getUserAsync.fulfilled.match(resultAction)) {
                        const userData = resultAction.payload;
                        if (!userData) {
                            setIsAuthenticated(false);
                            return;
                        }
                        setUserHasName(!!userData.FirstName);
                    } else {
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.log(error);
                setIsAuthenticated(false);
            }
        };

        checkAuthAndFetchUserData();
    }, [dispatch]);

    // Separate effect for handling navigation based on auth state
    useEffect(() => {
        if (isAuthenticated === null || userHasName === null) {
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
    }, [isAuthenticated, userHasName]);

    // Render logic
    if (isAuthenticated === false) {
        return <WelcomeScreens />;
    }

    if (isAuthenticated === null || userHasName === null) {
        return <BasicSplash showLoadingText={false} />;
    }

    // Return null as navigation will be handled by the effect
    return <BasicSplash showLoadingText={false} />;
}
