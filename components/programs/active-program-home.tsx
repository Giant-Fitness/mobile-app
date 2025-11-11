// app/programs/active-program-home.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { ProgramDayDetailCard } from '@/components/programs/ProgramDayDetailCard';
import { WorkoutCompletedCard } from '@/components/programs/WorkoutCompletedCard';
import { TrainingQuote } from '@/components/quotes/TrainingQuote';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProgramData } from '@/hooks/useProgramData';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const {
        activeProgram,
        activeProgramNextDays,
        activeProgramCurrentDay,
        isLastDay,
        currentWeek,
        displayQuote,
        displayQuoteIsRestDay,
        hasCompletedWorkoutToday,
        error,
    } = useProgramData(undefined, undefined, {
        fetchAllDays: true,
    });

    if (error) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ThemedText>Error: {error}</ThemedText>
            </ThemedView>
        );
    }

    const navigateTo = (route: 'programs/active-program-progress' | 'programs/browse-programs', params = {}) => {
        debounce(router, { pathname: `/(app)/${route}` as const, params }, 1500);
    };

    const menuItems = [
        {
            title: 'View Progress',
            description: 'Track your journey and celebrate your achievements',
            image: require('@/assets/images/line-chart.png'),
            onPress: () => navigateTo('programs/active-program-progress'),
            backgroundColor: lightenColor(themeColors.tealTransparent, 0.3),
            textColor: darkenColor(themeColors.tealSolid, 0),
            descriptionColor: darkenColor(themeColors.subText, 0.2),
        },
        {
            title: 'Browse Library',
            description: 'Explore our collection of structured training plans',
            image: require('@/assets/images/clipboard.png'),
            onPress: () => navigateTo('programs/browse-programs'),
            backgroundColor: lightenColor(themeColors.purpleTransparent, 0.3),
            textColor: darkenColor(themeColors.purpleSolid, 0),
            descriptionColor: darkenColor(themeColors.subText, 0.2),
        },
    ];

    const renderTodaysWorkoutSection = () => {
        return (
            <View style={styles.todaysWorkoutSection}>
                <View style={styles.header}>
                    <ThemedText type='titleLarge'>{activeProgram?.ProgramName}</ThemedText>
                    <ThemedText style={[{ color: themeColors.subText }]}>
                        Week {currentWeek} of {activeProgram?.Weeks}
                    </ThemedText>
                </View>

                <View style={styles.workoutDayCard}>
                    {hasCompletedWorkoutToday ? (
                        <WorkoutCompletedCard
                            onBrowseSolos={() =>
                                debounce(router, {
                                    pathname: '/(app)/workouts/all-workouts',
                                    params: {
                                        source: 'active-program-home-day-completed-tile',
                                    },
                                })
                            }
                        />
                    ) : (
                        <>
                            <ActiveProgramDayCard source={'active-program-home'} />
                        </>
                    )}
                </View>
            </View>
        );
    };

    const renderUpNextSection = () => {
        // Show up next section in both cases, but with different content
        const upNextDays = hasCompletedWorkoutToday
            ? [activeProgramCurrentDay] // Tomorrow's workout when completed
            : activeProgramNextDays; // Upcoming workouts when not completed

        const sectionTitle = hasCompletedWorkoutToday ? "Tomorrow's Workout" : 'Up Next';

        if (!upNextDays.length || !upNextDays[0]) return null;

        return (
            <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                <ThemedText type='title' style={styles.subHeader}>
                    {sectionTitle}
                </ThemedText>
                {upNextDays
                    .filter((d): d is NonNullable<typeof d> => d != null)
                    .map((day) => (
                        <ProgramDayDetailCard key={day.DayId} day={day} source={'active-program-home'} />
                    ))}
            </ThemedView>
        );
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
                {displayQuote && (
                    <View style={styles.trainingQuoteWrapper}>
                        <TrainingQuote quote={displayQuote} isLastDay={isLastDay} isRestDay={displayQuoteIsRestDay} />
                    </View>
                )}

                {renderTodaysWorkoutSection()}

                {renderUpNextSection()}

                <View style={styles.menuWrapper}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.onPress}
                            style={[
                                styles.menuItem,
                                {
                                    backgroundColor: item.backgroundColor,
                                    borderColor: item.textColor,
                                    borderWidth: StyleSheet.hairlineWidth,
                                },
                            ]}
                            activeOpacity={1}
                        >
                            <View style={styles.menuContentWrapper}>
                                <View style={styles.menuContent}>
                                    <View style={styles.titleContainer}>
                                        <ThemedText type='title' style={[styles.menuTitle, { color: item.textColor }]}>
                                            {item.title}
                                        </ThemedText>
                                        <Icon name='chevron-forward' color={item.textColor} size={18} style={styles.chevron} />
                                    </View>
                                    <ThemedText type='overline' style={[styles.menuDescription, { color: item.descriptionColor }]}>
                                        {item.description}
                                    </ThemedText>
                                </View>
                                <Image
                                    source={item.image}
                                    style={[
                                        styles.menuBackgroundImage,
                                        {
                                            opacity: 0.12,
                                            tintColor: item.textColor,
                                        },
                                    ]}
                                    resizeMode='contain'
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
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
    trainingQuoteWrapper: {
        marginHorizontal: Spaces.MD,
        marginTop: Spaces.MD,
        marginBottom: Spaces.MD,
    },
    header: {
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.SM,
    },
    todaysWorkoutSection: {
        paddingBottom: Spaces.MD,
    },
    workoutDayCard: {
        paddingHorizontal: Spaces.MD,
    },
    subHeader: {
        marginBottom: Spaces.MD,
    },
    upNextContainer: {
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.XL,
        marginBottom: Spaces.XXL,
        marginTop: Spaces.MD,
    },
    activeCardContainer: {
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XXL,
    },
    menuWrapper: {
        marginBottom: Spaces.XL,
    },
    menuItem: {
        borderRadius: Spaces.MD,
        overflow: 'hidden',
        marginBottom: Spaces.LG,
        marginHorizontal: Spaces.LG,
    },
    menuContentWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuContent: {
        padding: Spaces.LG,
        flex: 1,
        zIndex: 1,
    },
    menuDescription: {
        lineHeight: 21,
        fontSize: 13,
        maxWidth: '90%',
    },
    menuBackgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.SM,
        width: 200,
        height: '60%',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: Spaces.XS,
    },
    menuTitle: {
        marginBottom: 0,
    },
    chevron: {
        marginLeft: Spaces.XS,
    },
});
