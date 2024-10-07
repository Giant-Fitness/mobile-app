// app/(tabs)/on-demand.tsx

import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkoutOverviewCard } from '@/components/workouts/WorkoutOverviewCard';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getSpotlightWorkoutsAsync, getMultipleWorkoutsAsync } from '@/store/workouts/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { useSplashScreen } from '@/hooks/useSplashScreen';

type RootStackParamList = {
    'workouts/all-workouts': { initialFilters: object };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WorkoutsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation<NavigationProp>();
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

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoadedState,
    });

    if (showSplash) {
        return <DumbbellSplash />;
    }

    const navigateToAllWorkouts = (initialFilters = {}) => {
        navigation.navigate('workouts/all-workouts', { initialFilters });
    };

    const renderWorkoutCards = (workoutIds: string[]) => {
        return workoutIds.map((id) => {
            const workout = workouts[id];
            if (!workout) return null;
            return <WorkoutOverviewCard key={id} workout={workout} />;
        });
    };

    if (error) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText>Error: {error}</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
            <ThemedView>
                <ThemedView style={[styles.infoContainer, { backgroundColor: themeColors.tipBackground }]}>
                    <ThemedText type='bodySmall' style={[styles.infoText, { color: themeColors.tipText }]}>
                        {'Jump into these one-off sessions that fit your schedule and mood!'}
                    </ThemedText>
                </ThemedView>
                <ThemedText type='title' style={[styles.header, { color: themeColors.text }]}>
                    {'Spotlight'}
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainScrollView}>
                    {spotlightWorkouts && renderWorkoutCards(spotlightWorkouts.WorkoutIds)}
                </ScrollView>
                <ThemedView style={styles.menuContainer}>
                    <ThemedText type='title' style={[styles.header, { color: themeColors.text, paddingBottom: Spaces.MD }]}>
                        {'Browse'}
                    </ThemedText>
                    <ThemedView>
                        <TouchableOpacity onPress={() => navigateToAllWorkouts({ focus: ['Mobility'] })} style={styles.menuItem} activeOpacity={1}>
                            <ThemedText type='overline' style={[{ color: themeColors.text }]}>
                                {'Mobility Workouts'}
                            </ThemedText>
                            <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                    </ThemedView>
                    <View
                        style={[
                            styles.divider,
                            {
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            },
                        ]}
                    />
                    <ThemedView>
                        <TouchableOpacity onPress={() => navigateToAllWorkouts({ focus: ['Strength'] })} style={styles.menuItem} activeOpacity={1}>
                            <ThemedText type='overline' style={[{ color: themeColors.text }]}>
                                {'Strength Workouts'}
                            </ThemedText>
                            <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                    </ThemedView>
                    <View
                        style={[
                            styles.divider,
                            {
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            },
                        ]}
                    />
                    <ThemedView>
                        <TouchableOpacity onPress={() => navigateToAllWorkouts({ focus: ['Endurance'] })} style={styles.menuItem} activeOpacity={1}>
                            <ThemedText type='overline' style={[{ color: themeColors.text }]}>
                                {'Endurance Workouts'}
                            </ThemedText>
                            <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                    </ThemedView>
                    <View
                        style={[
                            styles.divider,
                            {
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            },
                        ]}
                    />
                    <ThemedView>
                        <TouchableOpacity onPress={() => navigateToAllWorkouts()} style={styles.menuItem} activeOpacity={1}>
                            <ThemedText type='overline' style={[{ color: themeColors.text }]}>
                                {'All Workouts'}
                            </ThemedText>
                            <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        marginTop: Spaces.LG,
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        borderRadius: Spaces.MD,
        marginHorizontal: Spaces.XXL,
    },
    infoText: {
        textAlign: 'center',
    },
    container: {
        flex: 1,
    },
    menuContainer: {
        paddingBottom: Spaces.XL,
    },
    menuItem: {
        paddingHorizontal: Spaces.LG,
        paddingVertical: Spaces.LG,
        flexDirection: 'row',
        justifyContent: 'space-between', // This will push the icon to the right
        alignItems: 'center', // This will vertically center the text and icon
    },
    mainScrollView: {
        marginLeft: Spaces.LG,
        paddingRight: Spaces.XL,
        paddingBottom: Spaces.XXL,
        paddingTop: Spaces.MD,
    },
    header: {
        paddingTop: Spaces.LG,
        paddingLeft: Spaces.LG,
    },
    divider: {
        width: '90%',
        alignSelf: 'center',
    },
    seeAllButton: {
        width: Sizes.imageXXLWidth,
        height: Sizes.imageXXLHeight,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Spaces.SM,
        marginHorizontal: Spaces.XXS,
    },
});
