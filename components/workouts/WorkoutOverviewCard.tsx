// components/workouts/WorkoutOverviewCard.tsx

import React from 'react';
import { StyleSheet, ImageSourcePropType, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { moderateScale } from '@/utils/scaling';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { Workout } from '@/types';

type WorkoutOverviewCardProps = {
    workout: Workout;
};

export const WorkoutOverviewCard: React.FC<WorkoutOverviewCardProps> = ({ workout }) => {
    const navigation = useNavigation();

    const navigateToWorkoutDetails = () => {
        navigation.navigate('workouts/workout-details', {
            workoutId: workout.WorkoutId,
        });
    };

    return (
        <View style={styles.shadowContainer}>
            <TouchableOpacity onPress={navigateToWorkoutDetails} style={styles.cardContainer} activeOpacity={1}>
                <ImageTextOverlay
                    image={workout.PhotoUrl}
                    title={workout.WorkoutName}
                    subtitle={`${workout.Time} mins, ${workout.Level}`}
                    gradientColors={['transparent', 'rgba(0,0,0,0.65)']}
                    containerStyle={{ height: '100%' }}
                    textContainerStyle={{ bottom: Spaces.LG }}
                    subtitleType='bodySmall'
                    titleType='title'
                    titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20) }}
                    subtitleStyle={{ marginTop: Spaces.XS }}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: 'rgba(0,80,0,0.25)', // Use a more standard shadow color
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
        borderRadius: Spaces.SM, // Match the child border radius
        marginRight: Spaces.MD,
    },
    cardContainer: {
        width: Sizes.imageXXLWidth,
        height: Sizes.imageXXLHeight,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
        // Remove shadow properties from here
    },
});
