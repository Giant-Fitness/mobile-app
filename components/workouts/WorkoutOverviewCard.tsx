// components/workouts/WorkoutOverviewCard.tsx

import React from 'react';
import { StyleSheet, ImageSourcePropType, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity onPress={navigateToWorkoutDetails} style={styles.cardContainer} activeOpacity={1}>
            <ImageTextOverlay
                image={photo}
                title={name}
                subtitle={`${length}, ${level}`}
                gradientColors={['transparent', 'rgba(0,0,0,0.6)']}
                containerStyle={{ height: '100%', elevation: 5 }}
                textContainerStyle={{ bottom: spacing.lg }}
                subtitleType='bodySmall'
                titleType='title'
                titleStyle={{ marginRight: spacing.xl, lineHeight: moderateScale(20) }}
                subtitleStyle={{ marginTop: 0 }}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: sizes.imageXLargeWidth,
        height: sizes.imageXLargeHeight,
        overflow: 'hidden',
        borderRadius: spacing.xxs,
        marginHorizontal: spacing.xxs,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: spacing.xxs },
        shadowOpacity: 0.3,
        shadowRadius: spacing.xs,
    },
});
