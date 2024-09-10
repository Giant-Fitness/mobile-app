// app/programs/active-program-home.tsx

import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProgramDayOverviewCard } from '@/components/programs/ProgramDayOverviewCard';
import { Collapsible } from '@/components/layout/Collapsible';
import ProgressBar from '@/components/programs/ProgressBar';
import { Icon } from '@/components/icons/Icon';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getCurrentAndNextDaysAsync } from '@/store/programs/thunks';

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const screenWidth = Dimensions.get('window').width;

    const dispatch = useDispatch<AppDispatch>();

    const { currentAndNextDays, currentAndNextDaysState, error } = useSelector((state: RootState) => state.programs);

    useEffect(() => {
        // Dispatch the thunk to fetch the current and next days
        dispatch(getCurrentAndNextDaysAsync());
    }, [dispatch]);

    // console.log(currentAndNextDays, currentAndNextDaysState);

    const dummyDayPlans = [
        { dayId: 1, Week: 3, Day: 3, workoutName: 'Upper Body A', length: '30 mins', photo: require('@/assets/images/vb.webp') },
        { dayId: 2, Week: 3, Day: 4, workoutName: 'Upper Body B', length: '25 mins', photo: require('@/assets/images/vb.webp') },
        { dayId: 3, Week: 3, Day: 5, workoutName: 'Upper Body C', length: '27 mins', photo: require('@/assets/images/vb.webp') },
    ];

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
                        The only bad workout is the one that didn&apos;t happen.
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.planHeader}>
                    <ThemedText type='titleXLarge'>Lean Machine Challenge</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.weekProgress]}>
                    <ProgressBar completedParts={2} currentPart={3} parts={6} containerWidth={screenWidth - spacing.xxl} />
                    <ThemedText style={[{ color: themeColors.subText, marginTop: spacing.md }]}>Week 3 of 6</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.activeCardContainer]}>
                    <ActiveProgramDayCard />
                </ThemedView>

                <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <ThemedText type='title' style={[styles.subHeader, { color: themeColors.text }]}>
                        Up Next
                    </ThemedText>
                    {dummyDayPlans &&
                        dummyDayPlans.map((plan, i) => (
                            <ProgramDayOverviewCard
                                key={plan.dayId}
                                week={plan.Week}
                                day={plan.Day}
                                workout={plan.workoutName}
                                length={plan.length}
                                photo={plan.photo}
                            />
                        ))}
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
        paddingBottom: 0,
        paddingHorizontal: spacing.lg,
    },
    menuItem: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quoteContainer: {
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        marginHorizontal: spacing.xxl,
    },
    quoteText: {
        textAlign: 'center',
        paddingBottom: spacing.sm,
    },
    planHeader: {
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    weekProgress: {
        marginBottom: spacing.md,
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
