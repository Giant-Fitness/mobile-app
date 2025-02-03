// app/(app)/(tabs)/progress.tsx

import { ScrollView, StyleSheet } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import { getWeightMeasurementsAsync, logWeightMeasurementAsync, getSleepMeasurementsAsync, logSleepMeasurementAsync } from '@/store/user/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { router } from 'expo-router';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { WeightTrendCard } from '@/components/progress/WeightTrendCard';
import { SleepTrendCard } from '@/components/progress/SleepTrendCard';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { BodyMeasurementsComingSoonCard } from '@/components/progress/BodyMeasurementsComingSoonCard';
import { StrengthHistoryComingSoonCard } from '@/components/progress/StrengthHistoryComingSoonCard';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';

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

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const { userWeightMeasurements, userWeightMeasurementsState } = useSelector((state: RootState) => state.user);
    const { userSleepMeasurements, userSleepMeasurementsState } = useSelector((state: RootState) => state.user);

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

    const dataLoadedState = useMemo(() => {
        if (userWeightMeasurementsState !== REQUEST_STATE.FULFILLED) {
            return REQUEST_STATE.PENDING;
        }
        return REQUEST_STATE.FULFILLED;
    }, [userWeightMeasurementsState]);

    const sleepDataLoadedState = useMemo(() => {
        if (userSleepMeasurementsState != REQUEST_STATE.FULFILLED) {
            return REQUEST_STATE.PENDING;
        }
        return REQUEST_STATE.FULFILLED;
    }, [userSleepMeasurementsState]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoadedState,
        // sleepDataLoadedState:sleepDataLoadedState,
    });

    // look into what this does and if their is a need to replicate it

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

    const handleChartPress = () => {
        // Navigate to detailed view only if we have enough data points
        if (userWeightMeasurements?.length >= 2) {
            router.push('/(app)/progress/weight-tracking');
        } else {
            setIsWeightSheetVisible(true);
        }
    };

    const handleSleepChartPress = () => {
        if (userSleepMeasurements?.length >= 2) {
            router.push('/(app)/progress/sleep-tracking');
        } else {
            setIsLoggingSleep(true);
        }
    };

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} onAnimationComplete={handleSplashComplete} />;
    }

    return (
        <>
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <ThemedView style={styles.container}>
                    <ThemedView style={styles.cardContainer}>
                        <WeightTrendCard
                            values={userWeightMeasurements}
                            isLoading={userWeightMeasurementsState === REQUEST_STATE.PENDING}
                            onPress={handleChartPress}
                            onLogWeight={() => setIsWeightSheetVisible(true)}
                            style={{
                                width: '100%',
                                marginTop: Spaces.LG,
                                chartContainer: {
                                    height: Sizes.imageSM,
                                },
                            }}
                        />
                    </ThemedView>

                    <ThemedView style={styles.cardContainer}>
                        <SleepTrendCard
                            values={userSleepMeasurements}
                            isLoading={userSleepMeasurementsState === REQUEST_STATE.PENDING}
                            onPress={handleSleepChartPress}
                            onLogSleep={() => setIsSleepSheetVisible(true)}
                            style={{
                                width: '100%',
                                marginTop: Spaces.LG,
                                chartContainer: {
                                    height: Sizes.imageSM,
                                },
                            }}
                        />
                    </ThemedView>

                    <ThemedView style={styles.sectionTitleContainer}>
                        <ThemedView style={[styles.sectionBadge]}>
                            <ThemedText type='titleLarge' style={styles.sectionTitle}>
                                Coming Soon! ✨
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.horizontalScrollContent}
                        style={styles.scrollViewContainer}
                    >
                        <BodyMeasurementsComingSoonCard style={styles.comingSoonCard} />
                        <StrengthHistoryComingSoonCard style={styles.comingSoonCard} />
                    </ScrollView>
                </ThemedView>
            </Animated.ScrollView>

            <WeightLoggingSheet
                visible={isWeightSheetVisible}
                onClose={() => setIsWeightSheetVisible(false)}
                onSubmit={handleLogWeight}
                isLoading={isLoggingWeight}
            />

            <SleepLoggingSheet
                visible={isSleepSheetVisible}
                onClose={() => setIsSleepSheetVisible(false)}
                onSubmit={handleLogSleep}
                isLoading={isLoggingSleep}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: Spaces.XXXL,
    },
    cardContainer: {
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.LG,
    },
    sectionTitleContainer: {
        paddingHorizontal: Spaces.LG,
        marginTop: Spaces.XXL,
        marginBottom: Spaces.SM,
    },
    sectionBadge: {
        alignSelf: 'flex-start',
    },
    sectionTitle: {
        marginTop: 0,
        marginBottom: 0,
    },
    scrollViewContainer: {
        marginTop: Spaces.SM,
    },
    horizontalScrollContent: {
        marginLeft: Spaces.LG,
        paddingRight: Spaces.XL,
    },
    comingSoonCard: {
        width: 270, // Slightly wider cards
        marginRight: Spaces.MD,
        transform: [{ scale: 1.01 }], // Subtle scale effect
    },
});
