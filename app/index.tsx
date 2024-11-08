// app/index.tsx

import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import WelcomeScreens from '@/components/onboarding/WelcomeScreens';
import { authService } from '@/utils/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userHasName, setUserHasName] = useState<boolean | null>(null);
    const dispatch = useDispatch<AppDispatch>();

    const { user } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const checkAuthAndFetchUserData = async () => {
            try {
                // Check if the user is authenticated by looking at the session
                const { isAuthenticated: sessionAuthenticated } = await authService.checkSession();
                setIsAuthenticated(sessionAuthenticated);

                if (sessionAuthenticated) {
                    // Fetch user data from the backend
                    const resultAction = await dispatch(getUserAsync());
                    if (getUserAsync.fulfilled.match(resultAction)) {
                        const userData = resultAction.payload;
                        // If user data is null, redirect to WelcomeScreens
                        if (!userData) {
                            setIsAuthenticated(false);
                            return;
                        }

                        // Check if the user has a FirstName
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

    // Render the appropriate screen based on the state

    // If not authenticated, show welcome screens
    if (isAuthenticated === false) {
        return <WelcomeScreens />;
    }

    // If still checking, show a loading state
    if (isAuthenticated === null || userHasName === null) {
        return null; // Or a loading indicator
    }

    // If authenticated but user has no FirstName, go to name-collection
    if (isAuthenticated && userHasName === false) {
        return <Redirect href='/onboarding/name-collection' />;
    }

    // If authenticated and user has a FirstName, go to initialization
    if (isAuthenticated && userHasName) {
        return <Redirect href='/initialization' />;
    }

    return null;
}
