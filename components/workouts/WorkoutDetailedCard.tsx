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
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

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
            containerStyle={{ paddingBottom: Spaces.LG }}
            contentContainerStyle={{ marginLeft: Spaces.SM + Spaces.XS }}
            onPress={navigateToWorkoutDetails}
            imageStyle={{ width: Sizes.imageMDHeight, height: Sizes.imageMDWidth }}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, paddingRight: Spaces.SM }]}>
                            {length}
                        </ThemedText>

                        <Icon name={levelIcon} size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, marginLeft: Spaces.XXS }]}>
                            {level}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='kettlebell' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText }]}>
                            {equipment}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='yoga' size={moderateScale(14)} color={themeColors.iconDefault} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, paddingRight: Spaces.SM }]}>
                            {focus}
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
