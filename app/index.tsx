// app/index.tsx

import { Redirect, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import WelcomeScreens from '@/components/onboarding/WelcomeScreens';
import { authService } from '@/utils/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import { configureAmplify } from '@/config/amplify';

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userHasName, setUserHasName] = useState<boolean | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);

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
            router.replace('/onboarding/name-collection');
            return;
        }
        if (isAuthenticated && userHasName) {
            router.replace('/initialization');
            return;
        }
    }, [isAuthenticated, userHasName]);

    // Render logic
    if (isAuthenticated === false) {
        return <WelcomeScreens />;
    }

    if (isAuthenticated === null || userHasName === null) {
        return null; // Loading state
    }

    // Return null as navigation will be handled by the effect
    return null;
}
