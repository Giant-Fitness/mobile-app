// app/(tabs)/(top-tabs)/programs.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import React from 'react';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProgramDayOverviewCard } from '@/components/programs/ProgramDayOverviewCard';
import { Collapsible } from '@/components/layout/Collapsible';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '@/components/programs/ProgressBar';

export default function ProgramsScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const screenWidth = Dimensions.get('window').width;

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
                    <ThemedText type='italic' style={[styles.quoteText, { color: themeColors.textLight }]}>
                        The only bad workout is the one that didn't happen.
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.planHeader}>
                    <ThemedText type='titleLarge'>Lean Machine Challenge</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.weekProgress]}>
                    <ProgressBar completedParts={2} currentPart={3} parts={6} containerWidth={screenWidth - 48} />
                    <ThemedText style={[{ color: themeColors.textLight, marginTop: 12 }]}>Current Week: 3 of 6</ThemedText>
                </ThemedView>

                <ThemedView style={[styles.activeCardContainer]}>
                    <ActiveProgramDayCard />
                </ThemedView>

                <ThemedView style={[styles.upNextContainer]}>
                    <ThemedText type='title' style={[styles.subHeader, { color: themeColors.textLight }]}>
                        Up Next...
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
                <View
                    style={{
                        borderBottomColor: themeColors.containerBorderColor,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                />
                <ThemedView>
                    <TouchableOpacity style={styles.menuItem}>
                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                            Program Calendar
                        </ThemedText>
                        <Ionicons name={'chevron-forward-outline'} size={16} color={themeColors.tabIconDefault} />
                    </TouchableOpacity>
                    <View
                        style={{
                            borderBottomColor: themeColors.containerBorderColor,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                </ThemedView>
                <ThemedView>
                    <TouchableOpacity style={styles.menuItem}>
                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                            Program Overview
                        </ThemedText>
                        <Ionicons name={'chevron-forward-outline'} size={16} color={themeColors.tabIconDefault} />
                    </TouchableOpacity>
                    <View
                        style={{
                            borderBottomColor: themeColors.containerBorderColor,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                </ThemedView>
                <ThemedView>
                    <TouchableOpacity style={styles.menuItem}>
                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                            Browse Programs
                        </ThemedText>
                        <Ionicons name={'chevron-forward-outline'} size={16} color={themeColors.tabIconDefault} />
                    </TouchableOpacity>
                    <View
                        style={{
                            borderBottomColor: themeColors.containerBorderColor,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
                </ThemedView>
                <ThemedView
                    style={{
                        paddingBottom: 48,
                    }}
                >
                    <TouchableOpacity style={styles.menuItem}>
                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                            End Program
                        </ThemedText>
                        <Ionicons name={'chevron-forward-outline'} size={16} color={themeColors.tabIconDefault} />
                    </TouchableOpacity>
                    <View
                        style={{
                            borderBottomColor: themeColors.containerBorderColor,
                            borderBottomWidth: StyleSheet.hairlineWidth,
                        }}
                    />
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
        paddingHorizontal: 24,
    },
    scrollContainer: {
        width: '100%',
    },
    subHeader: {
        marginTop: 18,
        marginBottom: 16,
    },
    divider: {
        height: 0.7,
        width: '100%',
        alignSelf: 'center',
    },
    upNextContainer: {
        paddingTop: 24,
        paddingBottom: 16,
    },
    menuItem: {
        paddingTop: 24,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    quoteContainer: {
        paddingTop: 42,
        paddingBottom: 24,
        paddingHorizontal: 16,
    },
    quoteText: {
        textAlign: 'center',
    },
    planHeader: {
        marginBottom: 12,
    },
    weekProgress: {
        marginBottom: 24,
    },
});
