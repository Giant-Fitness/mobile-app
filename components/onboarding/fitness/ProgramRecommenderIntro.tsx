// components/onboarding/fitness/ProgramRecommenderIntro.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { TextButton } from '@/components/buttons/TextButton';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import motivationalImage from '@/assets/images/stretching.svg';

type ProgramRecommenderIntroProps = {
    onStart: () => void;
};

export const ProgramRecommenderIntro: React.FC<ProgramRecommenderIntroProps> = ({ onStart }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ImageTextOverlay
                image={motivationalImage}
                containerStyle={styles.motivationalImage}
                titleType='titleLarge'
                gradientColors={['transparent', 'transparent']}
            />
            <View style={styles.contentContainer}>
                <ThemedText type='title' style={styles.title}>
                    Find the Best Plan for Your Fitness Journey
                </ThemedText>
                <ThemedText type='body' style={styles.description}>
                    Answer a few simple questions, and we'll match you with a workout plan that fits your goals and lifestyle.
                </ThemedText>

                <ThemedText type='body' style={styles.description}>
                    You always have the option to select a different plan if you prefer.
                </ThemedText>
            </View>

            <TextButton
                text="Let's Go"
                onPress={onStart}
                style={[styles.startButton, { backgroundColor: themeColors.buttonPrimary }]}
                textStyle={{ color: themeColors.buttonPrimaryText }}
                size='LG'
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Spaces.XXXL,
        paddingHorizontal: Spaces.MD,
    },
    title: {
        textAlign: 'left',
        marginTop: Spaces.XXL,
        marginBottom: Spaces.LG,
    },
    contentContainer: {
        justifyContent: 'center',
        marginHorizontal: Spaces.MD,
    },
    description: {
        marginBottom: Spaces.MD,
        textAlign: 'left',
    },
    startButton: {
        bottom: Spaces.XL,
        alignSelf: 'center',
        width: '90%',
        position: 'absolute',
    },
    motivationalImage: {
        height: '33%',
        width: '100%',
    },
});
