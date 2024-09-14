// components/programs/ActiveDayCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TopImageInfoCard } from '@/components/layout/TopImageInfoCard';
import { Icon } from '@/components/icons/Icon';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { ProgramDay } from '@/store/types';
import { useNavigation } from '@react-navigation/native';

type ActiveProgramDayCardProps = {
    day: ProgramDay;
};

export const ActiveProgramDayCard: React.FC<ActiveProgramDayCardProps> = ({ day }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigation = useNavigation();

    const navigateToProgramDay = () => {
        navigation.navigate('programs/program-day', {
            day: day,
        });
    };

    return (
        <View style={styles.shadowContainer}>
            <TopImageInfoCard
                image={{ uri: day.PhotoUrl }}
                title={day.WorkoutDayTitle}
                subtitle={`Week ${day.Week} Day ${day.Day}`}
                onPress={navigateToProgramDay}
                extraContent={
                    day.RestDay ? (
                        // Display content specific to a rest day
                        <ThemedView style={[styles.attributeRow, { marginLeft: 0, marginTop: -spacing.xxs }]}>
                            <Icon name='bed' size={moderateScale(18)} color={themeColors.highlightContainerText} />
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.highlightContainerText} style={styles.chevronIcon} />
                        </ThemedView>
                    ) : (
                        // Display content specific to a workout day
                        <ThemedView style={styles.attributeRow}>
                            <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.highlightContainerText} />
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, paddingRight: spacing.md }]}>
                                {`${day.Time} mins`}
                            </ThemedText>
                            <Icon name='kettlebell' size={moderateScale(14)} color={themeColors.highlightContainerText} />
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, marginLeft: spacing.xs }]}>
                                {day.EquipmentCategory}
                            </ThemedText>
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.highlightContainerText} style={styles.chevronIcon} />
                        </ThemedView>
                    )
                }
                titleStyle={{ color: themeColors.highlightContainerText }}
                subtitleStyle={{ color: themeColors.subTextSecondary }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: 'rgba(0,80,0,0.4)', // Use a more standard shadow color
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
        borderRadius: spacing.sm, // Match the child border radius
        marginRight: spacing.md,
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        backgroundColor: 'transparent',
    },
    attributeText: {
        marginLeft: spacing.xs,
        fontSize: moderateScale(13),
        lineHeight: spacing.md, // Ensures the text is aligned with the icon
    },
    chevronIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
});
