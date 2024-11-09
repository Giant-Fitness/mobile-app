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
    const [debugState, setDebugState] = useState<string>('Starting app...');
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { user } = useSelector((state: RootState) => state.user);

    // Effect for initial auth check and user data fetch
    useEffect(() => {
        const checkAuthAndFetchUserData = async () => {
            try {
                setDebugState('Checking authentication session...');
                const { isAuthenticated: sessionAuthenticated } = await authService.checkSession();
                setIsAuthenticated(sessionAuthenticated);

                if (sessionAuthenticated) {
                    setDebugState('Session authenticated, fetching user data...');
                    const resultAction = await dispatch(getUserAsync());
                    if (getUserAsync.fulfilled.match(resultAction)) {
                        const userData = resultAction.payload;
                        if (!userData) {
                            setDebugState('No user data found, treating as unauthenticated');
                            setIsAuthenticated(false);
                            return;
                        }
                        setDebugState('User data fetched, checking for name...');
                        setUserHasName(!!userData.FirstName);
                    } else {
                        setDebugState('Failed to fetch user data, treating as unauthenticated');
                        setIsAuthenticated(false);
                    }
                } else {
                    setDebugState('Session not authenticated');
                }
            } catch (error) {
                setDebugState(`Auth check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setIsAuthenticated(false);
            }
        };

        checkAuthAndFetchUserData();
    }, [dispatch]);

    // Separate effect for handling navigation based on auth state
    useEffect(() => {
        if (isAuthenticated === null || userHasName === null) {
            setDebugState('Loading - waiting for auth and user name check...');
            return;
        }

        if (isAuthenticated === false) {
            setDebugState('Not authenticated - showing welcome screens');
            return;
        }

        if (isAuthenticated && userHasName === false) {
            setDebugState('Authenticated but no name - redirecting to name collection');
            router.replace('/onboarding/name-collection');
            return;
        }

        if (isAuthenticated && userHasName) {
            setDebugState('Fully authenticated with name - redirecting to initialization');
            router.replace('/initialization');
            return;
        }
    }, [isAuthenticated, userHasName]);

    // Loading state with debug info
    if (isAuthenticated === null || userHasName === null) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ThemedText style={styles.debugText}>Loading State</ThemedText>
                <ThemedText style={styles.debugDetail}>{debugState}</ThemedText>
                <ThemedText style={styles.debugDetail}>Auth: {String(isAuthenticated)}</ThemedText>
                <ThemedText style={styles.debugDetail}>HasName: {String(userHasName)}</ThemedText>
            </View>
        );
    }

    // Not authenticated - show welcome screens
    if (isAuthenticated === false) {
        return <WelcomeScreens />;
    }

    // Show debug info instead of blank screen during transitions
    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ThemedText style={styles.debugText}>Navigation State</ThemedText>
            <ThemedText style={styles.debugDetail}>{debugState}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    debugText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    debugDetail: {
        fontSize: 14,
        marginBottom: 5,
        textAlign: 'center',
    },
});
