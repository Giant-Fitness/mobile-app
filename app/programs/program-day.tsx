// app/programs/program-day.tsx

import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ExerciseCard } from '@/components/programs/ExerciseCard';
import { Icon } from '@/components/icons/Icon';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';
import { TopImageInfoCard } from '@/components/layout/TopImageInfoCard';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';
import { TextButton } from '@/components/base/TextButton';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getProgramDayAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';

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

    // **2. Main Return with Conditional Rendering**
    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={sizes.imageLargeHeight} headerInterpolationEnd={sizes.imageLargeHeight + spacing.xxl} />
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
                            subtitle={`Week ${programDay.Week} Day ${programDay.Day}`}
                            titleType='titleXLarge'
                            subtitleStyle={{ marginBottom: spacing.md, color: themeColors.subText, marginTop: 0 }}
                            titleStyle={{ marginBottom: spacing.xs }}
                            containerStyle={{ elevation: 5, marginBottom: 0 }}
                            contentContainerStyle={{
                                backgroundColor: themeColors.background,
                                paddingHorizontal: spacing.lg,
                            }}
                            imageStyle={{ height: sizes.imageXLargeHeight }}
                            titleFirst={true}
                            extraContent={
                                <ThemedView>
                                    {programDay.RestDay ? (
                                        <ThemedView style={styles.tipContainer}>
                                            <Icon
                                                name='sleep'
                                                size={moderateScale(16)}
                                                color={themeColors.subText}
                                                style={{ marginRight: spacing.sm, marginTop: spacing.xs }}
                                            />
                                            <ThemedText type='body' style={{ color: themeColors.subText }}>
                                                {'Take it easy today! Focus on recovery and hydration.'}
                                            </ThemedText>
                                        </ThemedView>
                                    ) : (
                                        <ThemedView>
                                            <ThemedView style={styles.attributeRow}>
                                                <ThemedView style={styles.attribute}>
                                                    <Icon name='stopwatch' size={moderateScale(18)} color={themeColors.text} />
                                                    <ThemedText type='body' style={styles.attributeText}>
                                                        {programDay.Time} mins
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>
                                            <ThemedView style={styles.attributeRow}>
                                                <ThemedView style={styles.attribute}>
                                                    <Icon name='kettlebell' size={moderateScale(18)} color={themeColors.text} />
                                                    <ThemedText type='body' style={styles.attributeText}>
                                                        {programDay.Equipment.join(', ')}
                                                    </ThemedText>
                                                </ThemedView>
                                            </ThemedView>
                                            <ThemedView style={styles.attributeRow}>
                                                <ThemedView style={styles.attribute}>
                                                    <Icon name='yoga' size={moderateScale(18)} color={themeColors.text} />
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
                            <ThemedView style={[styles.exercisesContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                                {programDay.Exercises && programDay.Exercises.map((exercise) => <ExerciseCard key={exercise.ExerciseId} exercise={exercise} />)}
                            </ThemedView>
                        )}
                    </>
                )}
            </Animated.ScrollView>
            <ThemedView style={styles.buttonContainer}>
                <TextButton
                    text='Finish Day'
                    textType='bodyMedium'
                    style={[styles.completeButton, { backgroundColor: themeColors.buttonPrimary }]}
                    onPress={handleCompleteDay}
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
                        onPress={() => navigateToAllWorkouts({ focus: ['Mobility'] })}
                    />
                )}
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingRight: 8,
        paddingBottom: 90,
    },
    container: {
        marginRight: '27%',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'InterMedium',
        fontSize: 18,
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: spacing.sm,
    },
    attributeText: {
        marginLeft: spacing.sm,
        lineHeight: spacing.lg,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    exercisesContainer: {
        paddingVertical: spacing.lg,
        paddingBottom: 120,
        paddingHorizontal: spacing.md,
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: '10%',
        position: 'absolute',
        bottom: verticalScale(30),
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    completeButton: {
        width: '100%',
        paddingVertical: spacing.md,
    },
    mobilityButton: {
        width: '100%',
        borderWidth: StyleSheet.hairlineWidth,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.sm,
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
        padding: spacing.lg,
    },
});

export default ProgramDayScreen;
