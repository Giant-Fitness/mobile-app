import React from 'react';
import { StyleSheet, View, Text, Image, ImageSourcePropType, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

type WorkoutCardProps = {
    name: string;
    length: string;
    photo: ImageSourcePropType;
    intensity: string;
    onPress: () => void;
};

const WorkoutCard: React.FC<WorkoutCardProps> = ({ name, length, intensity, onPress, photo }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <ThemedView style={[styles.cardContent, { backgroundColor: themeColors.cardBackground }]}>
                <Image source={photo} style={styles.image} />
                <ThemedView style={[styles.textContainer, { backgroundColor: themeColors.cardBackground }]}>
                    <ThemedText type='subtitle' style={styles.text}>
                        {name}
                    </ThemedText>
                    <ThemedText type='default'>{length}</ThemedText>
                    <ThemedText type='default'>{intensity}</ThemedText>
                </ThemedView>
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
    },
    cardContent: {
        flexDirection: 'row', // Ensure children are aligned horizontally
        alignItems: 'center', // Center align items vertically
        padding: 8,
        flex: 1, // Make the card expand to fill its container
    },
    image: {
        width: 100, // Adjust size as needed
        height: 100, // Adjust size as needed
        borderRadius: 8,
        marginRight: 16, // Space between image and text
    },
    textContainer: {
        flexDirection: 'column',
        gap: 8,
    },
    text: {
        flexShrink: 1,
        flexWrap: 'wrap',
    },
});

export default WorkoutCard;
