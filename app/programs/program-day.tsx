// app/programs/program-day.tsx

import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ExerciseCard } from '@/components/programs/ExerciseCard';
import { Icon } from '@/components/base/Icon';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { TextButton } from '@/components/buttons/TextButton';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getProgramDayAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { getWeekNumber, getDayOfWeek } from '@/utils/calendar';

type ProgramDayScreenParams = {
    ProgramDay: {
        dayId: string;
        programId: string;
    };
};

const ProgramDayScreen = () => {
    // **1. All Hooks Called Unconditionally at the Top**

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigation = useNavigation();
    const route = useRoute<RouteProp<ProgramDayScreenParams, 'ProgramDay'>>();
    const dispatch = useDispatch<AppDispatch>();

    const { dayId, programId } = route.params;

    const navigateToAllWorkouts = (initialFilters = {}) => {
        navigation.navigate('workouts/all-workouts', { initialFilters });
    };

    const programDay = useSelector((state: RootState) => state.programs.programDays[programId]?.[dayId]);
    const programDayState = useSelector((state: RootState) => state.programs.programDaysState[programId]?.[dayId]);
    const userProgramProgress = useSelector((state: RootState) => state.programs.userProgramProgress);

    // **Data Fetching Hook**
    useEffect(() => {
        if (!programDay && programDayState !== REQUEST_STATE.PENDING) {
            dispatch(getProgramDayAsync({ programId, dayId }));
        }
    }, [programDay, programDayState, dispatch, programId, dayId]);

    // **Header Options Hook**
    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // **Animated Hooks**
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    // **Event Handlers**
    const handleCompleteDay = () => {
        console.log('Complete Day button pressed');
    };

    // **Calculate Current Week Based on dayId**
    const currentDayNumber = parseInt(dayId, 10);
    const currentWeek = getWeekNumber(currentDayNumber);
    const dayOfWeek = getDayOfWeek(currentDayNumber);
    const isEnrolled = userProgramProgress?.ProgramId === programId;

    // **2. Main Return with Conditional Rendering**
    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Sizes.imageLGHeight} headerInterpolationEnd={Sizes.imageLGHeight + Spaces.XXL} />
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {/* **Loading State** */}
                {programDayState === REQUEST_STATE.PENDING && (
                    <ThemedView style={styles.loadingContainer}>
                        <ActivityIndicator size='large' color={themeColors.text} />
                    </ThemedView>
                )}

                {/* **Error State** */}
                {programDayState === REQUEST_STATE.REJECTED && (
                    <ThemedView style={styles.errorContainer}>
                        <ThemedText>Error loading the program day.</ThemedText>
                    </ThemedView>
                )}

                {/* **Loaded State** */}
                {programDayState === REQUEST_STATE.FULFILLED && programDay && (
                    <>
                        <TopImageInfoCard
                            image={{ uri: programDay.PhotoUrl }}
                            title={programDay.DayTitle}
                            subtitle={`Week ${currentWeek} Day ${dayOfWeek}`}
                            titleType='titleXLarge'
                            subtitleStyle={{ marginBottom: Spaces.MD, color: themeColors.subText, marginTop: 0 }}
                            titleStyle={{ marginBottom: Spaces.XS }}
                            containerStyle={{ elevation: 5, marginBottom: 0 }}
                            contentContainerStyle={{
                                backgroundColor: themeColors.background,
                                paddingHorizontal: Spaces.LG,
                            }}
                            imageStyle={{ height: Sizes.imageXLHeight }}
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
                                            <ThemedView style={styles.attributeRow}>
                                                <ThemedView style={styles.attribute}>
                                                    <Icon name='stopwatch' color={themeColors.text} />
                                                    <ThemedText type='body' style={styles.attributeText}>
                                                        {programDay.Time} mins
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>
                                            <ThemedView style={styles.attributeRow}>
                                                <ThemedView style={styles.attribute}>
                                                    <Icon name='kettlebell' color={themeColors.text} />
                                                    <ThemedText type='body' style={styles.attributeText}>
                                                        {programDay.Equipment.join(', ')}
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>
                                            <ThemedView style={styles.attributeRow}>
                                                <ThemedView style={styles.attribute}>
                                                    <Icon name='yoga' color={themeColors.text} />
                                                    <ThemedText type='body' style={styles.attributeText}>
                                                        {programDay.MuscleGroups.join(', ')}
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>
                                        </ThemedView>
                                    )}
                                </ThemedView>
                            }
                        />
                        {!programDay.RestDay && (
                            <ThemedView
                                style={[
                                    styles.exercisesContainer,
                                    { backgroundColor: themeColors.backgroundTertiary },
                                    isEnrolled && [{ paddingBottom: Sizes.bottomSpaceLarge }],
                                ]}
                            >
                                {programDay.Exercises &&
                                    programDay.Exercises.map((exercise) => (
                                        <ExerciseCard key={exercise.ExerciseId} exercise={exercise} isEnrolled={isEnrolled} />
                                    ))}
                            </ThemedView>
                        )}
                    </>
                )}
            </Animated.ScrollView>
            {isEnrolled && (
                <View style={styles.buttonContainer}>
                    <PrimaryButton
                        text='Finish Day'
                        textType='bodyMedium'
                        style={[styles.completeButton, { backgroundColor: themeColors.buttonPrimary }]}
                        onPress={handleCompleteDay}
                        size={'LG'}
                    />
                    {programDay && programDay.RestDay && (
                        <TextButton
                            text='Mobility Workouts'
                            textStyle={[{ color: themeColors.text }]}
                            textType='bodyMedium'
                            style={[
                                styles.mobilityButton,
                                {
                                    backgroundColor: themeColors.background,
                                    borderColor: themeColors.text,
                                },
                            ]}
                            size={'LG'}
                            onPress={() => navigateToAllWorkouts({ focus: ['Mobility'] })}
                        />
                    )}
                </View>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingRight: Spaces.SM,
        paddingBottom: Sizes.bottomSpaceMedium,
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
    },
    exercisesContainer: {
        paddingVertical: Spaces.LG,
        paddingBottom: Spaces.XXL,
        paddingHorizontal: Spaces.MD,
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: '10%',
        position: 'absolute',
        bottom: Spaces.XL,
        left: 0,
        right: 0,
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
        paddingHorizontal: Spaces.SM,
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
