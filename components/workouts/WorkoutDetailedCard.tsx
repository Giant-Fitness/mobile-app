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
        navigation.navigate('workout-details', { name, length, level, equipment, focus, photo, trainer, longText, focusMulti });
    };

    const levelIcon = 'level-' + level.toLowerCase();

    return (
        <LeftImageInfoCard
            image={photo}
            title={name}
            titleStyle={{ fontSize: 14 }}
            containerStyle={{ paddingBottom: 24 }}
            onPress={navigateToWorkoutDetails}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='yoga' size={14} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, paddingRight: 10 }]}>
                            {focus}
                        </ThemedText>
                        <Icon name={levelIcon} size={14} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText, marginLeft: 2 }]}>
                            {level}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='dumbbell' size={14} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.subText }]}>
                            {equipment}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Icon name='stopwatch' size={14} />
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
        marginTop: 8,
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    attributeText: {
        marginLeft: 5,
        lineHeight: 14, // Ensures the text is aligned with the icon
    },
});
