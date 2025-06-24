// app/(app)/workouts/workout-details.tsx

import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SlideUpActionButton } from '@/components/buttons/SlideUpActionButton';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle, VideoPlaybackStatus } from '@/components/media/FullScreenVideoPlayer';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { AppDispatch, RootState } from '@/store/store';
import { getWorkoutAsync } from '@/store/workouts/thunks';
import { verticalScale } from '@/utils/scaling';
import React, { useEffect, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

import { useLocalSearchParams } from 'expo-router';

import { usePostHog } from 'posthog-react-native';
import { trigger } from 'react-native-haptic-feedback';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [refreshing, setRefreshing] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [videoDuration, setVideoDuration] = useState<number | null>(null);
    const posthog = usePostHog();

    const dispatch = useDispatch<AppDispatch>();
    const { workoutId } = useLocalSearchParams() as { workoutId: string };

    const scrollY = useSharedValue(0);

    const workout = useSelector((state: RootState) => state.workouts.workouts[workoutId]);
    const workoutState = useSelector((state: RootState) => state.workouts.workoutStates[workoutId]);
    const videoPlayerRef = useRef<FullScreenVideoPlayerHandle>(null);

    // Constants for milestone tracking and skip logic
    const MILESTONES = [0.25, 0.5, 0.75, 1.0]; // Milestones as percentages
    const SKIP_THRESHOLD = 0.25; // Max allowed skip percentage

    // State for tracking playback position
    const [lastPlaybackPosition, setLastPlaybackPosition] = useState(0);
    const [reachedMilestones, setReachedMilestones] = useState(new Set());

    useEffect(() => {
        // Only fetch if workout isn't already loaded
        if (workoutState !== REQUEST_STATE.FULFILLED) {
            dispatch(getWorkoutAsync({ workoutId }));
        }
    }, [dispatch, workoutId, workoutState]);

    const { showSplash } = useSplashScreen({
        dataLoadedState: workoutState,
    });

    if (showSplash) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    const { WorkoutName, Time, Level, EquipmentCategory, PhotoUrl, DescriptionLong, VideoUrl, TargetedMuscles } = workout;

    const targetMuscles = TargetedMuscles.join(', ');
    const levelIcon = 'level-' + Level.toLowerCase();

    // Function to start the video playback
    const handleStartWorkout = () => {
        setIsVideoLoading(true);
        if (videoPlayerRef.current) {
            videoPlayerRef.current.startPlayback();
            // Reset milestones when starting the workout
            setReachedMilestones(new Set());
            setLastPlaybackPosition(0);

            // Track workout start event
            posthog.capture('workout_started', {
                workout_id: workoutId,
                workout_name: workout.WorkoutName,
                screen: 'workout-details',
            });
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            trigger('virtualKeyRelease');
            await dispatch(getWorkoutAsync({ workoutId, forceRefresh: true })).unwrap();
            setTimeout(() => {
                setRefreshing(false);
            }, 200);
        } catch (err) {
            console.log('Refresh error:', err);
        }
    };

    // Function to handle playback status updates from the video player
    const handlePlaybackStatusUpdate = (status: VideoPlaybackStatus) => {
        if (status.isLoaded) {
            if (!status.isBuffering) {
                setIsVideoLoading(false);
            }
            const duration = status.durationMillis;
            const currentPosition = status.positionMillis;

            // Store duration when we receive it
            if (duration && !videoDuration) {
                setVideoDuration(duration);
            }

            if (duration) {
                const progress = currentPosition / duration;

                // Check if video has restarted
                if (currentPosition < lastPlaybackPosition) {
                    setReachedMilestones(new Set());

                    // Track workout restart
                    posthog.capture('workout_restarted', {
                        workout_id: workoutId,
                        workout_name: workout.WorkoutName,
                        screen: 'workout-details',
                    });
                }

                // Check and log milestones
                MILESTONES.forEach((milestone) => {
                    if (progress >= milestone && !reachedMilestones.has(milestone)) {
                        console.log(`Milestone reached: ${milestone * 100}%`);
                        setReachedMilestones((prev) => new Set(prev).add(milestone));

                        // Track milestone reached
                        posthog.capture('workout_milestone_reached', {
                            workout_id: workoutId,
                            workout_name: workout.WorkoutName,
                            milestone_percentage: milestone * 100,
                            screen: 'workout-details',
                        });
                    }
                });

                // Check if a skip occurred
                if (lastPlaybackPosition !== 0 && Math.abs(currentPosition - lastPlaybackPosition) > duration * SKIP_THRESHOLD) {
                    console.log(`Skip detected from ${lastPlaybackPosition / 1000}s to ${currentPosition / 1000}s`);
                }

                // Track workout completion
                if (progress >= 1.0 && !reachedMilestones.has(1.0)) {
                    posthog.capture('workout_completed', {
                        workout_id: workoutId,
                        workout_name: workout.WorkoutName,
                        screen: 'workout-details',
                    });
                }
                // Update the last playback position
                setLastPlaybackPosition(currentPosition);
            }

            // Handle video completion
            if (status.didJustFinish) {
                posthog.capture('workout_completed', {
                    workout_id: workoutId,
                    workout_name: workout.WorkoutName,
                    screen: 'workout-details',
                });
            }

            // Additional session tracking logic can be implemented here
        }
    };

    const handleDismiss = () => {
        setIsVideoLoading(false);

        // Track early dismissal
        if (lastPlaybackPosition > 0 && videoDuration) {
            posthog.capture('workout_dismissed', {
                workout_id: workoutId,
                workout_name: workout.WorkoutName,
                completion_percentage: (lastPlaybackPosition / videoDuration) * 100,
                screen: 'workout-details',
            });
        }
    };

    // Scroll Handler for Animated Header
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Spaces.XXL} headerInterpolationEnd={Sizes.imageLGHeight} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[themeColors.iconSelected]}
                        tintColor={themeColors.iconSelected}
                    />
                }
            >
                <TopImageInfoCard
                    image={{ uri: PhotoUrl }}
                    title={WorkoutName}
                    titleType='titleLarge'
                    titleStyle={{ marginBottom: Spaces.XS }}
                    containerStyle={{ elevation: 5, marginBottom: 0 }}
                    contentContainerStyle={{
                        backgroundColor: themeColors.background,
                        paddingHorizontal: Spaces.LG,
                    }}
                    imageStyle={{ height: Sizes.image3XLHeight }}
                    titleFirst={true}
                    extraContent={
                        <ThemedView>
                            {/* Attributes in a Row */}
                            <ThemedView style={[styles.attributeRow]}>
                                {/* Attribute 1: Length */}
                                <View style={styles.attributeItem}>
                                    <Icon name='stopwatch' color={themeColors.text} />
                                    <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                        {Time} mins
                                    </ThemedText>
                                </View>

                                {/* Attribute 2: Level */}
                                <View style={styles.attributeItem}>
                                    <Icon name={levelIcon} size={verticalScale(12)} color={themeColors.text} />
                                    <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                        {Level}
                                    </ThemedText>
                                </View>

                                {/* Attribute 3: Equipment */}
                                <View style={styles.attributeItem}>
                                    <Icon name='kettlebell' color={themeColors.text} />
                                    <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                        {EquipmentCategory}
                                    </ThemedText>
                                </View>

                                {/* Attribute 4: Focus */}
                                <View style={styles.attributeItem}>
                                    <Icon name='yoga' color={themeColors.text} />
                                    <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                        {targetMuscles}
                                    </ThemedText>
                                </View>
                            </ThemedView>
                        </ThemedView>
                    }
                />
                <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                    {/* Description Container */}
                    <ThemedView style={[styles.descriptionContainer, { backgroundColor: themeColors.background }]}>
                        <ThemedText type='button' style={{ color: themeColors.text, paddingBottom: Spaces.MD }}>
                            What to Expect
                        </ThemedText>
                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                            {DescriptionLong}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </Animated.ScrollView>
            <FullScreenVideoPlayer
                ref={videoPlayerRef}
                source={{ uri: VideoUrl }}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onDismiss={handleDismiss}
            />
            <SlideUpActionButton scrollY={scrollY} slideUpThreshold={0}>
                <PrimaryButton
                    text='Start Workout'
                    textType='bodyMedium'
                    style={styles.startButton}
                    onPress={() => {
                        handleStartWorkout();
                    }}
                    haptic='impactHeavy'
                    size='LG'
                    loading={isVideoLoading}
                    disabled={isVideoLoading}
                />
            </SlideUpActionButton>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'none',
    },
    pullToRefreshContainer: {
        flex: 1,
    },
    mainContainer: {
        marginTop: Spaces.LG,
        paddingBottom: Sizes.bottomSpaceLarge,
    },
    topCard: {
        marginBottom: Spaces.XL,
        paddingBottom: Spaces.LG,
    },
    titleContainer: {
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.SM,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow wrapping if needed
        alignItems: 'center',
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spaces.XL, // Space between attribute groups
        marginBottom: Spaces.SM, // Space below if wrapped
    },
    attributeText: {
        marginLeft: Spaces.XS,
        lineHeight: Spaces.LG,
    },
    descriptionContainer: {
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.XL,
    },
    buttonContainer: {
        flexDirection: 'column', // Column for single button
        alignItems: 'center', // Center horizontally
        position: 'absolute',
        bottom: Spaces.XL,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: '10%',
    },
    startButton: {
        width: '100%',
    },
});
