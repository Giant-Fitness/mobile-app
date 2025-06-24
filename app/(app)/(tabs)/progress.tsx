// app/(app)/(tabs)/progress.tsx

import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { BodyMeasurementsTrendCard } from '@/components/progress/BodyMeasurementsTrendCard';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';
import { SleepTrendCard } from '@/components/progress/SleepTrendCard';
import { StrengthHistoryComingSoonCard } from '@/components/progress/StrengthHistoryComingSoonCard';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { WeightTrendCard } from '@/components/progress/WeightTrendCard';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { AppDispatch, RootState } from '@/store/store';
import {
    deleteBodyMeasurementAsync,
    deleteSleepMeasurementAsync,
    deleteWeightMeasurementAsync,
    getBodyMeasurementsAsync,
    getSleepMeasurementsAsync,
    getWeightMeasurementsAsync,
    logBodyMeasurementAsync,
    logSleepMeasurementAsync,
    logWeightMeasurementAsync,
} from '@/store/user/thunks';
import { debounce } from '@/utils/debounce';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, SafeAreaView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

// Calculate card widths based on screen width (2 cards per row with gap)
const { width } = Dimensions.get('window');
const CARD_GAP = Spaces.SM + Spaces.XXS;
const HORIZONTAL_PADDING = Spaces.LG * 2; // Left and right padding
const CARD_WIDTH = (width - HORIZONTAL_PADDING - CARD_GAP) / 2;

