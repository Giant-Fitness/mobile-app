// app/(app)/programs/program-day.tsx

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, Vibration } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { Icon } from '@/components/base/Icon';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { TextButton } from '@/components/buttons/TextButton';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { SlideUpActionButton } from '@/components/buttons/SlideUpActionButton';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useProgramData } from '@/hooks/useProgramData';
import { ProgramDaySkipModal } from '@/components/programs/ProgramDaySkipModal';
import { ProgramDayUnfinishModal } from '@/components/programs/ProgramDayUnfinishModal';
import { BottomMenuModal } from '@/components/overlays/BottomMenuModal';
import { AutoDismissSuccessModal } from '@/components/overlays/AutoDismissSuccessModal';
import { ExerciseLoggingSheet } from '@/components/exercise/ExerciseLoggingSheet';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/media/FullScreenVideoPlayer';
import { getDayOfWeek, getWeekNumber } from '@/utils/calendar';
import { fetchExercisesRecentHistoryAsync } from '@/store/exerciseProgress/thunks';
import { AppDispatch, RootState } from '@/store/store';
import { Exercise, isExerciseLoggable } from '@/types';
import { isLongTermTrackedLift } from '@/store/exerciseProgress/utils';
import { AVPlaybackStatus } from 'expo-av';
import { ThumbnailVideoPlayer } from '@/components/media/ThumbnailVideoPlayer';
import { usePostHog } from 'posthog-react-native';

const ProgramDayScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const posthog = usePostHog();

    const [isProgramDaySkipModalVisible, setIsProgramDaySkipModalVisible] = useState(false);
    const [isResetDayModalVisible, setIsResetDayModalVisible] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isBottomMenuVisible, setIsBottomMenuVisible] = useState(false);
    const [showResetSuccess, setShowResetSuccess] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [isLoggingSheetVisible, setIsLoggingSheetVisible] = useState(false);

    const confettiRef = useRef<LottieView>(null);
    const videoPlayerRef = useRef<FullScreenVideoPlayerHandle>(null);
    const scrollY = useSharedValue(0);
    const contentHeight = useSharedValue(0);
    const scrollViewHeight = useSharedValue(0);

    const { programId, dayId } = useLocalSearchParams<{ programId: string; dayId: string }>();
    const { workouts } = useSelector((state: RootState) => state.workouts);

    const {
        userProgramProgress,
        activeProgram,
        programDay,
        programDayState,
        isEnrolled,
        isDayCompleted,
        handleCompleteDay,
        handleUncompleteDay,
        isCompletingDay,
        isUncompletingDay,
    } = useProgramData(programId, dayId);

    // Video playback tracking
    const [lastPlaybackPosition, setLastPlaybackPosition] = useState(0);
    const [reachedMilestones, setReachedMilestones] = useState(new Set());
    const MILESTONES = [0.25, 0.5, 0.75, 1.0];

    // Load exercise histories for workout type days
    useEffect(() => {
        if (programDay?.Type === 'workout' && programDay.Exercises) {
            const exerciseIds = programDay.Exercises.filter((exercise) => !isLongTermTrackedLift(exercise.ExerciseId) && isExerciseLoggable(exercise)).map(
                (exercise) => exercise.ExerciseId,
            );

            if (exerciseIds.length > 0) {
                dispatch(fetchExercisesRecentHistoryAsync({ exerciseIds }));
            }
        }
    }, [programDay?.Type, programDay?.Exercises]);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            if (!status.isBuffering) {
            }

            const duration = status.durationMillis;
            const currentPosition = status.positionMillis;

            if (duration) {
                const progress = currentPosition / duration;

                // Check if video has restarted
                if (currentPosition < lastPlaybackPosition) {
                    setReachedMilestones(new Set());
                }

                // Track milestones
                MILESTONES.forEach((milestone) => {
                    if (progress >= milestone && !reachedMilestones.has(milestone)) {
                        console.log(`Milestone reached: ${milestone * 100}%`);
                        setReachedMilestones((prev) => new Set(prev).add(milestone));
                    }
                });

                setLastPlaybackPosition(currentPosition);
            }
        }
    };

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleContentSizeChange = (contentWidth: number, contentHeightValue: number) => {
        contentHeight.value = contentHeightValue;
    };

    const handleScrollViewLayout = (event: any) => {
        scrollViewHeight.value = event.nativeEvent.layout.height;
    };

    const navigateToAllWorkouts = (initialFilters = {}) => {
        router.push({
            pathname: '/(app)/workouts/all-workouts',
            params: { initialFilters: JSON.stringify(initialFilters), source: 'program-rest-day' },
        });
    };

    const finishDayChecker = async () => {
        if (userProgramProgress && userProgramProgress.CurrentDay < parseInt(dayId)) {
            setIsProgramDaySkipModalVisible(true);
        } else {
            completeDay();
        }
    };

    const completeDay = async () => {
        posthog.capture('program_day_completed');
        if (activeProgram && activeProgram.Days.toString() === dayId.toString()) {
            await handleCompleteDay();
            router.replace({
                pathname: '/(app)/programs/program-complete',
                params: { programId },
            });
        } else {
            await handleCompleteDay();
            setShowConfetti(true);
            confettiRef.current?.play();
            Vibration.vibrate(200);
            setTimeout(() => {
                setShowConfetti(false);
                router.push('/(app)/(tabs)/home');
            }, 2200);
        }
    };

    const handleProgramDaySkip = async () => {
        setIsProgramDaySkipModalVisible(false);
        posthog.capture('program_day_skipped');
        completeDay();
    };

    const resetDay = () => {
        handleUncompleteDay();
        posthog.capture('program_day_reset');
        setIsResetDayModalVisible(false);
        setShowResetSuccess(true);
    };

    const handleResetModalDismiss = () => {
        setShowResetSuccess(false);
        router.push('/(app)/(tabs)/home');
    };

    const handleMenuPress = () => {
        setIsBottomMenuVisible(true);
    };

    const menuOptions = [
        {
            label: 'View Progress',
            icon: 'auto-graph',
            onPress: () => {
                router.push('/(app)/programs/active-program-progress');
            },
        },
        {
            label: 'View Plan Details',
            icon: 'preview',
            onPress: () => {
                router.push({
                    pathname: '/(app)/programs/program-overview',
                    params: { programId },
                });
            },
        },
    ];

    const handleExerciseLogPress = (exercise: Exercise) => {
        setSelectedExercise(exercise);
        setIsLoggingSheetVisible(true);
    };

    const handleLoggingSheetClose = () => {
        setIsLoggingSheetVisible(false);
        setSelectedExercise(null);
    };

    const renderVideoDay = () => {
        const workout = programDay?.WorkoutId ? workouts[programDay.WorkoutId] : null;
        if (!workout || !programDay) return null;

        return (
            <>
                <ThumbnailVideoPlayer videoUrl={workout.VideoUrl} thumbnailUrl={workout.PhotoUrl} onPlaybackStatusUpdate={handlePlaybackStatusUpdate} />
                <ThemedView style={[styles.topCard, { backgroundColor: themeColors.background }]}>
                    <ThemedView>
                        <ThemedText type='titleLarge'>{programDay.DayTitle}</ThemedText>
                        <ThemedText type='link' style={{ color: themeColors.subText, marginTop: 0, marginBottom: Spaces.SM }}>
                            {`Week ${getWeekNumber(parseInt(dayId))} Day ${getDayOfWeek(parseInt(dayId))}`}
                        </ThemedText>
                    </ThemedView>
                    <View style={styles.attributeItem}>
                        <Icon name='stopwatch' color={themeColors.text} />
                        <ThemedText type='body' style={[styles.attributeText]}>
                            {workout.Time} mins
                        </ThemedText>
                    </View>
                    <View style={styles.attributeItem}>
                        <Icon name='kettlebell' color={themeColors.text} />
                        <ThemedText type='body' style={[styles.attributeText]}>
                            {programDay.Equipment.join(', ')}
                        </ThemedText>
                    </View>
                    <ThemedView style={styles.attributeRow}>
                        <ThemedView style={styles.attribute}>
                            <Icon name='yoga' color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText]}>
                                {workout.TargetedMuscles.join(', ')}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
                <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                    <ThemedView style={[styles.descriptionContainer, { backgroundColor: themeColors.background }, isEnrolled && { paddingBottom: Spaces.XXL }]}>
                        <ThemedText type='button' style={{ color: themeColors.text, paddingBottom: Spaces.MD }}>
                            What to Expect
                        </ThemedText>
                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                            {workout.DescriptionLong.split('\n\n')[1]}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </>
        );
    };

    const renderWorkoutDay = () => {
        if (!programDay) return null;

        return (
            <>
                <TopImageInfoCard
                    image={{ uri: programDay.PhotoUrl }}
                    title={`${programDay.DayTitle}`}
                    subtitle={`Week ${getWeekNumber(parseInt(dayId))} Day ${getDayOfWeek(parseInt(dayId))}`}
                    titleType='titleLarge'
                    subtitleType='link'
                    subtitleStyle={{ marginBottom: Spaces.SM, color: themeColors.subText, marginTop: 0 }}
                    titleStyle={{ marginBottom: 0 }}
                    containerStyle={{ elevation: 5, marginBottom: 0 }}
                    contentContainerStyle={{
                        backgroundColor: themeColors.background,
                        paddingHorizontal: Spaces.LG,
                    }}
                    imageStyle={{ height: Sizes.imageXXLHeight }}
                    titleFirst={true}
                    extraContent={
                        <ThemedView>
                            {programDay.RestDay ? (
                                <ThemedView style={styles.tipContainer}>
                                    <Icon name='sleep' color={themeColors.subText} style={{ marginRight: Spaces.SM, marginTop: Spaces.XS }} />
                                    <ThemedText type='body' style={{ color: themeColors.subText }}>
                                        {'Take it easy today! Focus on recovery and hydration.'}
                                    </ThemedText>
                                </ThemedView>
                            ) : (
                                <ThemedView>
                                    {[
                                        { icon: 'stopwatch', text: `${programDay.Time} mins` },
                                        { icon: 'kettlebell', text: programDay.Equipment.join(', ') },
                                        { icon: 'yoga', text: programDay.MuscleGroups.join(', ') },
                                    ].map((item, index) => (
                                        <ThemedView key={index} style={styles.attributeRow}>
                                            <ThemedView style={styles.attribute}>
                                                <Icon name={item.icon} color={themeColors.text} />
                                                <ThemedText type='body' style={styles.attributeText}>
                                                    {item.text}
                                                </ThemedText>
                                            </ThemedView>
                                        </ThemedView>
                                    ))}
                                </ThemedView>
                            )}
                        </ThemedView>
                    }
                />
                {!programDay.RestDay && programDay.Exercises && (
                    <ThemedView
                        style={[
                            styles.exercisesContainer,
                            { backgroundColor: themeColors.backgroundSecondary },
                            { paddingBottom: Spaces.XL },
                            // Remove bottom padding for slide up button
                        ]}
                    >
                        {programDay.Exercises.map((exercise, index) => (
                            <ExerciseCard
                                key={exercise.ExerciseId}
                                exercise={exercise}
                                isEnrolled={isEnrolled}
                                showLoggingButton={isExerciseLoggable(exercise)}
                                onLogPress={handleExerciseLogPress}
                                exerciseNumber={index + 1}
                                programId={programId}
                            />
                        ))}
                    </ThemedView>
                )}
            </>
        );
    };

    if (programDayState === REQUEST_STATE.PENDING) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={themeColors.text} />
            </ThemedView>
        );
    }

    if (programDayState === REQUEST_STATE.REJECTED || !programDay) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program day.</ThemedText>
            </ThemedView>
        );
    }

    const renderDayButtonContent = () => {
        if (isDayCompleted) {
            return (
                <TextButton
                    text='Day Completed'
                    textType='bodyMedium'
                    style={[styles.completeButton, { backgroundColor: themeColors.background }]}
                    textStyle={{ color: themeColors.text }}
                    iconColor={themeColors.text}
                    onPress={() => setIsResetDayModalVisible(true)}
                    iconName='check-outline'
                    size='LG'
                    disabled={isUncompletingDay}
                    loading={isUncompletingDay}
                />
            );
        }

        return (
            <>
                <PrimaryButton
                    text='Complete Day'
                    textType='bodyMedium'
                    style={[styles.completeButton, { backgroundColor: themeColors.buttonPrimary }]}
                    onPress={finishDayChecker}
                    size='LG'
                    disabled={isCompletingDay}
                    loading={isCompletingDay}
                    haptic='notificationSuccess'
                />
                {programDay.RestDay && (
                    <TextButton
                        text='Mobility Workouts'
                        textStyle={{ color: themeColors.text }}
                        textType='bodyMedium'
                        style={styles.mobilityButton}
                        size='LG'
                        onPress={() => navigateToAllWorkouts({ focus: ['Mobility'] })}
                    />
                )}
            </>
        );
    };

    const renderDayButton = () => {
        if (!isEnrolled) return null;

        // For video days, keep the current absolute positioning
        if (programDay.Type === 'video') {
            return (
                <View style={[styles.buttonContainer, { backgroundColor: themeColors.background, paddingBottom: Spaces.XXL }]}>
                    {isDayCompleted ? (
                        <TextButton
                            text='Day Completed'
                            textType='bodyMedium'
                            style={[styles.completeButton, { backgroundColor: themeColors.background }]}
                            textStyle={{ color: themeColors.text }}
                            iconColor={themeColors.text}
                            onPress={() => setIsResetDayModalVisible(true)}
                            iconName='check-outline'
                            size='LG'
                            disabled={isUncompletingDay}
                            loading={isUncompletingDay}
                        />
                    ) : (
                        <TextButton
                            text='Complete Day'
                            textType='bodyMedium'
                            style={styles.completeButton}
                            onPress={finishDayChecker}
                            size='LG'
                            disabled={isCompletingDay}
                            loading={isCompletingDay}
                            haptic='notificationSuccess'
                        />
                    )}
                </View>
            );
        }

        // For completed days or rest days, use absolute positioning (old behavior)
        if (isDayCompleted || programDay.RestDay) {
            return <View style={[styles.buttonContainer, { backgroundColor: 'transparent' }]}>{renderDayButtonContent()}</View>;
        }

        // For active workout days, use the slide up button
        return (
            <SlideUpActionButton scrollY={scrollY} contentHeight={contentHeight} screenHeight={scrollViewHeight} bottomProximity={400} hideOnScrollUp={true}>
                {renderDayButtonContent()}
            </SlideUpActionButton>
        );
    };

    return (
        <ThemedView style={[{ flex: 1, backgroundColor: themeColors.backgroundSecondary }, programDay.RestDay && { backgroundColor: themeColors.background }]}>
            <AnimatedHeader
                scrollY={scrollY}
                headerInterpolationStart={Spaces.XXL}
                headerInterpolationEnd={Sizes.imageLGHeight}
                onMenuPress={isEnrolled ? handleMenuPress : undefined}
            />
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: Spaces.XXXL }}
                onContentSizeChange={handleContentSizeChange}
                onLayout={handleScrollViewLayout}
            >
                {programDay.Type === 'video' ? renderVideoDay() : renderWorkoutDay()}
                {/* Only render inline button for video days */}
                {programDay.Type === 'video' && renderDayButton()}
            </Animated.ScrollView>

            {/* Slide up button for workout days */}
            {programDay.Type !== 'video' && renderDayButton()}

            {/* Video player for video type days */}
            {programDay.Type === 'video' && programDay.WorkoutId && workouts[programDay.WorkoutId] && (
                <FullScreenVideoPlayer
                    ref={videoPlayerRef}
                    source={{ uri: workouts[programDay.WorkoutId].VideoUrl }}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    onDismiss={() => {}}
                />
            )}

            {/* Modals */}
            <AutoDismissSuccessModal
                visible={showResetSuccess}
                onDismiss={handleResetModalDismiss}
                title='Day Reset'
                showTitle={true}
                showMessage={false}
                duration={1300}
            />
            <ProgramDaySkipModal
                visible={isProgramDaySkipModalVisible}
                onClose={() => setIsProgramDaySkipModalVisible(false)}
                onConfirm={handleProgramDaySkip}
            />
            <ProgramDayUnfinishModal visible={isResetDayModalVisible} onClose={() => setIsResetDayModalVisible(false)} onConfirm={resetDay} />
            {showConfetti && (
                <View style={StyleSheet.absoluteFill}>
                    <LottieView
                        ref={confettiRef}
                        source={require('@/assets/animations/confetti.json')}
                        autoPlay={false}
                        loop={false}
                        style={StyleSheet.absoluteFill}
                    />
                </View>
            )}
            {selectedExercise && (
                <ExerciseLoggingSheet visible={isLoggingSheetVisible} onClose={handleLoggingSheetClose} exercise={selectedExercise} programId={programId} />
            )}
            <BottomMenuModal isVisible={isBottomMenuVisible} onClose={() => setIsBottomMenuVisible(false)} options={menuOptions} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingRight: Spaces.SM,
        paddingBottom: Spaces.LG,
    },
    container: {
        marginRight: '27%',
        alignItems: 'center',
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: Spaces.SM,
    },
    attributeText: {
        marginLeft: Spaces.SM,
        lineHeight: Spaces.LG,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginRight: Spaces.MD,
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spaces.XL,
        marginBottom: Spaces.SM,
    },
    exercisesContainer: {
        paddingTop: Spaces.LG,
        paddingBottom: 0,
        paddingHorizontal: Spaces.MD,
    },
    mainContainer: {
        marginTop: Spaces.LG,
        paddingBottom: Sizes.bottomSpaceLarge,
    },
    descriptionContainer: {
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.MD,
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: '10%',
        position: 'absolute',
        bottom: Spaces.XL,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    topCard: {
        paddingHorizontal: Spaces.LG,
        paddingVertical: Spaces.MD,
    },
    completeButton: {
        width: '100%',
    },
    mobilityButton: {
        width: '100%',
        marginTop: Spaces.MD,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingLeft: Spaces.SM,
        paddingRight: Spaces.LG,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spaces.LG,
    },
});

export default ProgramDayScreen;
