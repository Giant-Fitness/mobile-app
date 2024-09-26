// app/programs/ProgramCalendarScreen.tsx

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { REQUEST_STATE } from '@/constants/requestStates';
import { ProgramMonthView } from '@/components/programs/ProgramMonthView';
import { Spaces } from '@/constants/Spaces';
import { groupProgramDaysIntoWeeks, groupWeeksIntoMonths, getWeekNumber, getDayOfWeek } from '@/utils/calendar';
import { Icon } from '@/components/base/Icon';
import { ProgramDay } from '@/types';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Sizes } from '@/constants/Sizes';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { ProgramProgressPillBar } from '@/components/programs/ProgramProgressPillBar';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { ProgramWeekList } from '@/components/programs/ProgramWeekList';
import { getProgramAsync, getAllProgramDaysAsync } from '@/store/programs/thunks';
import { useSplashScreen } from '@/hooks/useSplashScreen';

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

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Redux Selectors
    const program = useSelector((state: RootState) => state.programs.programs[programId]);
    const programState = useSelector((state: RootState) => state.programs.programsState[programId]);
    const userProgramProgress = useSelector((state: RootState) => state.user.userProgramProgress);
    const programDays = useSelector((state: RootState) => state.programs.programDays[programId]);
    const programDaysState = useSelector((state: RootState) => state.programs.programDaysState[programId]);

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

    const navigateToProgramDay = (dayId: string) => {
        if (programId && dayId) {
            navigation.navigate('programs/program-day', {
                programId: programId,
                dayId: dayId,
            });
        }
    };

    // Consolidated loading logic
    const currentMonthWeeks = months[currentMonthIndex];
    const programDaysStates = programDaysState && Object.values(programDaysState);
    const isProgramDaysLoading = programDaysStates && programDaysStates.some((state) => state === REQUEST_STATE.PENDING);

    const isDataLoading =
        programState === REQUEST_STATE.PENDING ||
        isProgramDaysLoading ||
        !program ||
        (programDays && Object.keys(programDays).length !== program.Days) ||
        months.length === 0 ||
        !currentMonthWeeks;

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: !isDataLoading ? REQUEST_STATE.FULFILLED : REQUEST_STATE.PENDING,
    });

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={!isDataLoading} />;
    }

    if (programState === REQUEST_STATE.REJECTED) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program.</ThemedText>
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

    const userCurrentDayNumber = isEnrolled && userProgramProgress ? parseInt(userProgramProgress.CurrentDay) : null;
    const userCurrentWeekNumber = userCurrentDayNumber ? getWeekNumber(userCurrentDayNumber) : null;

    // Handle the Start Program action
    const handleStartProgram = () => {
        // Start the program
        console.log('Program started');
        // Implement your start program logic here
    };

    // Handle the Reset Program action
    const handleResetProgram = () => {
        // Reset the program
        console.log('Program reset');
        // Implement your reset program logic here
    };

    // Function to get the level icon
    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return 'level-beginner';
            case 'intermediate':
                return 'level-intermediate';
            case 'advanced':
                return 'level-advanced';
            case 'all levels':
            default:
                return 'people'; // Use a default icon
        }
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
                        imageStyle={{ height: Sizes.image3XLHeight }}
                        extraContent={
                            <View>
                                {/* Attributes in a Row */}
                                <ThemedView style={[styles.attributeRow]}>
                                    {/* Attribute 1: Length */}
                                    <View style={styles.attributeItem}>
                                        <Icon name='stopwatch' size={Sizes.fontSizeDefault} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {program.Weeks} Weeks
                                        </ThemedText>
                                    </View>

                                    {/* Attribute 2: Frequency */}
                                    <View style={styles.attributeItem}>
                                        <Icon name='calendar' size={Sizes.fontSizeDefault} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {program.Frequency}
                                        </ThemedText>
                                    </View>

                                    {/* Attribute 3: Goal */}
                                    <View style={styles.attributeItem}>
                                        <Icon name='target' size={Sizes.fontSizeDefault} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {program.Goal}
                                        </ThemedText>
                                    </View>

                                    {/* Attribute 4: Level */}
                                    <View style={styles.attributeItem}>
                                        <Icon name={getLevelIcon(program.Level)} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {program.Level}
                                        </ThemedText>
                                    </View>
                                </ThemedView>
                            </View>
                        }
                    />
                    {isEnrolled && (
                        <ThemedView style={[styles.progress]}>
                            <ThemedText type='overline' style={[{ color: themeColors.subText, paddingBottom: Spaces.MD }]}>
                                Day {userCurrentDayNumber}/{program?.Days}
                            </ThemedText>
                            <ProgramProgressPillBar
                                completedParts={Number(userCurrentWeekNumber) - 1}
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

                    {/* Week-by-Week View */}
                    <ProgramWeekList
                        currentMonthWeeks={currentMonthWeeks}
                        userCurrentWeekNumber={userCurrentWeekNumber}
                        userCurrentDayNumber={userCurrentDayNumber}
                        navigateToProgramDay={navigateToProgramDay}
                    />
                </ThemedView>
            </Animated.ScrollView>
            <ThemedView style={styles.buttonContainer}>
                {!isEnrolled && (
                    <PrimaryButton text='Start Program' textType='bodyMedium' style={[styles.startButton]} onPress={handleStartProgram} size='LG' />
                )}
                {/*        {isEnrolled && (
          <PrimaryButton
            text="Reset Program"
            style={[styles.resetButton]}
            onPress={handleResetProgram}
            size="LG"
            textStyle={{ color: themeColors.error }}
          />
        )}*/}
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spaces.LG,
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
    },
    calendar: {
        paddingBottom: Spaces.LG,
    },
    monthTitle: {},
    buttonContainer: {
        position: 'absolute',
        bottom: Spaces.XL,
        right: 0,
        left: 0,
        backgroundColor: 'transparent',
        marginHorizontal: '10%',
    },
    startButton: {},
    resetButton: {
        borderWidth: 1,
    },
    progress: {
        marginHorizontal: Spaces.LG,
        paddingTop: Spaces.LG,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spaces.XL,
        marginBottom: Spaces.SM,
    },
    attributeText: {
        marginLeft: Spaces.XS,
        lineHeight: Spaces.LG,
    },
});

export default ProgramCalendarScreen;
