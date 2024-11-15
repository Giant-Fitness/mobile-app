// components/programs/WorkoutCompletedSection.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LargeActionTile } from '@/components/home/LargeActionTile';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

interface WorkoutCompletedSectionProps {
    onBrowseSolos: () => void;
}

const COMPLETION_MESSAGES = [
    'Keep Crushing It! 💥',
    'Strong Finish! 💪',
    'Well Done, You! 🏋️',
    'Workout Complete! 🏆',
    'Another Day, Another Victory! 🎉',
    'Great Work Today! 🥇',
];

const ACTION_TITLES = ['Ready for More?', 'Want to Keep Going?', 'Push Your Limits?', 'Take It Up a Notch?', 'Challenge Yourself?', 'Level Up Your Day?'];

const IMAGES = [require('@/assets/images/logo.png'), require('@/assets/images/boxing-glove.png'), require('@/assets/images/dumbbell-sketch.png')];

export const WorkoutCompletedSection = ({ onBrowseSolos }: WorkoutCompletedSectionProps) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { headerMessage, actionTitle, image } = useMemo(() => {
        const headerIndex = Math.floor(Math.random() * COMPLETION_MESSAGES.length);
        const titleIndex = Math.floor(Math.random() * ACTION_TITLES.length);
        const imageIndex = Math.floor(Math.random() * IMAGES.length);

        return {
            headerMessage: COMPLETION_MESSAGES[headerIndex],
            actionTitle: ACTION_TITLES[titleIndex],
            image: IMAGES[imageIndex],
        };
    }, []); // Empty dependency array means this only runs once when component mounts

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type='titleLarge'>{headerMessage}</ThemedText>
            </View>

            <LargeActionTile
                title={actionTitle}
                description='Explore solo workouts to supplement your training'
                onPress={onBrowseSolos}
                backgroundColor={themeColors.containerHighlight}
                textColor={themeColors.highlightContainerText}
                image={image}
                titleSize='title'
                bodySize='bodySmall'
                containerStyle={{
                    paddingTop: Spaces.LG,
                    paddingHorizontal: 0,
                    minHeight: 160,
                }}
                imageSize={Sizes.imageXSHeight}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: Spaces.XS,
    },
    header: {
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.MD,
    },
});
