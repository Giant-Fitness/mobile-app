// components/workouts/WorkoutDetailedCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { LeftImageInfoCard } from '@/components/media/LeftImageInfoCard';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Workout } from '@/types';
import { debounce } from '@/utils/debounce';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleSheet } from 'react-native';

import { router } from 'expo-router';

type WorkoutDetailedCardProps = {
    workout: Workout;
    source: 'spotlight' | 'library' | 'recommended' | 'recent' | 'popular';
};

export const WorkoutDetailedCard: React.FC<WorkoutDetailedCardProps> = ({ workout, source }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigateToWorkoutDetails = () => {
        debounce(router, {
            pathname: '/(app)/workouts/workout-details',
            params: {
                workoutId: workout.WorkoutId,
                source,
            },
        });
    };

    const levelIcon = 'level-' + workout.Level.toLowerCase();

    return (
        <LeftImageInfoCard
            image={{ uri: workout.PhotoUrl }}
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
                            {workout.WorkoutCategory}
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
