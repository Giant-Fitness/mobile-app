// components/workouts/WorkoutOverviewCard.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { moderateScale } from '@/utils/scaling';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { Workout } from '@/types';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { debounce } from '@/utils/debounce';

type WorkoutOverviewCardProps = {
    workout: Workout;
};

export const WorkoutOverviewCard: React.FC<WorkoutOverviewCardProps> = ({ workout }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigateToWorkoutDetails = () => {
        debounce(router, {
            pathname: '/(app)/workouts/workout-details',
            params: {
                workoutId: workout.WorkoutId,
            },
        });
    };

    return (
        <TouchableOpacity onPress={navigateToWorkoutDetails} activeOpacity={1}>
            {/* Outer container with background color for shadow */}
            <View style={[styles.shadowContainer, { backgroundColor: themeColors.background }]}>
                <View style={styles.cardContainer}>
                    <ImageTextOverlay
                        image={workout.PhotoUrl}
                        title={workout.WorkoutName}
                        subtitle={`${workout.Time} mins, ${workout.Level}`}
                        gradientColors={['transparent', 'rgba(0,0,0,0.65)']}
                        containerStyle={styles.imageContainer}
                        textContainerStyle={styles.textContainer}
                        subtitleType='bodySmall'
                        titleType='title'
                        titleStyle={styles.titleStyle}
                        subtitleStyle={styles.subtitleStyle}
                    />
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        borderRadius: Spaces.SM,
        marginRight: Spaces.MD,
        // iOS shadow
        shadowColor: 'rgba(0,80,0,0.25)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        // Android shadow
        elevation: 5,
    },
    cardContainer: {
        width: Sizes.imageXXLWidth,
        height: Sizes.imageXXLHeight,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
    },
    imageContainer: {
        height: '100%',
    },
    textContainer: {
        bottom: Spaces.LG,
    },
    titleStyle: {
        marginRight: Spaces.LG,
        lineHeight: moderateScale(20),
    },
    subtitleStyle: {
        marginTop: Spaces.XS,
    },
});

export default WorkoutOverviewCard;
