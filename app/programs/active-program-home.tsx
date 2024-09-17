// app/programs/active-program-home.tsx

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProgramDayOverviewCard } from '@/components/programs/ProgramDayOverviewCard';
import ProgressBar from '@/components/programs/ProgressBar';
import { Icon } from '@/components/icons/Icon';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getActiveProgramAsync, getActiveProgramCurrentDayAsync, getActiveProgramNextDaysAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { BasicSplash } from '@/components/splashScreens/BasicSplash';
import { REQUEST_STATE } from '@/constants/requestStates';

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const screenWidth = Dimensions.get('window').width;

    const dispatch = useDispatch<AppDispatch>();

    const [isSplashVisible, setIsSplashVisible] = useState(true);

    const {
        userProgramProgress,
        userProgramProgressState,
        programs,
        programsState,
        activeProgramId,
        programDays,
        programDaysState,
        activeProgramCurrentDayId,
        activeProgramNextDayIds,
        error: programError,
    } = useSelector((state: RootState) => state.programs);

    const { workoutQuote, workoutQuoteState, restDayQuote, restDayQuoteState, error: quoteError } = useSelector((state: RootState) => state.quotes);

    // Use activeProgramId directly
    const programId = activeProgramId;

    // Get the active program from the normalized state
    const activeProgram = activeProgramId ? programs[activeProgramId] : null;
    const activeProgramState = activeProgramId ? programsState[activeProgramId] : REQUEST_STATE.IDLE;

    // Get the current day from the normalized state
    const activeProgramCurrentDay = programId && activeProgramCurrentDayId ? programDays[programId]?.[activeProgramCurrentDayId] : null;

    const activeProgramCurrentDayState = programId && activeProgramCurrentDayId ? programDaysState[programId]?.[activeProgramCurrentDayId] : REQUEST_STATE.IDLE;

    // Get the next days from the normalized state
    const activeProgramNextDays =
        programId && activeProgramNextDayIds ? activeProgramNextDayIds.map((dayId) => programDays[programId]?.[dayId]).filter((day) => day !== undefined) : [];

    const activeProgramNextDaysStates =
        programId && activeProgramNextDayIds ? activeProgramNextDayIds.map((dayId) => programDaysState[programId]?.[dayId]) : [];

    const areNextDaysLoaded = activeProgramNextDaysStates.every((state) => state === REQUEST_STATE.FULFILLED);

    useEffect(() => {
        // Fetch quotes
        dispatch(getWorkoutQuoteAsync());
        dispatch(getRestDayQuoteAsync());
    }, [dispatch]);

    useEffect(() => {
        // Once user program progress is available, fetch the active program data
        if (userProgramProgressState === REQUEST_STATE.FULFILLED && userProgramProgress) {
            dispatch(getActiveProgramAsync());
            dispatch(getActiveProgramCurrentDayAsync());
            dispatch(getActiveProgramNextDaysAsync({ numDays: 3 }));
        }
    }, [userProgramProgress, userProgramProgressState, dispatch]);

    const handleLoadingComplete = () => {
        setIsSplashVisible(false);
    };

    // Show the splash screen while data is loading or splash is visible
    if (
        isSplashVisible ||
        activeProgramState !== REQUEST_STATE.FULFILLED ||
        userProgramProgressState !== REQUEST_STATE.FULFILLED ||
        activeProgramCurrentDayState !== REQUEST_STATE.FULFILLED ||
        !areNextDaysLoaded ||
        workoutQuoteState !== REQUEST_STATE.FULFILLED ||
        restDayQuoteState !== REQUEST_STATE.FULFILLED
    ) {
        return <BasicSplash onLoadingComplete={handleLoadingComplete} delay={500} />;
    }

    if (programError || quoteError) {
        const errorMessage = programError ? programError : quoteError;
        return (
            <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ThemedText>Error: {errorMessage}</ThemedText>
            </ThemedView>
        );
    }

    // Determine which quote to display based on whether the current day is a rest day
    const displayQuote = activeProgramCurrentDay?.RestDay ? restDayQuote : workoutQuote;

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{
                    justifyContent: 'flex-start',
                }}
                showsVerticalScrollIndicator={false}
            >
                <ThemedView style={styles.quoteContainer}>
                    <ThemedText type='italic' style={[styles.quoteText, { color: themeColors.containerHighlight }]}>
                        {displayQuote.QuoteText}
                    </ThemedText>
                </ThemedView>
                <ThemedView style={styles.planHeader}>
                    <ThemedText type='titleLarge'>{activeProgram?.ProgramName}</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.weekProgress]}>
                    <ThemedText style={[{ color: themeColors.subText }]}>
                        Week {userProgramProgress?.Week} of {activeProgram?.Weeks}
                    </ThemedText>
                    {/* <ProgressBar
            completedParts={Number(userProgramProgress.Week) - 1}
            currentPart={Number(userProgramProgress.Week)}
            parts={Number(activeProgram.Weeks)}
            containerWidth={screenWidth - spacing.xxl}
          /> */}
                </ThemedView>

                <ThemedView style={[styles.activeCardContainer]}>
                    <ActiveProgramDayCard />
                </ThemedView>

                <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <ThemedText type='title' style={[styles.subHeader, { color: themeColors.text }]}>
                        Up Next
                    </ThemedText>
                    {activeProgramNextDays && activeProgramNextDays.map((day) => <ProgramDayOverviewCard key={day.DayId} day={day} />)}
                </ThemedView>

                <ThemedView style={[styles.menuContainer]}>
                    <ThemedView>
                        <TouchableOpacity style={styles.menuItem}>
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                Program Calendar
                            </ThemedText>
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                        <View
                            style={{
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                        />
                    </ThemedView>
                    <ThemedView>
                        <TouchableOpacity style={styles.menuItem}>
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                Program Overview
                            </ThemedText>
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                        <View
                            style={{
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                        />
                    </ThemedView>
                    <ThemedView>
                        <TouchableOpacity style={styles.menuItem}>
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                Browse Programs
                            </ThemedText>
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                        <View
                            style={{
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                        />
                    </ThemedView>
                    <ThemedView
                        style={{
                            paddingBottom: spacing.xxl,
                        }}
                    >
                        <TouchableOpacity style={styles.menuItem}>
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                End Program
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        width: '100%',
    },
    subHeader: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    upNextContainer: {
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    menuItem: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quoteContainer: {
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        marginHorizontal: spacing.xxl,
    },
    quoteText: {
        textAlign: 'center',
        paddingBottom: spacing.sm,
    },
    planHeader: {
        paddingHorizontal: spacing.lg,
    },
    weekProgress: {
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    activeCardContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    menuContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 0,
        paddingTop: spacing.md,
    },
});
