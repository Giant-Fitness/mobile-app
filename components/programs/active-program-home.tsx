// app/programs/active-program-home.tsx

import React from 'react';
import { ScrollView, StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProgramDayDetailCard } from '@/components/programs/ProgramDayDetailCard';
import { TrainingQuote } from '@/components/quotes/TrainingQuote';
import { Spaces } from '@/constants/Spaces';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { useProgramData } from '@/hooks/useProgramData';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { Icon } from '@/components/base/Icon';
import { WorkoutCompletedSection } from './WorkoutCompletedSection';
import { router } from 'expo-router';
import { debounce } from '@/utils/debounce';

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const {
        userProgramProgress,
        activeProgram,
        activeProgramNextDays,
        activeProgramCurrentDay,
        dataLoadedState,
        isLastDay,
        currentWeek,
        displayQuote,
        hasCompletedWorkoutToday,
        error,
    } = useProgramData(undefined, undefined, {
        fetchAllDays: true,
    });

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState,
    });

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={dataLoadedState === REQUEST_STATE.FULFILLED} />;
    }

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

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{
                    justifyContent: 'flex-start',
                }}
                showsVerticalScrollIndicator={false}
            >
                {displayQuote && <TrainingQuote quote={displayQuote} isLastDay={isLastDay} />}

                {hasCompletedWorkoutToday ? (
                    <>
                        <WorkoutCompletedSection onBrowseSolos={() => debounce(router, '/(app)/workouts/all-workouts')} />
                        <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary, marginTop: Spaces.MD }]}>
                            <ThemedText type='title' style={styles.subHeader}>
                                Tomorrow&apos;s Workout
                            </ThemedText>
                            {activeProgramCurrentDay && (
                                <ProgramDayDetailCard key={userProgramProgress?.CurrentDay} day={activeProgramCurrentDay} source={'active-program-home'} />
                            )}
                        </ThemedView>
                    </>
                ) : (
                    <>
                        <View style={styles.planHeader}>
                            <ThemedText type='titleLarge'>{activeProgram?.ProgramName}</ThemedText>
                        </View>
                        <View style={styles.weekProgress}>
                            <ThemedText style={[{ color: themeColors.subText }]}>
                                Week {currentWeek} of {activeProgram?.Weeks}
                            </ThemedText>
                        </View>
                        <View style={styles.activeCardContainer}>
                            <ActiveProgramDayCard source={'active-program-home'} />
                        </View>

                        {activeProgramNextDays.length > 0 && (
                            <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                                <ThemedText type='title' style={styles.subHeader}>
                                    Up Next
                                </ThemedText>
                                {activeProgramNextDays.map((day) => (
                                    <ProgramDayDetailCard key={day.DayId} day={day} source={'active-program-home'} />
                                ))}
                            </ThemedView>
                        )}
                    </>
                )}

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
                            activeOpacity={0.7}
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
    subHeader: {
        marginBottom: Spaces.MD,
    },
    upNextContainer: {
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.XL,
        marginBottom: Spaces.XXL,
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
