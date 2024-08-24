// components/Workouts/WorkoutDetailedCard.tsx

import React from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

type WorkoutDetailedCardProps = {
    name: string;
    length: string;
    photo: ImageSourcePropType;
    intensity: string;
    equipment: string;
    focus: string;
    trainer: string;
};

export const WorkoutDetailedCard: React.FC<WorkoutDetailedCardProps> = ({ name, length, level, equipment, focus, photo, trainer }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();

    const navigateToWorkoutDetails = () => {
        navigation.navigate('workout-details', { name, length, level, equipment, focus, photo, trainer });
    };

    // Function to determine the level icons
    const renderLevelIcon = (level) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return <MaterialCommunityIcons name='chevron-up' size={14} color={themeColors.textLight} />;
            case 'intermediate':
                return <MaterialCommunityIcons name='chevron-double-up' size={14} color={themeColors.textLight} />;
            case 'advanced':
                return <MaterialCommunityIcons name='chevron-triple-up' size={14} color={themeColors.textLight} />;
            default:
                return null; // No icon for undefined intensity levels
        }
    };

    return (
        <TouchableOpacity onPress={navigateToWorkoutDetails} style={styles.card}>
            <ThemedView style={[styles.cardContent, { backgroundColor: themeColors.background }]}>
                <Image source={photo} style={styles.image} />
                <ThemedView style={styles.textContainer}>
                    <ThemedText type='bodyMedium' style={[styles.workoutName, { color: themeColors.text }]}>
                        {name}
                    </ThemedText>
                    {/*                    <ThemedText type='caption' style={[styles.trainer, { color: themeColors.textLight }]}>
                        With {trainer}
                    </ThemedText>*/}
                    <ThemedView style={styles.attributeGrid}>
                        <ThemedView style={styles.attributeRow}>
                            <ThemedView style={styles.attribute}>
                                <MaterialCommunityIcons name='yoga' size={14} color={themeColors.textLight} />
                                <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
                                    {focus}
                                </ThemedText>
                            </ThemedView>
                            <ThemedView style={[styles.attribute, { paddingLeft: 10 }]}>
                                {renderLevelIcon(level)}
                                <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight, marginLeft: 4 }]}>
                                    {level}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView style={styles.attributeRow}>
                            <ThemedView style={styles.attribute}>
                                <MaterialCommunityIcons name='dumbbell' size={14} color={themeColors.textLight} />
                                <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
                                    {equipment}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView style={styles.attributeRow}>
                            <ThemedView style={styles.attribute}>
                                <Ionicons name='stopwatch-outline' size={14} color={themeColors.textLight} />
                                <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
                                    {length}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3, // For Android shadow
    },
    cardContent: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'flex-start', // Align items to the top of the container
    },
    image: {
        marginTop: 6,
        width: 120,
        height: 120,
        borderRadius: 8,
        marginRight: 16,
    },
    textContainer: {
        flex: 1, // Take up remaining space
        flexDirection: 'column',
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attributeText: {
        marginLeft: 5,
        lineHeight: 22, // Reduced line height for tighter text wrapping
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    attributeGrid: {
        flex: 1, // Take up all available space left by the title
    },
    trainer: {
        paddingBottom: 6,
    },
    workoutName: {
        marginTop: 2,
        marginRight: 16, // Add right margin to ensure there's space on the right
        lineHeight: 20, // Reduced line height for tighter text wrapping
        paddingBottom: 4,
    },
});
