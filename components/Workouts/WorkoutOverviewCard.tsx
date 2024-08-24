// components/Workouts/WorkoutOverviewCard.tsx

import React from 'react';
import { StyleSheet, Image, ImageSourcePropType, TouchableOpacity, ImageBackground } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type WorkoutOverviewCardProps = {
    name: string;
    length: string;
    photo: ImageSourcePropType;
    intensity: string;
    equipment: string;
    focus: string;
    trainer: string;
};

export const WorkoutOverviewCard: React.FC<WorkoutOverviewCardProps> = ({ name, length, level, equipment, focus, photo, trainer }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    // Function to determine the level icons
    const renderLevelIcon = (level) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return <MaterialCommunityIcons name='chevron-up' size={14} color={themeColors.background} />;
            case 'intermediate':
                return <MaterialCommunityIcons name='chevron-double-up' size={14} color={themeColors.background} />;
            case 'advanced':
                return <MaterialCommunityIcons name='chevron-triple-up' size={14} color={themeColors.background} />;
            default:
                return null; // No icon for undefined intensity levels
        }
    };
    return (
        <ThemedView style={styles.cardContainer}>
            <ImageBackground source={photo} style={styles.image}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']} // Adjust the colors and opacity as needed
                    style={styles.gradientOverlay}
                >
                    <ThemedText type='titleSmall' style={[styles.title, { color: themeColors.background }]}>
                        {name}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[styles.attributes, { color: themeColors.background }]}>
                        {length}, {level}
                    </ThemedText>
                </LinearGradient>
            </ImageBackground>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 250,
        height: 300,
        overflow: 'hidden',
        borderRadius: 2,
        marginHorizontal: 3,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    image: {
        flex: 1,
    },
    gradientOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
        paddingLeft: 24,
    },
    title: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
    },
    attributes: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
    },
    attributeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        background: 'none',
    },
});
