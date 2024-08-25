// app/(tabs)/(top-tabs)/programs.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import React from 'react';
import ActiveCard from '@/components/programs/ActiveDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import DayOverviewCard from '@/components/programs/DayOverview';
import { Collapsible } from '@/components/Collapsible';

export default function ProgramsScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const dummyDayPlans = [
        { dayId: 1, Week: 3, Day: 3, workoutName: 'Upper Body A', length: '30 mins'},
        { dayId: 2, Week: 3, Day: 4, workoutName: 'Upper Body B', length: '25 mins'},
        { dayId: 3, Week: 3, Day: 5, workoutName: 'Upper Body C', length: '27 mins'},
    ]

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView 
                style={styles.scrollContainer}
                contentContainerStyle={{
                    justifyContent: 'flex-start'
                }}
            >
                <ActiveCard />
                <ThemedText type='titleLarge' style={[styles.subHeader, { color: themeColors.text }]}>
                    Up Next
                </ThemedText>
                <View
                    style={{
                        borderBottomColor: themeColors.subText,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        marginBottom: '7%'
                    }}
                />
                {dummyDayPlans && dummyDayPlans.map((plan, i) => (
                    <DayOverviewCard 
                        key={plan.dayId} 
                        week={plan.Week}
                        day={plan.Day}
                        workout={plan.workoutName}
                        length={plan.length}
                    />
                ))}
                <ThemedView>
                    <Collapsible title='Program Calendar'></Collapsible>
                    <ThemedView style={[styles.divider, { backgroundColor: themeColors.containerBorderColor }]} />
                </ThemedView>
                <ThemedView>
                    <Collapsible title='Program Overview'></Collapsible>
                    <ThemedView style={[styles.divider, { backgroundColor: themeColors.containerBorderColor }]} />
                </ThemedView>
                <ThemedView>
                    <Collapsible title='Browse Programs'></Collapsible>
                    <ThemedView style={[styles.divider, { backgroundColor: themeColors.containerBorderColor }]} />
                </ThemedView>
                <ThemedView>
                    <Collapsible title='End Program'></Collapsible>
                    <ThemedView style={[styles.divider, { backgroundColor: themeColors.containerBorderColor }]} />
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
        paddingHorizontal: '5%',
        paddingTop: '5%',
    },
    scrollContainer: {
        width: '100%',
        // borderWidth: 1,
        // borderColor: 'crimson',
    },
    subHeader: {
        marginTop: '5%',
        marginBottom: '3%',
        marginLeft: '1%',
    },
    divider: {
        height: 0.7,
        width: '10%',
        alignSelf: 'center',
    }
});
