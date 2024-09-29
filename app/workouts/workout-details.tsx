// app/workouts/workout-detail-page.tsx

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { Icon } from '@/components/base/Icon';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/media/FullScreenVideoPlayer';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getWorkoutAsync } from '@/store/workouts/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { SlideUpActionButton } from '@/components/buttons/SlideUpActionButton';

type WorkoutDetailScreenParams = {
    Workout: {
        workoutId: string;
    };
};

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute<RouteProp<WorkoutDetailScreenParams, 'Workout'>>();

    const scrollY = useSharedValue(0);

    const { workoutId } = route.params;
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
        navigation.setOptions({ headerShown: false });
        if (workoutState !== REQUEST_STATE.FULFILLED) {
            dispatch(getWorkoutAsync({ workoutId }));
        }
    }, [navigation, dispatch, workoutId, workoutState]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
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
        if (videoPlayerRef.current) {
            videoPlayerRef.current.startPlayback();
            // Reset milestones when starting the workout
            setReachedMilestones(new Set());
            setLastPlaybackPosition(0);
        }
    };

    // Function to handle playback status updates from the video player
    const handlePlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            const duration = status.durationMillis;
            const currentPosition = status.positionMillis;
            const progress = currentPosition / duration;

            // Check if video has restarted
            if (currentPosition < lastPlaybackPosition) {
                setReachedMilestones(new Set());
            }

            // Check and log milestones
            MILESTONES.forEach((milestone) => {
                if (progress >= milestone && !reachedMilestones.has(milestone)) {
                    console.log(`Milestone reached: ${milestone * 100}%`);
                    setReachedMilestones((prev) => new Set(prev).add(milestone));
                }
            });

            // Check if a skip occurred
            if (lastPlaybackPosition !== 0 && Math.abs(currentPosition - lastPlaybackPosition) > duration * SKIP_THRESHOLD) {
                console.log(`Skip detected from ${lastPlaybackPosition / 1000}s to ${currentPosition / 1000}s`);
            }

            // Update the last playback position
            setLastPlaybackPosition(currentPosition);

            // Additional session tracking logic can be implemented here
        }
    };

    const handleDismiss = () => {};

    // Scroll Handler for Animated Header
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <ThemedView style={styles.container}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Spaces.XXL} headerInterpolationEnd={Sizes.imageLGHeight} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <TopImageInfoCard
                    image={PhotoUrl}
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
                <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                    {/* Description Container */}
                    <ThemedView style={[styles.descriptionContainer, { backgroundColor: themeColors.background }]}>
                        <ThemedText type='link' style={{ color: themeColors.text, paddingBottom: Spaces.MD }}>
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
                onDismiss={handleDismiss} // Pass the dismiss handler
            />
            <SlideUpActionButton scrollY={scrollY} slideUpThreshold={Spaces.MD}>
                <PrimaryButton text='Start Workout' textType='bodyMedium' style={styles.startButton} onPress={handleStartWorkout} size='LG' />
            </SlideUpActionButton>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'none',
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
