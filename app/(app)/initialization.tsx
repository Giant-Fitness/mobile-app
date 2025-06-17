// app/(app)/initialization.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { router } from 'expo-router';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { ThemedText } from '@/components/base/ThemedText';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { InitializationService } from '@/utils/initializationService';
import { setInitialized, incrementRetryAttempt, resetRetryAttempt, reset as resetInitialization } from '@/store/initialization/initializationSlice';
import { getUserProgramProgressAsync } from '@/store/user/thunks';
import { cacheService } from '@/utils/cache';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Redux state
    const initialization = useSelector((state: RootState) => state.initialization);

    // Local state
    const [showManualRetry, setShowManualRetry] = useState(false);
    const initServiceRef = useRef<InitializationService | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize service
    useEffect(() => {
        initServiceRef.current = new InitializationService(dispatch);
    }, [dispatch]);

    // Main initialization flow - Cache-First Strategy
    const initializeApp = useCallback(async () => {
        if (!initServiceRef.current) return;

        try {
            dispatch(resetRetryAttempt());
            setShowManualRetry(false);

            // Step 1: Check cache status
            await initServiceRef.current.checkCacheStatus();

            // Step 2: Load critical data (cache-first)
            await initServiceRef.current.loadCriticalData();

            // Step 3: Load secondary data (cache-first) - this now includes program days
            await initServiceRef.current.loadSecondaryData();

            // Step 4: Load essential real-time data
            await loadEssentialRealTimeData();

            // Step 5: Navigate to app
            dispatch(setInitialized(true));
            router.replace('/(app)/(tabs)/home');

            // Step 6: Start background processes
            setTimeout(() => {
                initServiceRef.current?.startBackgroundSync();
                loadBackgroundRealTimeData();
            }, 1000);
        } catch (error) {
            console.error('Initialization error:', error);
            await handleInitializationError();
        }
    }, [dispatch]);

    // Handle initialization errors with automatic retries
    const handleInitializationError = async () => {
        const currentAttempt = initialization.retryAttempt;

        // Check if we have cached data to fall back on
        const hasCachedData = await checkForCachedData();

        if (hasCachedData) {
            // Proceed with cached data, but still retry in background
            console.log('Proceeding with cached data, retrying in background...');
            dispatch(setInitialized(true));
            router.replace('/(app)/(tabs)/home');

            // Retry in background
            setTimeout(() => {
                if (currentAttempt < 3) {
                    dispatch(incrementRetryAttempt());
                    initializeApp();
                }
            }, 5000);
            return;
        }

        // No cached data - need to retry
        if (currentAttempt < 3) {
            // Automatic retry with exponential backoff
            const retryDelay = Math.min(2000 * Math.pow(2, currentAttempt), 10000);
            console.log(`Auto-retrying in ${retryDelay}ms (attempt ${currentAttempt + 1}/3)`);

            dispatch(incrementRetryAttempt());

            retryTimeoutRef.current = setTimeout(() => {
                initializeApp();
            }, retryDelay);
        } else {
            // Max retries reached - show manual retry option
            setShowManualRetry(true);
        }
    };

    // Load only essential real-time data
    const loadEssentialRealTimeData = async () => {
        try {
            // Only load the most critical data that must be fresh
            await dispatch(getUserProgramProgressAsync());
        } catch (error) {
            console.warn('Essential real-time data failed:', error);
            // Don't throw - continue with cached data
        }
    };

    // Load remaining data in background
    const loadBackgroundRealTimeData = async () => {
        try {
            // Background data loading can happen after navigation
            const backgroundPromises: Promise<unknown>[] = [
                // Add any other background data loading here
            ];

            Promise.allSettled(backgroundPromises).then((results) => {
                const failures = results.filter((r) => r.status === 'rejected').length;
                if (failures > 0) {
                    console.warn(`${failures} background data requests failed`);
                }
            });
        } catch (error) {
            console.warn('Background data loading failed:', error);
        }
    };

    // Check for any cached data
    const checkForCachedData = async (): Promise<boolean> => {
        try {
            const hasUser = await cacheService.get('user_data');
            const hasPrograms = await cacheService.get('all_programs');

            return !!(hasUser && hasPrograms);
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    // Manual retry handler (only shown as last resort)
    const handleManualRetry = useCallback(() => {
        setShowManualRetry(false);
        dispatch(resetInitialization());
        initializeApp();
    }, [dispatch, initializeApp]);

    // Start initialization on mount
    useEffect(() => {
        initializeApp();

        // Cleanup timeout on unmount
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, [initializeApp]);

    // Only show manual retry after all automatic attempts failed
    if (showManualRetry) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText type='titleXLarge' style={styles.errorTitle}>
                        Connection Issue
                    </ThemedText>

                    <ThemedText style={styles.errorMessage}>Please check your internet connection.</ThemedText>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton size='MD' text='Try Again' onPress={handleManualRetry} style={styles.retryButton} />
                    </View>

                    {__DEV__ && initialization.criticalError && (
                        <View style={styles.devErrorDetails}>
                            <ThemedText type='caption' style={styles.devErrorTitle}>
                                Debug Info:
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                {initialization.criticalError}
                            </ThemedText>
                            {initialization.failedItems.length > 0 && (
                                <ThemedText type='caption' style={styles.devErrorText}>
                                    Failed: {initialization.failedItems.join(', ')}
                                </ThemedText>
                            )}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // Simple loading state
    return <DumbbellSplash isDataLoaded={initialization.isInitialized} showLoadingText={true} loadingText='Loading...' />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        width: '85%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorTitle: {
        marginBottom: Spaces.MD,
        textAlign: 'center',
    },
    errorMessage: {
        textAlign: 'center',
        marginBottom: Spaces.LG,
        opacity: 0.8,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: Spaces.LG,
    },
    retryButton: {
        width: '70%',
        alignSelf: 'center',
    },
    devErrorDetails: {
        marginTop: Spaces.LG,
        padding: Spaces.MD,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 8,
        width: '100%',
    },
    devErrorTitle: {
        fontWeight: 'bold',
        marginBottom: Spaces.SM,
    },
    devErrorText: {
        marginBottom: Spaces.XS,
        fontSize: 12,
    },
});

export default Initialization;
