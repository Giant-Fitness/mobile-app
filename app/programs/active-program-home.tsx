// app/programs/active-program-home.tsx

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProgramDayDetailCard } from '@/components/programs/ProgramDayDetailCard';
import { Icon } from '@/components/base/Icon';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { AppDispatch } from '@/store/store';
import { BasicSplash } from '@/components/base/BasicSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { HighlightedTip } from '@/components/alerts/HighlightedTip';
import { getWeekNumber, getNextDayIds } from '@/utils/calendar';
import { getUserProgramProgressAsync, getProgramAsync, getMultipleProgramDaysAsync, getProgramDayAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { selectWorkoutQuote, selectWorkoutQuoteState, selectRestDayQuote, selectRestDayQuoteState, selectQuoteError } from '@/store/quotes/selectors';

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigation = useNavigation();

    const dispatch = useDispatch<AppDispatch>();

    const workoutQuote = useSelector(selectWorkoutQuote);
    const workoutQuoteState = useSelector(selectWorkoutQuoteState);
    const restDayQuote = useSelector(selectRestDayQuote);
    const restDayQuoteState = useSelector(selectRestDayQuoteState);
    const quoteError = useSelector(selectQuoteError);

    const {
        userProgramProgress,
        userProgramProgressState,
        programs,
        programsState,
        programDays,
        programDaysState,
        error: programError,
    } = useSelector((state: RootState) => state.programs);

    // Get the active program from the normalized state
    const activeProgram = userProgramProgress?.ProgramId ? programs[userProgramProgress?.ProgramId] : null;
    const activeProgramState = userProgramProgress?.ProgramId ? programsState[userProgramProgress?.ProgramId] : REQUEST_STATE.IDLE;
    // Get the current day from the normalized state
    const activeProgramCurrentDay = userProgramProgress?.ProgramId ? programDays[userProgramProgress?.ProgramId]?.[userProgramProgress?.CurrentDay] : null;
    const activeProgramCurrentDayState = userProgramProgress?.ProgramId
        ? programDaysState[userProgramProgress?.ProgramId]?.[userProgramProgress?.CurrentDay]
        : REQUEST_STATE.IDLE;

    const activeProgramNextDayIds =
        userProgramProgress?.CurrentDay && activeProgram?.Days ? getNextDayIds(userProgramProgress.CurrentDay, activeProgram.Days, 3) : null;

    // Get the next days from the normalized state
    const activeProgramNextDays =
        userProgramProgress?.ProgramId && activeProgramNextDayIds
            ? activeProgramNextDayIds.map((dayId) => programDays[userProgramProgress?.ProgramId]?.[dayId]).filter((day) => day !== undefined)
            : [];
    const activeProgramNextDaysStates =
        userProgramProgress?.ProgramId && activeProgramNextDayIds
            ? activeProgramNextDayIds.map((dayId) => programDaysState[userProgramProgress?.ProgramId]?.[dayId])
            : [];
    const areNextDaysLoaded = activeProgramNextDaysStates.every((state) => state === REQUEST_STATE.FULFILLED);

    useEffect(() => {
        // Fetch quotes
        dispatch(getWorkoutQuoteAsync());
        dispatch(getRestDayQuoteAsync());
    }, [dispatch]);

    useEffect(() => {
        // Once user program progress is available, fetch the active program data
        if (userProgramProgressState === REQUEST_STATE.FULFILLED && userProgramProgress) {
            dispatch(getProgramAsync({ programId: userProgramProgress.ProgramId }));
            dispatch(getProgramDayAsync({ programId: userProgramProgress.ProgramId, dayId: userProgramProgress.CurrentDay }));
        }
    }, [userProgramProgress, userProgramProgressState, dispatch]);

    useEffect(() => {
        // Once active program is fetched, get next days
        if (activeProgramState === REQUEST_STATE.FULFILLED) {
            dispatch(getMultipleProgramDaysAsync({ programId: userProgramProgress.ProgramId, dayIds: activeProgramNextDayIds }));
        }
    }, [activeProgram, dispatch]);

    // Show the splash screen while data is loading or splash is visible
    if (
        activeProgramState !== REQUEST_STATE.FULFILLED ||
        userProgramProgressState !== REQUEST_STATE.FULFILLED ||
        activeProgramCurrentDayState !== REQUEST_STATE.FULFILLED ||
        !areNextDaysLoaded ||
        workoutQuoteState !== REQUEST_STATE.FULFILLED ||
        restDayQuoteState !== REQUEST_STATE.FULFILLED
    ) {
        return <BasicSplash />;
    }

    if (programError || quoteError) {
        const errorMessage = programError ? programError : quoteError;
        return (
            <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ThemedText>Error: {errorMessage}</ThemedText>
            </ThemedView>
        );
    }

    const isLastDay = activeProgram && userProgramProgress && activeProgram.Days && Number(userProgramProgress.CurrentDay) === activeProgram.Days;
    const currentDayNumber = parseInt(userProgramProgress?.CurrentDay || '0', 10);
    const currentWeek = getWeekNumber(currentDayNumber);

    // Determine which quote to display
    let displayQuote;
    if (!isLastDay) {
        displayQuote = activeProgramCurrentDay?.RestDay ? restDayQuote : workoutQuote;
    }

    const navigateToProgramCalendar = () => {
        navigation.navigate('programs/program-calendar', {
            programId: activeProgram.ProgramId,
        });
    };

    const navigateToProgramOverview = () => {
        navigation.navigate('programs/program-overview', {
            programId: activeProgram.ProgramId,
        });
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{
                    justifyContent: 'flex-start',
                }}
                showsVerticalScrollIndicator={false}
            >
                {isLastDay ? (
                    <ThemedView style={{ marginHorizontal: Spaces.SM, marginTop: Spaces.XL, marginBottom: Spaces.LG }}>
                        <HighlightedTip iconName='star' tipText='The finish line is here, one last push!' />
                    </ThemedView>
                ) : (
                    <ThemedView style={styles.quoteContainer}>
                        <ThemedText type='italic' style={[styles.quoteText, { color: themeColors.subText }]}>
                            {displayQuote.QuoteText}
                        </ThemedText>
                    </ThemedView>
                )}

                <ThemedView style={styles.planHeader}>
                    <ThemedText type='titleLarge'>{activeProgram?.ProgramName}</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.weekProgress]}>
                    <ThemedText style={[{ color: themeColors.subText }]}>
                        Week {currentWeek} of {activeProgram?.Weeks}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={[styles.activeCardContainer]}>
                    <ActiveProgramDayCard />
                </ThemedView>

                {/* Only render "Up Next" section if there are next days */}
                {activeProgramNextDays.length > 0 && (
                    <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <ThemedText type='title' style={[styles.subHeader, { color: themeColors.text }]}>
                            Up Next
                        </ThemedText>
                        {activeProgramNextDays.map((day) => (
                            <ProgramDayDetailCard key={day.DayId} day={day} />
                        ))}
                    </ThemedView>
                )}

                <ThemedView style={[styles.menuContainer]}>
                    <ThemedView>
                        <TouchableOpacity style={styles.menuItem} activeOpacity={1} onPress={navigateToProgramCalendar}>
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                Program Calendar
                            </ThemedText>
                            <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                        <View
                            style={{
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                        />
                    </ThemedView>
                    <ThemedView>
                        <TouchableOpacity style={styles.menuItem} activeOpacity={1} onPress={navigateToProgramOverview}>
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                Program Overview
                            </ThemedText>
                            <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
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
                            <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
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
                            paddingBottom: Spaces.XXL,
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
        marginTop: Spaces.MD,
        marginBottom: Spaces.MD,
    },
    upNextContainer: {
        paddingTop: Spaces.SM,
        paddingHorizontal: Spaces.LG,
    },
    menuItem: {
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.LG,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quoteContainer: {
        paddingTop: Spaces.XL,
        paddingBottom: Spaces.MD,
        marginHorizontal: Spaces.XXL,
    },
    quoteText: {
        textAlign: 'center',
        paddingBottom: Spaces.SM,
    },
    planHeader: {
        paddingHorizontal: Spaces.LG,
    },
    weekProgress: {
        marginBottom: Spaces.SM,
        paddingHorizontal: Spaces.LG,
    },
    activeCardContainer: {
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XXL,
    },
    menuContainer: {
        paddingHorizontal: Spaces.LG,
        paddingBottom: 0,
        paddingTop: Spaces.MD,
    },
});
