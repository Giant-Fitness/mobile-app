// components/programs/ActiveDayCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TopImageInfoCard } from '@/components/layout/TopImageInfoCard';
import { Icon } from '@/components/icons/Icon';

type ActiveProgramDayCardProps = {};

export const ActiveProgramDayCard: React.FC<ActiveProgramDayCardProps> = ({}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TopImageInfoCard
            image={{ uri: 'https://picsum.photos/id/177/700' }}
            title='Full Body Blast'
            subtitle='Week 3 Day 2'
            extraContent={
                <ThemedView style={styles.attributeRow}>
                    <Icon name='stopwatch' size={14} color={themeColors.highlightContainerText} />
                    <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, paddingRight: 16 }]}>
                        40 mins
                    </ThemedText>
                    <Icon name='dumbbell' size={14} color={themeColors.highlightContainerText} />
                    <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, marginLeft: 5 }]}>
                        Full Gym
                    </ThemedText>
                    <Icon name='chevron-forward' size={16} color={themeColors.highlightContainerText} style={styles.chevronIcon} />
                </ThemedView>
            }
            titleStyle={{ color: themeColors.highlightContainerText }}
            subtitleStyle={{ color: themeColors.subTextSecondary }}
        />
    );
};

const styles = StyleSheet.create({
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    attributeText: {
        marginLeft: 5,
        fontSize: 13,
        lineHeight: 16, // Ensures the text is aligned with the icon
    },
    chevronIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
});
