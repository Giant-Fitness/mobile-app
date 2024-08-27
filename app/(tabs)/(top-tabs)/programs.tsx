// app/(tabs)/(top-tabs)/programs.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProgramDayOverviewCard } from '@/components/programs/ProgramDayOverviewCard';
import { Collapsible } from '@/components/layout/Collapsible';
import { Icon } from '@/components/icons/Icon';

export default function ProgramsScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

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
                        "The only bad workout is the one that didn't happen."
                    </ThemedText>
                </ThemedView>

                <ThemedView style={[styles.activeCardContainer]}>
                    <ActiveProgramDayCard />
                </ThemedView>

                <ThemedView style={[styles.upNextContainer]}>
                    <ThemedText type='titleSmall' style={[styles.subHeader, { color: themeColors.textLight }]}>
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
                        <Icon name='chevron-forward' size={16} color={themeColors.tabIconDefault} />
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
                        <Icon name='chevron-forward' size={16} color={themeColors.tabIconDefault} />
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
                        <Icon name='chevron-forward' size={16} color={themeColors.tabIconDefault} />
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
                        <Icon name='chevron-forward' size={16} color={themeColors.tabIconDefault} />
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
        paddingBottom: 18,
    },
    scrollContainer: {
        width: '100%',
        // borderWidth: 1,
        // borderColor: 'crimson',
    },
    subHeader: {
        marginTop: '5%',
        marginBottom: 16,
        marginLeft: '1%',
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
    activeCardContainer: {},
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
});
