// components/workouts/WorkoutOverviewCard.tsx

import React from 'react';
import { StyleSheet, ImageSourcePropType, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ImageTextOverlay } from '@/components/images/ImageTextOverlay';
import { moderateScale } from '@/utils/scaling';
import { sizes } from '@/utils/sizes';
import { spacing } from '@/utils/spacing';

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
        navigation.navigate('workouts/workout-detail-page', {
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
                    textContainerStyle={{ bottom: spacing.lg }}
                    subtitleType='bodySmall'
                    titleType='title'
                    titleStyle={{ marginRight: spacing.xl, lineHeight: moderateScale(20) }}
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
        borderRadius: spacing.sm, // Match the child border radius
        marginRight: spacing.md,
    },
    cardContainer: {
        width: sizes.imageXLargeWidth,
        height: sizes.imageXLargeHeight,
        overflow: 'hidden',
        borderRadius: spacing.sm,
        // Remove shadow properties from here
    },
});
