// components/workouts/WorkoutOverviewCard.tsx

import React from 'react';
import { StyleSheet, Image, ImageSourcePropType, TouchableOpacity, ImageBackground } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { ImageTextOverlay } from '@/components/images/ImageTextOverlay';

type WorkoutOverviewCardProps = {
    name: string;
    length: string;
    photo: ImageSourcePropType;
    intensity: string;
    equipment: string;
    focus: string;
    trainer: string;
    longText: string;
    focusMulti: array;
};

export const WorkoutOverviewCard: React.FC<WorkoutOverviewCardProps> = ({ name, length, level, equipment, focus, photo, trainer, longText, focusMulti }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();

    const navigateToWorkoutDetails = () => {
        navigation.navigate('workouts/workout-details', { name, length, level, equipment, focus, photo, trainer, longText, focusMulti });
    };

    return (
        <TouchableOpacity onPress={navigateToWorkoutDetails} style={styles.cardContainer} activeOpacity={1}>
            <ImageTextOverlay
                photo={photo}
                title={name}
                subtitle={length + ', ' + level}
                gradientColors={['transparent', 'rgba(0,0,0,0.6)']}
                containerStyle={{ height: '100%', elevation: 5 }}
                textContainerStyle={{ bottom: 24 }}
                subtitleType='bodySmall'
                titleType='title'
                titleStyle={{ marginRight: 40, lineHeight: 20 }}
                subtitleStyle={{ marginTop: 0 }}
            />
        </TouchableOpacity>
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
});
