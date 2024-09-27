// components/workouts/WorkoutDetailedCard.tsx

import React from 'react';
import { StyleSheet, ImageSourcePropType } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { LeftImageInfoCard } from '@/components/media/LeftImageInfoCard';
import { Icon } from '@/components/base/Icon';
import { scale, moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Workout } from '@/types';

type WorkoutDetailedCardProps = {
    workout: Workout;
};

export const WorkoutDetailedCard: React.FC<WorkoutDetailedCardProps> = ({ workout }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigation = useNavigation();

    const navigateToWorkoutDetails = () => {
        navigation.navigate('workouts/workout-details', {
            workoutId: workout.WorkoutId,
        });
    };

    const levelIcon = 'level-' + workout.Level.toLowerCase();

    return (
        <LeftImageInfoCard
            image={workout.PhotoUrl}
            title={workout.WorkoutName}
            titleStyle={{ fontSize: moderateScale(14) }}
            containerStyle={{ paddingBottom: Spaces.LG }}
            contentContainerStyle={{ marginLeft: Spaces.SM + Spaces.XS }}
            onPress={navigateToWorkoutDetails}
            imageStyle={{ width: Sizes.imageMDHeight, height: Sizes.imageMDWidth }}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, paddingRight: Spaces.SM }]}>
                            {workout.Time} mins
                        </ThemedText>

                        <Icon name={levelIcon} size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, marginLeft: Spaces.XXS }]}>
                            {workout.Level}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='kettlebell' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText }]}>
                            {workout.EquipmentCategory}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='yoga' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, paddingRight: Spaces.SM }]}>
                            {workout.WorkoutType}
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
        marginTop: Spaces.XS,
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spaces.XS,
        backgroundColor: 'transparent',
    },
    attributeText: {
        marginLeft: Spaces.XXS,
        lineHeight: Spaces.MD,
    },
});
