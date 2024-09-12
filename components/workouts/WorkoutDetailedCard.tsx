// components/workouts/WorkoutDetailedCard.tsx

import React from 'react';
import { StyleSheet, ImageSourcePropType } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';
import { Icon } from '@/components/icons/Icon';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

type WorkoutDetailedCardProps = {
    name: string;
    length: string;
    photo: ImageSourcePropType;
    level: string;
    equipment: string;
    focus: string;
    trainer: string;
    longText: string;
    focusMulti: string[];
};

export const WorkoutDetailedCard: React.FC<WorkoutDetailedCardProps> = ({ name, length, level, equipment, focus, photo, trainer, longText, focusMulti }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();

    const navigateToWorkoutDetails = () => {
        navigation.navigate('workouts/workout-detail-page', { name, length, level, equipment, focus, photo, trainer, longText, focusMulti });
    };

    const levelIcon = 'level-' + level.toLowerCase();

    return (
        <LeftImageInfoCard
            image={photo}
            title={name}
            titleStyle={{ fontSize: moderateScale(14) }}
            containerStyle={{ paddingBottom: spacing.lg }}
            onPress={navigateToWorkoutDetails}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='yoga' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, paddingRight: scale(10) }]}>
                            {focus}
                        </ThemedText>
                        <Icon name={levelIcon} size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, marginLeft: spacing.xxs }]}>
                            {level}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='dumbbell' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText }]}>
                            {equipment}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText }]}>
                            {length}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            }
        />
    );
};

const styles = StyleSheet.create({
    attributeContainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        marginTop: spacing.sm,
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        backgroundColor: 'transparent',
    },
    attributeText: {
        marginLeft: spacing.xs,
        lineHeight: spacing.md, // Ensures the text is aligned with the icon
    },
});
