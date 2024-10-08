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

const MenuItem = ({ icon, text, onPress, color, chevronColor, leftIconColor, backgroundColor }) => (
    <TouchableOpacity style={styles.menuItem} activeOpacity={1} onPress={onPress}>
        <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor }]}>
                <Icon name={icon} size={Sizes.iconSizeMD} color={leftIconColor} />
            </View>
            <ThemedText type='overline' style={[styles.menuText, { color }]}>
                {text}
            </ThemedText>
        </View>
        <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={chevronColor} style={styles.menuChevron} />
    </TouchableOpacity>
);

export default function ActiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();

    const { activeProgram, activeProgramNextDays, dataLoadedState, isLastDay, currentWeek, displayQuote, endProgram, resetProgram, error } = useProgramData(
        undefined,
        undefined,
        { fetchAllDays: true },
    );

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

    const navigateTo = (route, params = {}) => {
        navigation.navigate(route, params);
    };

    const menuItems = [
        { icon: 'auto-graph', text: 'View Progress', onPress: () => navigateTo('programs/active-program-progress') },
        { icon: 'library', text: 'Browse Library', onPress: () => navigateTo('programs/browse-programs') },
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
                {isLastDay ? (
                    <View style={styles.tipContainer}>
                        <HighlightedTip iconName='star' tipText='The finish line is here, one last push!' />
                    </View>
                ) : (
                    displayQuote && (
                        <View style={styles.quoteContainer}>
                            <ThemedText type='italic' style={[styles.quoteText, { color: themeColors.subText }]}>
                                {displayQuote.QuoteText}
                            </ThemedText>
                        </View>
                    )
                )}

                <View style={styles.planHeader}>
                    <ThemedText type='titleLarge'>{activeProgram?.ProgramName}</ThemedText>
                </View>

                <View style={styles.weekProgress}>
                    <ThemedText style={[{ color: themeColors.subText }]}>
                        Week {currentWeek} of {activeProgram?.Weeks}
                    </ThemedText>
                </View>

                <View style={styles.activeCardContainer}>
                    <ActiveProgramDayCard />
                </View>

                {activeProgramNextDays.length > 0 && (
                    <ThemedView style={[styles.upNextContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <ThemedText type='title' style={styles.subHeader}>
                            Up Next
                        </ThemedText>
                        {activeProgramNextDays.map((day) => (
                            <ProgramDayDetailCard key={day.DayId} day={day} />
                        ))}
                    </ThemedView>
                )}

                <View style={styles.menuWrapper}>
                    {menuItems.map((item, index) => (
                        <ThemedView key={index} style={[styles.menuContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                            <MenuItem
                                {...item}
                                color={themeColors.text}
                                chevronColor={themeColors.iconDefault}
                                leftIconColor={themeColors.tipText}
                                backgroundColor={`${themeColors.tipBackground}`}
                            />
                        </ThemedView>
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
    },
    menuItem: {
        paddingVertical: Spaces.LG,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: Spaces.XXL,
        height: Spaces.XXL,
        borderRadius: Spaces.SM,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spaces.MD,
    },
    menuIcon: {
        marginRight: Spaces.SM,
    },
    menuChevron: {
        marginLeft: Spaces.SM,
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
        marginHorizontal: Spaces.LG,
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.MD,
        borderRadius: Spaces.MD,
    },
    tipContainer: {
        marginHorizontal: Spaces.SM,
        marginTop: Spaces.XL,
        marginBottom: Spaces.LG,
    },
    menuWrapper: {
        marginTop: Spaces.XXL,
        marginBottom: Spaces.XL,
    },
});
