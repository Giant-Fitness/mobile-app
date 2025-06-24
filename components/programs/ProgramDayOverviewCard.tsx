// components/programs/ProgramDayOverviewCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ProgramDay, UserProgramProgress } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ProgramDayOverviewCardProps {
    day: ProgramDay;
    onPress: () => void;
    userProgramProgress?: UserProgramProgress;
    isEnrolled: boolean;
}

export const ProgramDayOverviewCard: React.FC<ProgramDayOverviewCardProps> = ({ day, onPress, userProgramProgress, isEnrolled }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    let backgroundColor = themeColors.background;
    let borderColor = themeColors.systemBorderColor;
    let textColor = themeColors.text;
    let displayRest = false;
    if (isEnrolled && userProgramProgress) {
        const dayNumber = parseInt(day.DayId);
        const currentDayNumber = userProgramProgress.CurrentDay;
        const isCompleted = userProgramProgress.CompletedDays?.includes(day.DayId);

        if (isCompleted) {
            backgroundColor = themeColors.tipBackground; // Completed
            textColor = themeColors.subText;
            borderColor = themeColors.backgroundTertiary;
        } else if (dayNumber === currentDayNumber) {
            if (day.RestDay) {
                backgroundColor = themeColors.blueSolid;
            } else {
                backgroundColor = themeColors.accent;
            }
            textColor = themeColors.white;
        } else if (day.RestDay) {
            backgroundColor = themeColors.blueTransparent;
            displayRest = true;
        } else {
            backgroundColor = themeColors.background; // Upcoming
        }
    } else {
        backgroundColor = themeColors.background; // Non-enrolled users
        if (day.RestDay) {
            backgroundColor = themeColors.blueTransparent;
            displayRest = true;
        }
    }

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={1}>
            <ThemedView style={[styles.card, { backgroundColor, borderColor, width: Sizes.dayTile, height: Sizes.dayTileHeight }]}>
                {displayRest ? (
                    <Icon name='power-sleep' color={textColor} />
                ) : (
                    <ThemedText style={[styles.dayNumber, { color: textColor }]}>{day.DayId}</ThemedText>
                )}
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Spaces.XS,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 1,
        borderWidth: StyleSheet.hairlineWidth,
    },
    dayNumber: {},
});
