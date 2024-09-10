// components/programs/ProgramDayOverviewCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';
import { ProgramDay } from '@/store/types';

type ProgramDayOverviewCardProps = {
    day: ProgramDay;
};

export const ProgramDayOverviewCard: React.FC<ProgramDayOverviewCardProps> = ({ day }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const navigation = useNavigation();

    const navigateToProgramDay = () => {
        navigation.navigate('programs/program-day', {
            workout: day.WorkoutDayTitle,
            week: day.Week,
            day: day.Day,
            length: day.Time,
        });
    };

    return (
        <LeftImageInfoCard
            image={{ uri: day.PhotoUrl }}
            onPress={navigateToProgramDay}
            title={day.WorkoutDayTitle}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.text }]}>
                            {`Week ${day.Week} Day ${day.Day}`}
                        </ThemedText>
                    </ThemedView>

                    {day.RestDay ? (
                        // Display content for a rest day
                        <ThemedView style={styles.contentContainer}>
                            <ThemedView style={styles.attributeRow}>
                                <Icon name='bed' size={moderateScale(16)} color={themeColors.subText} />
                            </ThemedView>

                            <ThemedView style={styles.attributeRow}>
                                <ThemedText
                                    type='bodySmall'
                                    style={[styles.attributeText, { color: themeColors.subText, marginLeft: 0, marginTop: spacing.xs }]}
                                >
                                    {day.Notes}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    ) : (
                        // Display content for a workout day
                        <ThemedView style={styles.attributeRow}>
                            <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.text} />
                            <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                {`${day.Time} mins`}
                            </ThemedText>
                        </ThemedView>
                    )}
                </ThemedView>
            }
            containerStyle={styles.container}
            titleStyle={[styles.title, { color: themeColors.text }]}
            extraContentStyle={styles.contentContainer}
            imageStyle={styles.image}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: '100%',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: moderateScale(14),
        marginBottom: 0,
        marginLeft: spacing.xs,
        marginTop: spacing.xs,
    },
    image: {
        height: sizes.imageMediumHeight,
        width: sizes.imageMediumWidth,
        borderRadius: spacing.xxs,
    },
    contentContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    attributeText: {
        marginLeft: spacing.xs,
        lineHeight: spacing.md,
        backgroundColor: 'transparent',
    },
    attributeContainer: {
        marginTop: spacing.xxs,
        backgroundColor: 'transparent',
    },
});
