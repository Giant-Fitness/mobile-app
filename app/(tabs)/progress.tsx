// app/(tabs)/progress.tsx

import { StyleSheet } from 'react-native';
import React, { useEffect, useMemo } from 'react';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { getWeightMeasurementsAsync } from '@/store/user/thunks';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { WeightOverviewChartCard } from '@/components/progress/WeightOverviewChartCard';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';

export default function ProgressScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const scrollY = useSharedValue(0);

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

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} />;
    }

    return (
        <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
            <ThemedView style={styles.cardContainer}>
                <WeightOverviewChartCard
                    values={userWeightMeasurements}
                    isLoading={userWeightMeasurementsState === REQUEST_STATE.PENDING}
                    onPress={() => navigation.navigate('progress/weight-tracking')}
                    style={{
                        width: '100%',
                        marginTop: Spaces.LG,
                        chartContainer: {
                            height: Sizes.imageSM,
                        },
                    }}
                />
            </ThemedView>
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.LG,
    },
});
