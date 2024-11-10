// app/index.tsx

import { Redirect, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import WelcomeScreens from '@/components/onboarding/WelcomeScreens';
import { authService } from '@/utils/auth';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DebugOverlay } from '@/components/debug/DebugOverlay';
import * as SecureStore from 'expo-secure-store';
import { fetchAuthSession } from 'aws-amplify/auth';
import { configureAmplify } from '@/config/amplify';

export default function Index() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [userHasName, setUserHasName] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<string>('Initial Load');
    const [isInitializing, setIsInitializing] = useState(true);
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [debugInfo, setDebugInfo] = useState<any>({
        amplifyConfigured: false,
        checkCount: 0,
        lastCheck: new Date().toISOString(),
        authChecks: [],
    });

    const { user, userState } = useSelector((state: RootState) => state.user);

    // Initialize Amplify first
    useEffect(() => {
        const initializeAmplify = async () => {
            try {
                setLastAction('Configuring Amplify');
                const configured = configureAmplify();
                setDebugInfo((prev) => ({
                    ...prev,
                    amplifyConfigured: configured,
                }));
            } catch (error) {
                setError(`Amplify Config Error: ${error.message}`);
            }
        };
        initializeAmplify();
    }, []);

    const checkSecureStore = async () => {
        try {
            const userId = await SecureStore.getItemAsync('userId');
            const accessToken = await SecureStore.getItemAsync('accessToken');
            const idToken = await SecureStore.getItemAsync('idToken');
            const userInfo = await SecureStore.getItemAsync('userInfo');

            const newCheck = {
                timestamp: new Date().toISOString(),
                hasUserId: !!userId,
                hasAccessToken: !!accessToken,
                hasIdToken: !!idToken,
                hasUserInfo: !!userInfo,
                userId: userId?.substring(0, 8) + '...',
                userInfo: userInfo ? JSON.parse(userInfo) : null,
            };

            setDebugInfo((prev) => ({
                ...prev,
                checkCount: prev.checkCount + 1,
                lastCheck: new Date().toISOString(),
                authChecks: [...prev.authChecks.slice(-4), newCheck], // Keep last 5 checks
            }));

            return newCheck;
        } catch (e) {
            setDebugInfo((prev) => ({
                ...prev,
                error: e.message,
            }));
            return null;
        }
    };

    useEffect(() => {
        const checkAuthAndFetchUserData = async () => {
            try {
                setLastAction('Checking Session');
                setIsInitializing(true);

                // Check secure store first
                const storeState = await checkSecureStore();

                // Only proceed with auth check if we have stored tokens
                if (storeState?.hasAccessToken && storeState?.hasIdToken) {
                    const { isAuthenticated: sessionAuthenticated } = await authService.checkSession();
                    setLastAction(`Auth Check: ${sessionAuthenticated}`);
                    setIsAuthenticated(sessionAuthenticated);

                    if (sessionAuthenticated) {
                        setLastAction('Fetching User');
                        const resultAction = await dispatch(getUserAsync());

                        if (getUserAsync.fulfilled.match(resultAction)) {
                            const userData = resultAction.payload;
                            if (!userData) {
                                setLastAction('No User - Clearing');
                                await authService.clearAuthData();
                                setIsAuthenticated(false);
                            } else {
                                setLastAction(`Has Name: ${!!userData.FirstName}`);
                                setUserHasName(!!userData.FirstName);
                            }
                        } else {
                            setLastAction('User Fetch Failed');
                            await authService.clearAuthData();
                            setIsAuthenticated(false);
                        }
                    } else {
                        setLastAction('Session Invalid - Clearing');
                        await authService.clearAuthData();
                        setIsAuthenticated(false);
                    }
                } else {
                    setLastAction('No Stored Tokens');
                    setIsAuthenticated(false);
                }
            } catch (error) {
                setLastAction(`Error: ${error.message}`);
                await authService.clearAuthData();
                setError(`Fatal Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                setIsAuthenticated(false);
            } finally {
                setIsInitializing(false);
            }
        };

        checkAuthAndFetchUserData();
    }, [dispatch]);

    // Handle navigation after render
    useEffect(() => {
        if (isInitializing) return;

        const navigate = async () => {
            try {
                if (isAuthenticated && userHasName === false) {
                    setLastAction('Navigating to Name Collection');
                    await router.replace('/onboarding/name-collection');
                } else if (isAuthenticated && userHasName) {
                    setLastAction('Navigating to Initialization');
                    await router.replace('/initialization');
                }
            } catch (e) {
                setLastAction(`Navigation Error: ${e.message}`);
                setError(`Navigation Error: ${e.message}`);
            }
        };

        navigate();
    }, [isAuthenticated, userHasName, isInitializing]);

    const debugItems = [
        { label: 'Action', value: lastAction },
        { label: 'Initializing', value: isInitializing },
        { label: 'Auth', value: isAuthenticated },
        { label: 'Name', value: userHasName },
        { label: 'State', value: userState },
        { label: 'Check History', value: debugInfo.authChecks },
        { label: 'Error', value: error || 'None' },
    ];

    if (isInitializing) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size='large' color={themeColors.accent} />
                <DebugOverlay items={debugItems} />
            </View>
        );
    }

    return (
        <>
            {error ? (
                <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                    <ThemedText style={styles.errorText}>Something went wrong</ThemedText>
                    <ThemedText style={styles.errorDetail}>{error}</ThemedText>
                </View>
            ) : isAuthenticated === false ? (
                <WelcomeScreens />
            ) : null}
            <DebugOverlay items={debugItems} />
        </>
    );
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
