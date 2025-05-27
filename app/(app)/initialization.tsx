// app/(app)/initialization.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
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
import { getAllProgramDaysAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { getWeightMeasurementsAsync, getBodyMeasurementsAsync, getSleepMeasurementsAsync } from '@/store/user/thunks';
import { initializeTrackedLiftsHistoryAsync } from '@/store/exerciseProgress/thunks';

const Initialization: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Redux state
    const initialization = useSelector((state: RootState) => state.initialization);
    const { userProgramProgress, userProgramProgressState } = useSelector((state: RootState) => state.user);

    // Local state
    const [isRetrying, setIsRetrying] = useState(false);
    const initServiceRef = useRef<InitializationService | null>(null);

    // Initialize service
    useEffect(() => {
        initServiceRef.current = new InitializationService(dispatch);
    }, [dispatch]);

    // Main initialization flow
    const initializeApp = useCallback(async () => {
        if (!initServiceRef.current) return;

        try {
            setIsRetrying(false);
            dispatch(resetRetryAttempt());

            // Step 1: Check cache status
            await initServiceRef.current.checkCacheStatus();

            // Step 2: Load critical data (with cache-first strategy)
            const criticalSuccess = await initServiceRef.current.loadCriticalData();
            if (!criticalSuccess) return; // Stop if critical data fails

            // Step 3: Load secondary data (with cache-first strategy)
            const secondarySuccess = await initServiceRef.current.loadSecondaryData();
            if (!secondarySuccess) return; // Stop if required secondary data fails

            // Step 4: Load real-time data that can't be cached
            await loadRealTimeData();

            // Step 5: Mark as initialized and navigate
            dispatch(setInitialized(true));
            router.replace('/(app)/(tabs)/home');

            // Step 6: Start background sync (non-blocking)
            setTimeout(() => {
                initServiceRef.current?.startBackgroundSync();
            }, 1000);
        } catch (error) {
            console.error('Initialization failed:', error);
        }
    }, [dispatch]);

    // Load data that must always be fresh (can't be cached)
    const loadRealTimeData = async () => {
        try {
            // These are critical and must be current
            await dispatch(getUserProgramProgressAsync());

            // These are important for UX but not blocking
            const nonBlockingPromises = [
                dispatch(getWorkoutQuoteAsync()),
                dispatch(getRestDayQuoteAsync()),
                dispatch(getWeightMeasurementsAsync()),
                dispatch(getBodyMeasurementsAsync()),
                dispatch(getSleepMeasurementsAsync()),
                dispatch(initializeTrackedLiftsHistoryAsync()),
            ];

            // Don't wait for these to complete
            Promise.allSettled(nonBlockingPromises).then((results) => {
                results.forEach((result) => {
                    if (result.status === 'rejected') {
                        console.warn(`Non-blocking data load failed:`, result.reason);
                    }
                });
            });
        } catch (error) {
            console.error('Real-time data loading failed:', error);
            throw error;
        }
    };

    // Load program days when user program progress is available
    useEffect(() => {
        if (userProgramProgressState === REQUEST_STATE.FULFILLED && userProgramProgress?.ProgramId) {
            dispatch(getAllProgramDaysAsync({ programId: userProgramProgress.ProgramId }));
        }
    }, [userProgramProgress, dispatch, userProgramProgressState]);

    // Start initialization on mount
    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    // Retry handler
    const handleRetry = useCallback(() => {
        setIsRetrying(true);
        dispatch(incrementRetryAttempt());
        dispatch(resetInitialization());
        initializeApp();
    }, [dispatch, initializeApp]);

    const getLoadingMessage = () => {
        return 'Loading...';
    };

    // Show error state
    if (initialization.criticalError && initialization.retryAttempt < 3) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText type='titleXLarge' style={styles.errorTitle}>
                        Connection Error
                    </ThemedText>

                    <ThemedText style={styles.errorMessage}>
                        We couldn&apos;t connect to our servers. Please check your internet connection and try again.
                    </ThemedText>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            size='MD'
                            text={`Retry (${initialization.retryAttempt}/3)`}
                            onPress={handleRetry}
                            loading={isRetrying}
                            style={styles.retryButton}
                        />
                    </View>

                    {__DEV__ && (
                        <View style={styles.devErrorDetails}>
                            <ThemedText type='caption' style={styles.devErrorTitle}>
                                Error Details (Dev Only):
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                {initialization.criticalError}
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                Failed items: {initialization.failedItems.join(', ')}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    // Show permanent failure state after 3 retries
    if (initialization.criticalError && initialization.retryAttempt >= 3) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText type='titleXLarge' style={styles.errorTitle}>
                        Unable to Connect
                    </ThemedText>

                    <ThemedText style={styles.errorMessage}>
                        We&apos;re having trouble connecting to our servers. Please try again later or contact support if the problem persists.
                    </ThemedText>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton size='MD' text='Try Again' onPress={handleRetry} loading={isRetrying} style={styles.retryButton} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Show loading state with DumbbellSplash and basic loading text
    return <DumbbellSplash isDataLoaded={initialization.isInitialized} showLoadingText={true} loadingText={getLoadingMessage()} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        width: '80%',
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
    },
    devErrorTitle: {
        fontWeight: 'bold',
        marginBottom: Spaces.SM,
    },
    devErrorText: {
        marginBottom: Spaces.XS,
    },
});

export default Initialization;
