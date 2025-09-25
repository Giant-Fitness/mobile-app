// app/(app)/initialization.tsx

import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { ThemedText } from '@/components/base/ThemedText';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { incrementRetryAttempt, reset as resetInitialization, resetRetryAttempt, setInitialized } from '@/store/initialization/initializationSlice';
import { AppDispatch, RootState } from '@/store/store';
import { cacheService } from '@/utils/cache';
import { InitializationService } from '@/utils/initializationService';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { useDispatch, useSelector } from 'react-redux';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Redux state
    const initialization = useSelector((state: RootState) => state.initialization);

    // Local state
    const [showManualRetry, setShowManualRetry] = useState(false);
    const initServiceRef = useRef<InitializationService | null>(null);
    const retryTimeoutRef = useRef<number | null>(null);
    const initializationStartTimeRef = useRef<number | null>(null);
    const hasInitializedRef = useRef(false);

    // Initialize service
    useEffect(() => {
        const { store } = require('@/store/store');
        initServiceRef.current = new InitializationService(dispatch);
        // IMPORTANT: Set the state getter so the service can access Redux state
        initServiceRef.current.setStateGetter(() => store.getState());
    }, [dispatch]);

    // Main initialization flow - Enhanced with better parallelization
    const initializeApp = useCallback(async () => {
        if (!initServiceRef.current || hasInitializedRef.current) return;

        try {
            hasInitializedRef.current = true; // Prevent multiple simultaneous calls
            const startTime = Date.now();
            initializationStartTimeRef.current = startTime;

            console.log('🚀 Starting enhanced initialization...');

            dispatch(resetRetryAttempt());
            setShowManualRetry(false);

            // Step 1: Check cache status to determine strategy
            console.log('📊 Checking cache status...');
            await initServiceRef.current.checkCacheStatus();

            // Step 2: Initialize using optimal strategy (first-run vs cache-aware)
            console.log('🔄 Starting main initialization...');
            const success = await initServiceRef.current.initializeApp();

            if (!success) {
                throw new Error('Initialization failed');
            }

            // Step 3: Navigate to app
            const endTime = Date.now();
            const totalTime = endTime - startTime;
            console.log(`✅ Initialization completed in ${totalTime}ms`);

            dispatch(setInitialized(true));
            router.replace('/(app)/(tabs)/home');

            // Step 4: Continue background processes after navigation
            setTimeout(() => {
                console.log('🔄 Starting background sync...');
                initServiceRef.current?.startBackgroundSync();
            }, 500); // Reduced delay since most data is already loaded
        } catch (error) {
            hasInitializedRef.current = false; // Allow retry on error
            const endTime = Date.now();
            const totalTime = initializationStartTimeRef.current ? endTime - initializationStartTimeRef.current : 0;
            console.error(`❌ Initialization failed after ${totalTime}ms:`, error);
            await handleInitializationError();
        }
    }, [dispatch]); // Remove all other dependencies to prevent recreation

    // Enhanced error handling with cache fallback
    const handleInitializationError = useCallback(async () => {
        const currentAttempt = initialization.retryAttempt;

        // Check if we have enough cached data to proceed
        const canProceedWithCache = await checkMinimumCachedData();

        if (canProceedWithCache && currentAttempt > 0) {
            // On retry attempts, be more lenient with cached data
            console.log('🔄 Proceeding with cached data after retry, continuing background sync...');
            dispatch(setInitialized(true));
            router.replace('/(app)/(tabs)/home');

            // Retry failed requests in background
            setTimeout(() => {
                if (currentAttempt < 3) {
                    console.log('🔄 Retrying failed requests in background...');
                    initServiceRef.current?.startBackgroundSync();
                }
            }, 2000);
            return;
        }

        // No sufficient cached data - need to retry
        if (currentAttempt < 3) {
            // Exponential backoff with jitter
            const baseDelay = 2000 * Math.pow(2, currentAttempt);
            const jitter = Math.random() * 1000; // Add randomness to prevent thundering herd
            const retryDelay = Math.min(baseDelay + jitter, 15000);

            console.log(`🔄 Auto-retrying in ${Math.round(retryDelay)}ms (attempt ${currentAttempt + 1}/3)`);

            dispatch(incrementRetryAttempt());

            retryTimeoutRef.current = setTimeout(() => {
                hasInitializedRef.current = false; // Allow retry
                initializeApp();
            }, retryDelay);
        } else {
            // Max retries reached - show manual retry option
            console.log('❌ Max retries reached, showing manual retry option');
            setShowManualRetry(true);
        }
    }, [initialization.retryAttempt, dispatch, initializeApp]);

    // Check for minimum required cached data to run the app
    const checkMinimumCachedData = async (): Promise<boolean> => {
        try {
            const hasUser = await cacheService.get('user_data');
            const hasPrograms = await cacheService.get('all_programs');
            const hasWorkouts = await cacheService.get('all_workouts');
            const hasExercises = await cacheService.get('all_exercises');

            const minimumDataAvailable = !!(hasUser && hasPrograms && hasWorkouts && hasExercises);

            console.log(`📊 Minimum cache check: ${minimumDataAvailable ? 'PASS' : 'FAIL'}`);
            console.log({
                hasUser: !!hasUser,
                hasPrograms: !!hasPrograms,
                hasWorkouts: !!hasWorkouts,
                hasExercises: !!hasExercises,
            });

            return minimumDataAvailable;
        } catch (error) {
            console.warn('Error checking minimum cached data:', error);
            return false;
        }
    };

    // Manual retry handler with cache clearing option
    const handleManualRetry = useCallback(async () => {
        setShowManualRetry(false);
        dispatch(resetInitialization());
        hasInitializedRef.current = false; // Allow retry

        // On manual retry, consider clearing stale cache if this is the second manual retry
        if (initialization.retryAttempt >= 2) {
            console.log('🧹 Clearing potentially stale cache before retry...');
            try {
                // Clear cache for items that might be causing issues
                const problemCacheKeys = ['user_program_progress', 'user_recommendations', 'tracked_lifts_history'];

                await Promise.all(problemCacheKeys.map((key) => cacheService.remove(key)));
            } catch (error) {
                console.warn('Failed to clear cache:', error);
            }
        }

        initializeApp();
    }, [dispatch, initializeApp, initialization.retryAttempt]);

    // Start initialization on mount
    useEffect(() => {
        // Only initialize once
        if (!hasInitializedRef.current) {
            initializeApp();
        }

        // Cleanup timeout on unmount
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []); // Empty dependency array - only run once on mount

    useEffect(() => {
        console.log('🔍 Starting app initialization...');
        if (!hasInitializedRef.current) {
            initializeApp();
        }

        return () => {
            console.log('🧹 Cleaning up initialization...');
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
            }
        };
    }, []);
    // Enhanced error screen with more options
    if (showManualRetry) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText type='titleXLarge' style={styles.errorTitle}>
                        Connection Issue
                    </ThemedText>

                    <ThemedText style={styles.errorMessage}>
                        {initialization.retryAttempt === 0
                            ? 'Please check your internet connection and try again.'
                            : "We're having trouble loading your data. This might be due to a poor connection or server issues."}
                    </ThemedText>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            size='MD'
                            text={initialization.retryAttempt >= 2 ? 'Clear Cache & Retry' : 'Try Again'}
                            onPress={handleManualRetry}
                            style={styles.retryButton}
                        />
                    </View>

                    {/* Show progress information */}
                    {initialization.loadedItems.length > 0 && (
                        <View style={styles.progressContainer}>
                            <ThemedText type='caption' style={styles.progressText}>
                                Loaded {initialization.loadedItems.length} items successfully
                            </ThemedText>
                            {initialization.failedItems.length > 0 && (
                                <ThemedText type='caption' style={styles.errorText}>
                                    Failed to load: {initialization.failedItems.length} items
                                </ThemedText>
                            )}
                        </View>
                    )}

                    {/* Enhanced debug info for development */}
                    {__DEV__ && (
                        <View style={styles.devErrorDetails}>
                            <ThemedText type='caption' style={styles.devErrorTitle}>
                                Debug Info:
                            </ThemedText>

                            <ThemedText type='caption' style={styles.devErrorText}>
                                Phase: {initialization.currentPhase}
                            </ThemedText>

                            <ThemedText type='caption' style={styles.devErrorText}>
                                Retry Attempt: {initialization.retryAttempt}
                            </ThemedText>

                            {initialization.criticalError && (
                                <ThemedText type='caption' style={styles.devErrorText}>
                                    Error: {initialization.criticalError}
                                </ThemedText>
                            )}

                            {initialization.loadedItems.length > 0 && (
                                <ThemedText type='caption' style={styles.devErrorText}>
                                    Loaded: {initialization.loadedItems.join(', ')}
                                </ThemedText>
                            )}

                            {initialization.failedItems.length > 0 && (
                                <ThemedText type='caption' style={styles.devErrorText}>
                                    Failed: {initialization.failedItems.join(', ')}
                                </ThemedText>
                            )}

                            <ThemedText type='caption' style={styles.devErrorText}>
                                Cache Status: {JSON.stringify(Object.keys(initialization.cacheStatus), null, 2)}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    return <DumbbellSplash isDataLoaded={initialization.isInitialized} showLoadingText={true} loadingText={'Loading...'} />;
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
        lineHeight: 22,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: Spaces.LG,
    },
    retryButton: {
        width: '70%',
        alignSelf: 'center',
    },
    progressContainer: {
        marginBottom: Spaces.MD,
        alignItems: 'center',
    },
    progressText: {
        color: 'green',
        marginBottom: Spaces.XS,
    },
    errorText: {
        color: 'red',
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
        fontFamily: 'monospace',
    },
});

export default Initialization;
