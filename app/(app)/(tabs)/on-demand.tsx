// app/(app)/(tabs)/on-demand.tsx

import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActionTile } from '@/components/home/ActionTile';
import { WorkoutOverviewCard } from '@/components/workouts/WorkoutOverviewCard';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { AppDispatch, RootState } from '@/store/store';
import { getAllWorkoutsAsync, getMultipleWorkoutsAsync, getSpotlightWorkoutsAsync } from '@/store/workouts/thunks';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import { useDispatch, useSelector } from 'react-redux';

export default function WorkoutsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const [refreshing, setRefreshing] = useState(false);

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

    // Memoize navigation function to prevent recreations
    const navigateToAllWorkouts = useCallback((initialFilters = {}) => {
        debounce(
            router,
            {
                pathname: '/(app)/workouts/all-workouts',
                params: { initialFilters: JSON.stringify(initialFilters) },
            },
            1200,
        );
    }, []);

    // Memoize workout cards to prevent unnecessary re-renders
    const workoutCards = useMemo(() => {
        if (!spotlightWorkouts) return [];
        return spotlightWorkouts.WorkoutIds.map((id) => {
            const workout = workouts[id];
            if (!workout) return null;
            return <WorkoutOverviewCard key={id} workout={workout} source={'spotlight'} />;
        }).filter(Boolean);
    }, [spotlightWorkouts, workouts]);

    // Memoize category data to prevent recreations
    const workoutCategories = useMemo(
        () => [
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
        ],
        [themeColors, navigateToAllWorkouts],
    );

    // Memoize screen calculations
    const screenCalculations = useMemo(() => {
        const screenWidth = Dimensions.get('window').width;
        const padding = Spaces.LG * 2;
        const gap = Spaces.MD;
        const numberOfColumns = 2;
        const tileWidth = (screenWidth - 1.01 * padding - gap) / numberOfColumns;
        return { screenWidth, padding, gap, numberOfColumns, tileWidth };
    }, []);

    const handleRefresh = useCallback(async () => {
        if (refreshing) return;

        setRefreshing(true);
        trigger('virtualKeyRelease');

        try {
            await Promise.all([dispatch(getSpotlightWorkoutsAsync({ forceRefresh: true })), dispatch(getAllWorkoutsAsync({ forceRefresh: true }))]);
        } catch (err) {
            console.error('Error refreshing workouts:', err);
        } finally {
            setTimeout(() => {
                setRefreshing(false);
            }, 200);
        }
    }, [dispatch, refreshing]);

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    if (error) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Error: {error}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[themeColors.iconSelected]}
                    tintColor={themeColors.iconSelected}
                    progressBackgroundColor={themeColors.background}
                />
            }
            style={[styles.container, { backgroundColor: themeColors.background }]}
            contentContainerStyle={styles.contentContainer}
        >
            <ThemedView style={styles.innerContainer}>
                <ThemedView style={[styles.infoContainer, { backgroundColor: themeColors.tealTransparent }]}>
                    <ThemedText type='bodySmall' style={[styles.infoText, { color: darkenColor(themeColors.tealSolid, 0.3) }]}>
                        {'Solos are one-off sessions that fit your schedule and mood!'}
                    </ThemedText>
                </ThemedView>

                <ThemedText type='titleLarge' style={[styles.header, { color: themeColors.text }]}>
                    {'Spotlight'}
                </ThemedText>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.spotlightContainer}>
                    {workoutCards}
                </ScrollView>

                <ThemedText type='titleLarge' style={[styles.header, { color: themeColors.text, paddingBottom: Spaces.SM }]}>
                    {'Browse'}
                </ThemedText>

                <View style={styles.categoryGrid}>
                    {workoutCategories.map((category, index) => (
                        <View
                            key={category.title}
                            style={[
                                styles.categoryTile,
                                index % 2 === 0 ? { marginRight: screenCalculations.gap / 2 } : { marginLeft: screenCalculations.gap / 2 },
                                index < 2 ? { marginBottom: screenCalculations.gap } : {},
                            ]}
                        >
                            <ActionTile
                                image={category.image}
                                title={category.title}
                                onPress={category.onPress}
                                backgroundColor={category.backgroundColor}
                                textColor={category.textColor}
                                style={{ ...styles.actionTileStyle, borderColor: category.textColor }}
                                width={screenCalculations.tileWidth}
                                height={110}
                                imageSize={40}
                                fontSize={14}
                                showChevron={true}
                            />
                        </View>
                    ))}
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    innerContainer: {
        paddingBottom: Spaces.SM,
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
        flexDirection: 'row',
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
    actionTileStyle: {
        marginRight: 0,
        borderWidth: StyleSheet.hairlineWidth,
    },
});
