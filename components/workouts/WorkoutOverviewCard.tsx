// components/workouts/WorkoutOverviewCard.tsx

import React from 'react';
import { StyleSheet, ImageSourcePropType, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { moderateScale } from '@/utils/scaling';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';

type WorkoutOverviewCardProps = {
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

export const WorkoutOverviewCard: React.FC<WorkoutOverviewCardProps> = ({ name, length, level, equipment, focus, photo, trainer, longText, focusMulti }) => {
    const navigation = useNavigation();

    const navigateToWorkoutDetails = () => {
        navigation.navigate('workouts/workout-details', {
            name,
            length,
            level,
            equipment,
            focus,
            photo,
            trainer,
            longText,
            focusMulti,
        });
    };

    return (
        <View style={styles.shadowContainer}>
            <TouchableOpacity onPress={navigateToWorkoutDetails} style={styles.cardContainer} activeOpacity={1}>
                <ImageTextOverlay
                    image={photo}
                    title={name}
                    subtitle={`${length}, ${level}`}
                    gradientColors={['transparent', 'rgba(0,0,0,0.7)']}
                    containerStyle={{ height: '100%' }}
                    textContainerStyle={{ bottom: Spaces.LG }}
                    subtitleType='bodySmall'
                    titleType='title'
                    titleStyle={{ marginRight: Spaces.XL, lineHeight: moderateScale(20) }}
                    subtitleStyle={{ marginTop: 0 }}
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
        width: Sizes.imageXLWidth,
        height: Sizes.imageXLHeight,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
        // Remove shadow properties from here
    },
});
