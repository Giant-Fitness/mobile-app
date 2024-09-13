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
import { getCurrentDayAsync, getActiveProgramMetaAsync, getUserPlanProgressAsync, getNextDaysAsync } from '@/store/programs/thunks';
import { getWorkoutQuoteAsync, getRestDayQuoteAsync } from '@/store/quotes/thunks';
import { BasicSplash } from '@/components/splashScreens/BasicSplash';
import { REQUEST_STATE } from '@/store/utils';

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors
    const screenWidth = Dimensions.get('window').width;

    const dispatch = useDispatch<AppDispatch>();

    const [isSplashVisible, setIsSplashVisible] = useState(true);

    const {
        currentDay,
        currentDayState,
        activeProgram,
        activeProgramState,
        userPlanProgress,
        userPlanProgressState,
        nextDays,
        nextDaysState,
        error: programError,
    } = useSelector((state: RootState) => state.programs);

    const { workoutQuote, workoutQuoteState, restDayQuote, restDayQuoteState, error: quoteError } = useSelector((state: RootState) => state.quotes);

    useEffect(() => {
        dispatch(getCurrentDayAsync());
        dispatch(getActiveProgramMetaAsync());
        dispatch(getUserPlanProgressAsync());
        dispatch(getWorkoutQuoteAsync());
        dispatch(getRestDayQuoteAsync());
    }, [dispatch]);

    useEffect(() => {
        // Once user progress is available, fetch the next 3 days starting from CurrentDay + 1
        if (userPlanProgressState === REQUEST_STATE.FULFILLED && userPlanProgress) {
            dispatch(getNextDaysAsync({ planId: userPlanProgress.WorkoutPlanId, currentDayId: userPlanProgress.CurrentDay, numDays: 3 }));
        }
    }, [userPlanProgress, userPlanProgressState, dispatch]);

    const handleLoadingComplete = () => {
        setIsSplashVisible(false);
    };

    // Show the splash screen while either state is not fulfilled or splash is visible
    if (
        isSplashVisible ||
        currentDayState !== REQUEST_STATE.FULFILLED ||
        activeProgramState !== REQUEST_STATE.FULFILLED ||
        userPlanProgressState !== REQUEST_STATE.FULFILLED ||
        nextDaysState !== REQUEST_STATE.FULFILLED ||
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
    const displayQuote = currentDay?.RestDay ? restDayQuote : workoutQuote;

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
                    <ThemedText type='italic' style={[styles.quoteText, { color: themeColors.subText }]}>
                        {displayQuote.QuoteText}
                    </ThemedText>
                </ThemedView>
                <ThemedView style={styles.planHeader}>
                    <ThemedText type='titleLarge'>{activeProgram.WorkoutPlanName}</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.weekProgress]}>
                    <ThemedText style={[{ color: themeColors.subText }]}>
                        Week {userPlanProgress.Week} of {activeProgram.ProgramLength}
                    </ThemedText>
                    {/*                    <ProgressBar
                        completedParts={Number(userPlanProgress.Week) - 1}
                        currentPart={Number(userPlanProgress.Week)}
                        parts={Number(activeProgram.ProgramLength)}
                        containerWidth={screenWidth - spacing.xxl}
                    />*/}
                </ThemedView>

                <ThemedView style={[styles.activeCardContainer]}>
                    <ActiveProgramDayCard day={currentDay} />
                </ThemedView>

                <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <ThemedText type='title' style={[styles.subHeader, { color: themeColors.text }]}>
                        Up Next
                    </ThemedText>
                    {nextDays && nextDays.map((day, i) => <ProgramDayOverviewCard key={day.WorkoutDayId} day={day} />)}
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
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.iconDefault} />
                        </TouchableOpacity>
                        <View
                            style={{
                                borderBottomColor: themeColors.systemBorderColor,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                            }}
                        />
                    </ThemedView>
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        width: '100%',
    },
    subHeader: {
        marginTop: spacing.md,
        marginBottom: spacing.md,
    },
    divider: {
        height: verticalScale(0.7),
        width: '100%',
        alignSelf: 'center',
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
        paddingBottom: spacing.md,
        paddingTop: spacing.md,
    },
});
