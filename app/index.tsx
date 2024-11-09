// app/index.tsx

import { Redirect, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WelcomeScreens from '@/components/onboarding/WelcomeScreens';
import { authService } from '@/utils/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userHasName, setUserHasName] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { user } = useSelector((state: RootState) => state.user);

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
                setError(`Fatal Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setIsAuthenticated(false);
            }
        };

        checkAuthAndFetchUserData();
    }, [dispatch]);

    // Separate effect for handling navigation based on auth state
    useEffect(() => {
        if (isAuthenticated === null || userHasName === null) {
            return;
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

    // Only show error state if something went wrong
    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ThemedText style={styles.errorText}>Something went wrong</ThemedText>
                <ThemedText style={styles.errorDetail}>{error}</ThemedText>
            </View>
        );
    }

    // Show welcome screens if not authenticated
    if (isAuthenticated === false) {
        return <WelcomeScreens />;
    }

    // Return null during normal loading/transition states
    return null;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#FF3B30', // iOS-style error red
    },
    errorDetail: {
        fontSize: 14,
        marginBottom: 5,
        textAlign: 'center',
    },
});