export default function ProgressScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const scrollY = useSharedValue(0);

    // Add state for weight logging sheet
    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [isLoggingWeight, setIsLoggingWeight] = useState(false);

    const [isSleepSheetVisible, setIsSleepSheetVisible] = useState(false);
    const [isLoggingSleep, setIsLoggingSleep] = useState(false);

    // Add state for body measurements sheet
    const [isBodyMeasurementsSheetVisible, setIsBodyMeasurementsSheetVisible] = useState(false);
    const [isLoggingBodyMeasurements, setIsLoggingBodyMeasurements] = useState(false);

    // Add retry state
    const [retryAttempt, setRetryAttempt] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const { userWeightMeasurements, userWeightMeasurementsState } = useSelector((state: RootState) => state.user);
    const { userSleepMeasurements, userSleepMeasurementsState } = useSelector((state: RootState) => state.user);
    const { userBodyMeasurements, userBodyMeasurementsState } = useSelector((state: RootState) => state.user);

    // Load all data
    const loadAllData = async () => {
        const promises = [dispatch(getWeightMeasurementsAsync()), dispatch(getSleepMeasurementsAsync()), dispatch(getBodyMeasurementsAsync())];

        await Promise.allSettled(promises);
    };

    useEffect(() => {
        if (userWeightMeasurementsState === REQUEST_STATE.IDLE) {
            dispatch(getWeightMeasurementsAsync());
        }
    }, [dispatch, userWeightMeasurementsState]);

    useEffect(() => {
        if (userSleepMeasurementsState === REQUEST_STATE.IDLE) {
            dispatch(getSleepMeasurementsAsync());
        }
    }, [dispatch, userSleepMeasurementsState]);

    useEffect(() => {
        if (userBodyMeasurementsState === REQUEST_STATE.IDLE) {
            dispatch(getBodyMeasurementsAsync());
        }
    }, [dispatch, userBodyMeasurementsState]);

    // Updated data loaded state to handle REJECTED states
    const dataLoadedState = useMemo(() => {
        const allStates = [userWeightMeasurementsState, userSleepMeasurementsState, userBodyMeasurementsState];
        // Check if any are still loading
        if (allStates.some((state) => state === REQUEST_STATE.PENDING)) {
            return REQUEST_STATE.PENDING;
        }

        // Check if all failed
        if (allStates.every((state) => state === REQUEST_STATE.REJECTED)) {
            return REQUEST_STATE.REJECTED;
        }

        // Check if at least one succeeded (partial success is acceptable)
        if (allStates.some((state) => state === REQUEST_STATE.FULFILLED)) {
            return REQUEST_STATE.FULFILLED;
        }

        return REQUEST_STATE.PENDING;
    }, [userWeightMeasurementsState, userSleepMeasurementsState, userBodyMeasurementsState]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoadedState,
    });

    // Handle retry with exponential backoff
    const handleRetry = async () => {
        setIsRetrying(true);
        setRetryAttempt((prev) => prev + 1);

        try {
            await loadAllData();
        } catch (error) {
            console.error('Retry failed:', error);
        } finally {
            setIsRetrying(false);
        }
    };

    // Handle weight logging
    const handleLogWeight = async (weight: number, date: Date) => {
        setIsLoggingWeight(true);
        try {
            await dispatch(
                logWeightMeasurementAsync({
                    weight: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            // Refresh measurements after logging
            await dispatch(getWeightMeasurementsAsync()).unwrap();
            setIsWeightSheetVisible(false);
        } catch (error) {
            console.error('Failed to log weight:', error);
        } finally {
            setIsLoggingWeight(false);
        }
    };

    const handleLogSleep = async (sleepData: any, date: Date) => {
        setIsLoggingSleep(true);
        try {
            await dispatch(
                logSleepMeasurementAsync({
                    ...sleepData, // This will contain either {durationInMinutes} or {sleepTime, wakeTime}
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            await dispatch(getSleepMeasurementsAsync()).unwrap();
        } catch (error) {
            console.error('Failed to log sleep:', error);
        } finally {
            setIsLoggingSleep(false);
        }
    };

    // Handle body measurement logging
    const handleLogBodyMeasurements = async (measurements: Record<string, number>, date: Date) => {
        setIsLoggingBodyMeasurements(true);
        try {
            await dispatch(
                logBodyMeasurementAsync({
                    measurements,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            // Refresh measurements after logging
            await dispatch(getBodyMeasurementsAsync()).unwrap();
            setIsBodyMeasurementsSheetVisible(false);
        } catch (error) {
            console.error('Failed to log body measurements:', error);
        } finally {
            setIsLoggingBodyMeasurements(false);
        }
    };

    const handleChartPress = () => {
        // Navigate to detailed view only if we have enough data points
        if (userWeightMeasurements?.length >= 2) {
            debounce(router, '/(app)/progress/weight-tracking');
        } else {
            setIsWeightSheetVisible(true);
        }
    };

    const handleSleepChartPress = () => {
        if (userSleepMeasurements?.length >= 2) {
            debounce(router, '/(app)/progress/sleep-tracking');
        } else {
            setIsSleepSheetVisible(true);
        }
    };

    const handleBodyMeasurementsChartPress = () => {
        if (userBodyMeasurements?.length >= 2) {
            debounce(router, '/(app)/progress/body-measurements-tracking');
        } else {
            setIsBodyMeasurementsSheetVisible(true);
        }
    };

    const handleWeightDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteWeightMeasurementAsync({ timestamp })).unwrap();
            setIsWeightSheetVisible(false);
        } catch (error) {
            console.error('Failed to delete weight:', error);
        }
    };

    const handleSleepDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteSleepMeasurementAsync({ timestamp })).unwrap();
            setIsSleepSheetVisible(false);
        } catch (err) {
            console.error('Failed to delete sleep:', err);
        }
    };

    const handleBodyMeasurementsDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteBodyMeasurementAsync({ timestamp })).unwrap();
            setIsBodyMeasurementsSheetVisible(false);
        } catch (error) {
            console.error('Failed to delete body measurements:', error);
        }
    };

    const getExistingBodyMeasurementsData = (date: Date) => {
        return userBodyMeasurements?.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    // Show error screen if all data loading failed
    if (dataLoadedState === REQUEST_STATE.REJECTED && !showSplash) {
        return (
            <SafeAreaView style={[styles.errorContainer, { backgroundColor: themeColors.background }]}>
                <View style={styles.errorContent}>
                    <ThemedText type='titleXLarge' style={styles.errorTitle}>
                        Connection Issue
                    </ThemedText>

                    <ThemedText style={styles.errorMessage}>Unable to load your progress data. Please check your internet connection.</ThemedText>

                    <View style={styles.buttonContainer}>
                        <PrimaryButton
                            size='MD'
                            text={isRetrying ? 'Retrying...' : 'Try Again'}
                            onPress={handleRetry}
                            style={styles.retryButton}
                            disabled={isRetrying}
                        />
                    </View>

                    {__DEV__ && retryAttempt > 0 && (
                        <View style={styles.devErrorDetails}>
                            <ThemedText type='caption' style={styles.devErrorTitle}>
                                Debug Info:
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                Retry attempts: {retryAttempt}
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                Weight: {userWeightMeasurementsState}
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                Sleep: {userSleepMeasurementsState}
                            </ThemedText>
                            <ThemedText type='caption' style={styles.devErrorText}>
                                Body: {userBodyMeasurementsState}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} onAnimationComplete={handleSplashComplete} />;
    }

    return (
        <>
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                style={[{ backgroundColor: themeColors.background }]}
            >
                <ThemedView style={styles.container}>
                    <ThemedView
                        style={{
                            ...Platform.select({
                                ios: {
                                    marginTop: Spaces.LG,
                                },
                                android: {
                                    marginTop: Spaces.SM,
                                },
                            }),
                        }}
                    >
                        <ThemedView style={[styles.sectionBadge]}>
                            <ThemedText type='titleLarge' style={styles.sectionTitle}>
                                Health Tracking
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <View style={[styles.gridRow, { marginTop: Spaces.MD }]}>
                        <WeightTrendCard
                            values={userWeightMeasurements}
                            isLoading={userWeightMeasurementsState === REQUEST_STATE.PENDING}
                            onPress={handleChartPress}
                            onLogWeight={() => setIsWeightSheetVisible(true)}
                            style={{
                                width: CARD_WIDTH,
                                height: CARD_WIDTH,
                            }}
                        />
                        <BodyMeasurementsTrendCard
                            values={userBodyMeasurements}
                            isLoading={userBodyMeasurementsState === REQUEST_STATE.PENDING}
                            onPress={handleBodyMeasurementsChartPress}
                            onLogBodyMeasurements={() => setIsBodyMeasurementsSheetVisible(true)}
                            style={{
                                width: CARD_WIDTH,
                                height: CARD_WIDTH,
                            }}
                        />
                    </View>
                    <View style={[styles.gridRow, { marginTop: Spaces.SM + Spaces.XXS }]}>
                        <SleepTrendCard
                            values={userSleepMeasurements}
                            isLoading={userSleepMeasurementsState === REQUEST_STATE.PENDING}
                            onPress={handleSleepChartPress}
                            onLogSleep={() => setIsSleepSheetVisible(true)}
                            style={{
                                width: CARD_WIDTH,
                                height: CARD_WIDTH,
                            }}
                        />
                    </View>
                    <ThemedView style={styles.sectionTitleContainer}>
                        <ThemedView style={[styles.sectionBadge]}>
                            <ThemedText type='titleLarge' style={styles.sectionTitle}>
                                Coming Soon! ✨
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <View style={styles.comingSoonContainer}>
                        <StrengthHistoryComingSoonCard style={styles.comingSoonCard} />
                    </View>
                </ThemedView>
            </Animated.ScrollView>

            <WeightLoggingSheet
                visible={isWeightSheetVisible}
                onClose={() => setIsWeightSheetVisible(false)}
                onSubmit={handleLogWeight}
                onDelete={handleWeightDelete}
                isLoading={isLoggingWeight}
            />

            <SleepLoggingSheet
                visible={isSleepSheetVisible}
                onClose={() => setIsSleepSheetVisible(false)}
                onSubmit={handleLogSleep}
                onDelete={handleSleepDelete}
                isLoading={isLoggingSleep}
            />
            <BodyMeasurementsLoggingSheet
                visible={isBodyMeasurementsSheetVisible}
                onClose={() => setIsBodyMeasurementsSheetVisible(false)}
                onSubmit={handleLogBodyMeasurements}
                onDelete={handleBodyMeasurementsDelete}
                isLoading={isLoggingBodyMeasurements}
                getExistingData={getExistingBodyMeasurementsData}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: Spaces.XXXL,
        paddingHorizontal: Spaces.LG,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    sectionTitleContainer: {
        marginTop: Spaces.XL,
    },
    sectionBadge: {
        alignSelf: 'flex-start',
    },
    sectionTitle: {
        marginTop: 0,
        marginBottom: 0,
    },
    comingSoonContainer: {
        marginTop: Spaces.MD,
    },
    comingSoonCard: {
        width: 270,
        marginRight: Spaces.MD,
        transform: [{ scale: 1.01 }],
    },
    // Error handling styles
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContent: {
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
