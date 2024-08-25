// components/workouts/WorkoutDetailedCard.tsx

import React from 'react';
import { StyleSheet, ImageSourcePropType } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LevelIcon } from '@/components/icons/LevelIcon';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';

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

    return (
        <LeftImageInfoCard
            image={photo}
            title={name}
            containerStyle={{ paddingBottom: 24 }}
            onPress={navigateToWorkoutDetails}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <MaterialCommunityIcons name='yoga' size={14} color={themeColors.textLight} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
                            {focus}
                        </ThemedText>
                        <LevelIcon level={level} size={14} color={themeColors.textLight} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
                            {level}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <MaterialCommunityIcons name='dumbbell' size={14} color={themeColors.textLight} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
                            {equipment}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <Ionicons name='stopwatch-outline' size={14} color={themeColors.textLight} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
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
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    attributeText: {
        marginLeft: 4,
        lineHeight: 14, // Ensures the text is aligned with the icon
    },
});
