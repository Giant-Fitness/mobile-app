// app/(app)/(tabs)/on-demand.tsx

import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkoutOverviewCard } from '@/components/workouts/WorkoutOverviewCard';
import { Spaces } from '@/constants/Spaces';
import { AppDispatch, RootState } from '@/store/store';
import { getSpotlightWorkoutsAsync, getMultipleWorkoutsAsync } from '@/store/workouts/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { ActionTile } from '@/components/home/ActionTile';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import { router } from 'expo-router';
import { getAllWorkoutsAsync } from '@/store/workouts/thunks';
import PullToRefresh from '@/components/base/PullToRefresh';
import { ScrollView } from 'react-native';

export default function WorkoutsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();

    const { spotlightWorkouts, spotlightWorkoutsState, workouts, workoutStates, error } = useSelector((state: RootState) => state.workouts);

    useEffect(() => {
        if (spotlightWorkoutsState === REQUEST_STATE.IDLE) {
            dispatch(getSpotlightWorkoutsAsync());
        }
    }, [dispatch, spotlightWorkoutsState]);

    useEffect(() => {
        if (spotlightWorkoutsState === REQUEST_STATE.FULFILLED && spotlightWorkouts) {
            const missingWorkoutIds = spotlightWorkouts.WorkoutIds.filter((id) => !workouts[id] || workoutStates[id] !== REQUEST_STATE.FULFILLED);
            if (missingWorkoutIds.length > 0) {
                dispatch(getMultipleWorkoutsAsync({ workoutIds: missingWorkoutIds }));
            }
        }
    }, [dispatch, spotlightWorkoutsState, spotlightWorkouts, workouts, workoutStates]);

    const dataLoadedState = useMemo(() => {
        if (spotlightWorkoutsState !== REQUEST_STATE.FULFILLED) {
            return REQUEST_STATE.PENDING;
        }
        if (!spotlightWorkouts) {
            return REQUEST_STATE.REJECTED;
        }
        const allWorkoutsLoaded = spotlightWorkouts.WorkoutIds.every((id) => workouts[id] && workoutStates[id] === REQUEST_STATE.FULFILLED);

        return allWorkoutsLoaded ? REQUEST_STATE.FULFILLED : REQUEST_STATE.PENDING;
    }, [spotlightWorkoutsState, spotlightWorkouts, workouts, workoutStates]);

    const { showSplash } = useSplashScreen({
        dataLoadedState: dataLoadedState,
    });

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    const navigateToAllWorkouts = (initialFilters = {}) => {
        debounce(
            router,
            {
                pathname: '/(app)/workouts/all-workouts',
                params: { initialFilters: JSON.stringify(initialFilters) },
            },
            1200,
        );
    };

    const renderWorkoutCards = (workoutIds: string[]) => {
        return workoutIds.map((id) => {
            const workout = workouts[id];
            if (!workout) return null;
            return <WorkoutOverviewCard key={id} workout={workout} source={'spotlight'} />;
        });
    };

    if (error) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Error: {error}</ThemedText>
            </ThemedView>
        );
    }

    const screenWidth = Dimensions.get('window').width;
    const padding = Spaces.LG * 2; // Left and right padding
    const gap = Spaces.MD; // Gap between tiles
    const numberOfColumns = 2;
    const tileWidth = (screenWidth - 1.01 * padding - gap) / numberOfColumns;

    const handleRefresh = async () => {
        try {
            await Promise.all([dispatch(getSpotlightWorkoutsAsync({ forceRefresh: true })), dispatch(getAllWorkoutsAsync({ forceRefresh: true }))]);
        } catch (err) {
            console.error('Error refreshing workouts:', err);
        }
    };

    const workoutCategories = [
        {
            title: 'Mobility',
            image: require('@/assets/images/stretching.png'),
            onPress: () => navigateToAllWorkouts({ focus: ['Mobility'] }),
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.6),
            textColor: darkenColor(themeColors.tangerineSolid, 0.3),
        },
        {
            title: 'Strength',
            image: require('@/assets/images/dumbbell.png'),
            onPress: () => navigateToAllWorkouts({ focus: ['Strength'] }),
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.6),
            textColor: darkenColor(themeColors.tangerineSolid, 0.3),
        },
        {
            title: 'Endurance',
            image: require('@/assets/images/stationary-bicycle.png'),
            onPress: () => navigateToAllWorkouts({ focus: ['Endurance'] }),
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.6),
            textColor: darkenColor(themeColors.tangerineSolid, 0.3),
        },
        {
            title: 'All Workouts',
            image: require('@/assets/images/video-folder.png'),
            onPress: () => navigateToAllWorkouts(),
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.6),
            textColor: darkenColor(themeColors.tangerineSolid, 0.3),
        },
    ];

    return (
        <PullToRefresh onRefresh={handleRefresh} style={styles.container} useNativeScrollView={true}>
            <ThemedView>
                <ThemedView style={[styles.infoContainer, { backgroundColor: themeColors.tealTransparent }]}>
                    <ThemedText type='bodySmall' style={[styles.infoText, { color: darkenColor(themeColors.tealSolid, 0.3) }]}>
                        {'Solos are one-off sessions that fit your schedule and mood!'}
                    </ThemedText>
                </ThemedView>

                <ThemedText type='titleLarge' style={[styles.header, { color: themeColors.text }]}>
                    {'Spotlight'}
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spotlightContainer}>
                    {spotlightWorkouts && renderWorkoutCards(spotlightWorkouts.WorkoutIds)}
                </ScrollView>
                <ThemedText type='titleLarge' style={[styles.header, { color: themeColors.text, paddingBottom: Spaces.SM }]}>
                    {'Browse'}
                </ThemedText>

                <View style={styles.categoryGrid}>
                    {workoutCategories.map((category, index) => (
                        <View
                            key={index}
                            style={[
                                styles.categoryTile,
                                index % 2 === 0 ? { marginRight: gap / 2 } : { marginLeft: gap / 2 },
                                index < 2 ? { marginBottom: gap } : {},
                            ]}
                        >
                            <ActionTile
                                image={category.image}
                                title={category.title}
                                onPress={category.onPress}
                                backgroundColor={category.backgroundColor}
                                textColor={category.textColor}
                                style={{ marginRight: 0, borderWidth: StyleSheet.hairlineWidth, borderColor: category.textColor }}
                                width={tileWidth}
                                height={110}
                                imageSize={40}
                                fontSize={14}
                                showChevron={true}
                            />
                        </View>
                    ))}
                </View>
            </ThemedView>
        </PullToRefresh>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    infoContainer: {
        ...Platform.select({
            ios: {
                marginTop: Spaces.LG,
            },
            android: {
                marginTop: Spaces.SM,
            },
        }),
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        borderRadius: Spaces.MD,
        marginHorizontal: Spaces.LG,
    },
    infoText: {
        textAlign: 'center',
    },
    header: {
        paddingTop: Spaces.LG,
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.SM,
    },
    spotlightContainer: {
        marginLeft: Spaces.LG,
        paddingRight: Spaces.XL,
        paddingBottom: Spaces.XL,
        paddingTop: Spaces.MD,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XL,
    },
    categoryTile: {
        marginBottom: Spaces.MD,
    },
});
