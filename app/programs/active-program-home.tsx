// app/programs/active-program-home.tsx

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActiveProgramDayCard } from '@/components/programs/ActiveProgramDayCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ProgramDayDetailCard } from '@/components/programs/ProgramDayDetailCard';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { HighlightedTip } from '@/components/alerts/HighlightedTip';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { useProgramData } from '@/hooks/useProgramData';
import { EndProgramModal } from '@/components/programs/EndProgramModal';

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();
    const [isEndProgramModalVisible, setIsEndProgramModalVisible] = useState(false);

    const {
        userProgramProgress,
        activeProgram,
        activeProgramNextDays,
        dataLoadedState,
        isLastDay,
        currentWeek,
        displayQuote,
        endProgram,
        resetProgram,
        error,
    } = useProgramData(undefined, undefined, { fetchAllDays: true });

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

    const navigateToBrowsePrograms = () => {
        navigation.navigate('programs/browse-programs');
    };

    const handleEndProgramConfirm = () => {
        endProgram();
        setIsEndProgramModalVisible(false);
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
                    displayQuote && (
                        <ThemedView style={styles.quoteContainer}>
                            <ThemedText type='italic' style={[styles.quoteText, { color: themeColors.subText }]}>
                                {displayQuote.QuoteText}
                            </ThemedText>
                        </ThemedView>
                    )
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
                    {[
                        { title: 'Program Calendar', onPress: navigateToProgramCalendar },
                        { title: 'Program Overview', onPress: navigateToProgramOverview },
                        { title: 'Browse Programs', onPress: navigateToBrowsePrograms },
                        { title: 'Reset Program', onPress: resetProgram },
                        { title: 'End Program', onPress: () => setIsEndProgramModalVisible(true) },
                    ].map((item, index) => (
                        <ThemedView key={item.title}>
                            <TouchableOpacity style={styles.menuItem} activeOpacity={1} onPress={item.onPress}>
                                <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                    {item.title}
                                </ThemedText>
                                <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
                            </TouchableOpacity>
                            {index < 4 && (
                                <View
                                    style={{
                                        borderBottomColor: themeColors.systemBorderColor,
                                        borderBottomWidth: StyleSheet.hairlineWidth,
                                    }}
                                />
                            )}
                        </ThemedView>
                    ))}
                </ThemedView>
            </ScrollView>

            <EndProgramModal visible={isEndProgramModalVisible} onClose={() => setIsEndProgramModalVisible(false)} onConfirm={handleEndProgramConfirm} />
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
