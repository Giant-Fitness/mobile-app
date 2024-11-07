// app/(tabs)/progress.tsx

import { StyleSheet } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { getWeightMeasurementsAsync, logWeightMeasurementAsync } from '@/store/user/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { WeightOverviewChartCard } from '@/components/progress/WeightOverviewChartCard';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { BodyMeasurementsComingSoonCard } from '@/components/progress/BodyMeasurementsComingSoonCard';

export default function ProgressScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const scrollY = useSharedValue(0);

    // Add state for weight logging sheet
    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [isLoggingWeight, setIsLoggingWeight] = useState(false);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const { userWeightMeasurements, userWeightMeasurementsState, error } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (userWeightMeasurementsState === REQUEST_STATE.IDLE) {
            dispatch(getWeightMeasurementsAsync());
        }
    }, [dispatch, userWeightMeasurementsState]);

    const dataLoadedState = useMemo(() => {
        if (userWeightMeasurementsState !== REQUEST_STATE.FULFILLED) {
            return REQUEST_STATE.PENDING;
        }
        return REQUEST_STATE.FULFILLED;
    }, [userWeightMeasurementsState]);

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

    const handleChartPress = () => {
        // Navigate to detailed view only if we have enough data points
        if (userWeightMeasurements?.length >= 2) {
            navigation.navigate('progress/weight-tracking');
        } else {
            setIsWeightSheetVisible(true);
        }
    };

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} />;
    }

    return (
        <>
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <ThemedView style={styles.cardContainer}>
                    <WeightOverviewChartCard
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

                    <BodyMeasurementsComingSoonCard
                        style={{
                            width: '100%',
                            marginBottom: Spaces.LG,
                            marginTop: Spaces.XL,
                            chartContainer: {
                                height: Sizes.imageSM,
                            },
                        }}
                    />
                </ThemedView>
            </Animated.ScrollView>

            <WeightLoggingSheet
                visible={isWeightSheetVisible}
                onClose={() => setIsWeightSheetVisible(false)}
                onSubmit={handleLogWeight}
                isLoading={isLoggingWeight}
            />
        </>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.LG,
    },
});
