// app/(app)/(tabs)/progress.tsx

import { StyleSheet, Dimensions, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import {
    getWeightMeasurementsAsync,
    logWeightMeasurementAsync,
    getSleepMeasurementsAsync,
    logSleepMeasurementAsync,
    deleteSleepMeasurementAsync,
    deleteWeightMeasurementAsync,
    getBodyMeasurementsAsync,
    logBodyMeasurementAsync,
    deleteBodyMeasurementAsync,
} from '@/store/user/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { router } from 'expo-router';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { WeightTrendCard } from '@/components/progress/WeightTrendCard';
import { SleepTrendCard } from '@/components/progress/SleepTrendCard';
import { BodyMeasurementsTrendCard } from '@/components/progress/BodyMeasurementsTrendCard';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { Spaces } from '@/constants/Spaces';
import { StrengthHistoryComingSoonCard } from '@/components/progress/StrengthHistoryComingSoonCard';
import { ThemedText } from '@/components/base/ThemedText';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { debounce } from '@/utils/debounce';

// Calculate card widths based on screen width (2 cards per row with gap)
const { width } = Dimensions.get('window');
const CARD_GAP = Spaces.SM + Spaces.XXS;
const HORIZONTAL_PADDING = Spaces.LG * 2; // Left and right padding
const CARD_WIDTH = (width - HORIZONTAL_PADDING - CARD_GAP) / 2;

export default function ProgressScreen() {
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

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const { userWeightMeasurements, userWeightMeasurementsState } = useSelector((state: RootState) => state.user);
    const { userSleepMeasurements, userSleepMeasurementsState } = useSelector((state: RootState) => state.user);
    const { userBodyMeasurements, userBodyMeasurementsState } = useSelector((state: RootState) => state.user);

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

    const dataLoadedState = useMemo(() => {
        if (
            userWeightMeasurementsState !== REQUEST_STATE.FULFILLED ||
            userSleepMeasurementsState !== REQUEST_STATE.FULFILLED ||
            userBodyMeasurementsState !== REQUEST_STATE.FULFILLED
        ) {
            return REQUEST_STATE.PENDING;
        }
        return REQUEST_STATE.FULFILLED;
    }, [userWeightMeasurementsState, userSleepMeasurementsState, userBodyMeasurementsState]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoadedState,
    });

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

    const handleLogSleep = async (sleep: number, date: Date) => {
        setIsLoggingSleep(true);

        try {
            await dispatch(
                logSleepMeasurementAsync({
                    durationInMinutes: sleep,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();
        } catch (error) {
            console.error('Failed to log sleep :', error);
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
        return userBodyMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} onAnimationComplete={handleSplashComplete} />;
    }

    return (
        <>
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <ThemedView style={styles.container}>
                    <ThemedView style={{ marginTop: Spaces.LG }}>
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
});
