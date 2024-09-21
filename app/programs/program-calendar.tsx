// app/programs/program-calendar.tsx

import React, { useEffect, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getProgramAsync, getAllProgramDaysAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { ProgramMonthView } from '@/components/programs/ProgramMonthView';
import { Spaces } from '@/constants/Spaces';
import { groupProgramDaysIntoWeeks, groupWeeksIntoMonths, getWeekNumber, getDayOfWeek } from '@/utils/calendar';
import { Icon } from '@/components/base/Icon';
import { ProgramDay } from '@/types/types';
import { ProgramDayRowCard } from '@/components/programs/ProgramDayRowCard';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Sizes } from '@/constants/Sizes';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { ProgramProgressPillBar } from '@/components/programs/ProgramProgressPillBar';
import { Collapsible } from '@/components/layout/Collapsible'; // Import Collapsible

type ProgramCalendarScreenParams = {
    programId: string;
};

const ProgramCalendarScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const screenWidth = Dimensions.get('window').width;

    const navigation = useNavigation();

    const route = useRoute<RouteProp<Record<string, ProgramCalendarScreenParams>, string>>();
    const { programId } = route.params;

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Redux Selectors
    const program = useSelector((state: RootState) => state.programs.programs[programId]);
    const programState = useSelector((state: RootState) => state.programs.programsState[programId]);
    const userProgramProgress = useSelector((state: RootState) => state.programs.userProgramProgress);
    const programDays = useSelector((state: RootState) => state.programs.programDays[programId]);

    // Local State
    const [months, setMonths] = useState<ProgramDay[][][]>([]); // Array of months, each month is array of weeks

    useEffect(() => {
        if (programState !== REQUEST_STATE.FULFILLED) {
            dispatch(getProgramAsync({ programId }));
        }
    }, [programState, dispatch, programId]);

    useEffect(() => {
        if (programId && program) {
            dispatch(getAllProgramDaysAsync({ programId }));
        }
    }, [programId, program, userProgramProgress, dispatch]);

    useEffect(() => {
        if (program && programDays) {
            // Sort program days by DayNumber
            const programDaysArray = Object.values(programDays)
                .map((day) => ({
                    ...day,
                    DayNumber: parseInt(day.DayId),
                    WeekNumber: getWeekNumber(parseInt(day.DayId)),
                    DayOfWeek: getDayOfWeek(parseInt(day.DayId)),
                }))
                .sort((a, b) => a.DayNumber - b.DayNumber);

            // Group into weeks
            const groupedWeeks = groupProgramDaysIntoWeeks(programDaysArray);

            // Group weeks into months (4 weeks per month)
            const groupedMonths = groupWeeksIntoMonths(groupedWeeks);

            setMonths(groupedMonths);
        }
    }, [program, programDays]);

    const isEnrolled = userProgramProgress?.ProgramId === programId;

    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

    useEffect(() => {
        if (months.length > 0) {
            let initialIndex = 0;
            if (isEnrolled && userProgramProgress) {
                initialIndex = Math.floor((parseInt(userProgramProgress.CurrentDay) - 1) / 28);
                initialIndex = Math.min(initialIndex, months.length - 1);
            }
            setCurrentMonthIndex(initialIndex);
        }
    }, [months, userProgramProgress, isEnrolled]);

    const navigateToProgramDay = (dayId) => {
        if (programId && dayId) {
            navigation.navigate('programs/program-day', {
                programId: programId,
                dayId: dayId,
            });
        }
    };

    if (programState === REQUEST_STATE.PENDING || !program || !programDays) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={themeColors.text} />
            </ThemedView>
        );
    }

    if (programState === REQUEST_STATE.REJECTED) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program.</ThemedText>
            </ThemedView>
        );
    }

    if (months.length === 0) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={themeColors.text} />
            </ThemedView>
        );
    }

    const totalMonths = months.length;

    const handlePrevMonth = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthIndex < totalMonths - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
        }
    };

    const currentMonthWeeks = months[currentMonthIndex];

    if (!currentMonthWeeks) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={themeColors.text} />
            </ThemedView>
        );
    }

    const userCurrentDayNumber = isEnrolled && userProgramProgress ? parseInt(userProgramProgress.CurrentDay) : null;
    const userCurrentWeekNumber = userCurrentDayNumber ? getWeekNumber(userCurrentDayNumber) : null;

    // Handle the Start Program action
    const handleStartProgram = () => {
        // Start the program
        console.log('program started');
    };

    // Handle the Reset Program action
    const handleResetProgram = () => {
        // Reset the program
        console.log('program reset');
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundTertiary }]}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Sizes.imageLGHeight} headerInterpolationEnd={Sizes.imageLGHeight + Spaces.XXL} />
            <Animated.ScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <ThemedView
                    style={[
                        {
                            backgroundColor: themeColors.background,
                        },
                        !isEnrolled && { marginBottom: Sizes.bottomSpaceLarge },
                        isEnrolled && { marginBottom: Spaces.XXL },
                    ]}
                >
                    <TopImageInfoCard
                        image={{ uri: program.PhotoUrl }}
                        title={program.ProgramName}
                        titleType='titleLarge'
                        titleStyle={{ marginBottom: Spaces.XS }}
                        contentContainerStyle={{
                            backgroundColor: themeColors.background,
                            paddingHorizontal: Spaces.LG,
                            paddingBottom: Spaces.XXS,
                        }}
                        imageStyle={{ height: Sizes.imageXLHeight }}
                    />
                    {isEnrolled && (
                        <ThemedView style={[styles.progress]}>
                            <ThemedText type='overline' style={[{ color: themeColors.subText, paddingBottom: Spaces.MD }]}>
                                Day {userCurrentDayNumber}/{program?.Days}
                            </ThemedText>
                            <ProgramProgressPillBar
                                completedParts={Number(userCurrentWeekNumber - 1)}
                                currentPart={Number(userCurrentWeekNumber)}
                                parts={Number(program.Weeks)}
                                containerWidth={screenWidth - Spaces.XXL}
                            />
                        </ThemedView>
                    )}
                    <ThemedView style={[styles.calendarContainer, { backgroundColor: themeColors.background }]}>
                        <ThemedView style={styles.header}>
                            {currentMonthIndex > 0 ? (
                                <TouchableOpacity onPress={handlePrevMonth}>
                                    <Icon name='chevron-back' color={themeColors.text} />
                                </TouchableOpacity>
                            ) : (
                                <View style={{ width: Spaces.XL }} /> // Placeholder to maintain layout
                            )}
                            <ThemedText type='overline' style={styles.monthTitle}>
                                Month {currentMonthIndex + 1}
                            </ThemedText>
                            {currentMonthIndex < totalMonths - 1 ? (
                                <TouchableOpacity onPress={handleNextMonth}>
                                    <Icon name='chevron-forward' color={themeColors.text} />
                                </TouchableOpacity>
                            ) : (
                                <ThemedView style={{ width: Spaces.XL }} /> // Placeholder to maintain layout
                            )}
                        </ThemedView>
                        <ThemedView style={styles.calendar}>
                            <ProgramMonthView
                                weeks={months[currentMonthIndex]}
                                onDayPress={navigateToProgramDay}
                                userProgramProgress={userProgramProgress}
                                isEnrolled={isEnrolled}
                            />
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.weekByWeekContainer]}>
                        {currentMonthWeeks.map((week, weekIndex) => {
                            // Filter out null days (placeholders)
                            const daysInWeek = week.filter((day) => day !== null) as ProgramDay[];

                            if (daysInWeek.length === 0) return null;

                            // Get the week number from the first day in the week
                            const weekNumber = getWeekNumber(parseInt(daysInWeek[0].DayId));
                            // Determine if this is the current week
                            const isCurrentWeek = userCurrentWeekNumber === weekNumber;
                            const isPastWeek = userCurrentWeekNumber > weekNumber;

                            return (
                                <Collapsible
                                    key={`week-${weekNumber}`}
                                    title={`Week ${weekNumber}`}
                                    isOpen={isCurrentWeek} // Open current week by default
                                    activeOpacity={1}
                                    titleStyle={[
                                        styles.weekHeaderText,
                                        { color: themeColors.text },
                                        isCurrentWeek && { color: themeColors.white },
                                        isPastWeek && [{ color: themeColors.subText, textDecorationLine: 'line-through' }],
                                    ]}
                                    headingStyle={[
                                        styles.weekHeader,
                                        { backgroundColor: themeColors.background },
                                        isCurrentWeek && { backgroundColor: themeColors.primary },
                                        isPastWeek && [{ backgroundColor: themeColors.background }],
                                    ]}
                                    iconStyle={[isCurrentWeek && { color: themeColors.white }]}
                                >
                                    <ThemedView>
                                        {daysInWeek.map((day) => {
                                            // Determine if the day is completed
                                            const dayNumber = parseInt(day.DayId);
                                            const isCompleted = userCurrentDayNumber ? dayNumber < userCurrentDayNumber : false;
                                            const isCurrentDay = userCurrentDayNumber ? dayNumber === userCurrentDayNumber : false;
                                            return (
                                                <ProgramDayRowCard
                                                    key={`day-${day.DayId}`}
                                                    day={day}
                                                    onPress={() => navigateToProgramDay(day.DayId)}
                                                    isCompleted={isCompleted}
                                                    isCurrentDay={isCurrentDay}
                                                />
                                            );
                                        })}
                                    </ThemedView>
                                </Collapsible>
                            );
                        })}
                    </ThemedView>
                </ThemedView>
            </Animated.ScrollView>
            <ThemedView style={styles.buttonContainer}>
                {!isEnrolled && <PrimaryButton text='Start Program' style={[styles.startButton]} onPress={handleStartProgram} size={'LG'} />}
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
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
    flatList: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.MD,
        paddingTop: Spaces.LG,
    },
    calendarContainer: {
        borderRadius: Spaces.SM,
        paddingTop: Spaces.LG,
    },
    calendar: {
        paddingBottom: Spaces.LG,
    },
    monthTitle: {},
    weekByWeekContainer: {
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.LG,
    },
    weekContainer: {},
    weekHeader: {
        paddingVertical: Spaces.SM + Spaces.XS,
        paddingHorizontal: Spaces.XL,
    },
    weekHeaderText: {},
    buttonContainer: {
        position: 'absolute',
        bottom: Spaces.XL,
        right: 0,
        left: 0,
        backgroundColor: 'transparent',
        marginHorizontal: '10%',
    },
    startButton: {},
    progress: {
        marginHorizontal: Spaces.LG,
    },
});

export default ProgramCalendarScreen;
