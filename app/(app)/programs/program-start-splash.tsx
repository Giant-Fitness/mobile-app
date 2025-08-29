// app/(app)/programs/program-start-splash.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useRef } from 'react';
import { Animated, StyleSheet, Vibration, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useFocusEffect } from '@react-navigation/native';

const motivationalTexts = [
    'Your journey begins',
    'Rise to the challenge',
    'Embrace the grind',
    'Make it happen',
    'Push your limits',
    'Commit to greatness',
    'Start strong, finish stronger',
    'Today is day one',
];

export default function ProgramStartSplashScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const router = useRouter();
    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const randomTextRef = useRef('');

    useFocusEffect(
        React.useCallback(() => {
            // Reset animation values
            slideAnim.setValue(50);
            fadeAnim.setValue(0);

            // Choose a new random text
            randomTextRef.current = motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)];

            // Start animation
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]).start();

            Vibration.vibrate(400);

            // Set up navigation timer
            const timer = setTimeout(() => {
                router.push('/(app)/(tabs)/(training-tabs)/programs');
            }, 3000);

            // Clean up function
            return () => clearTimeout(timer);
        }, [slideAnim, fadeAnim, router]),
    );

    const randomText = motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)];

    return (
        <View style={[styles.container, { backgroundColor: themeColors.splashBackgroud }]}>
            <Animated.View
                style={[
                    styles.textContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <ThemedText type='headlineLarge' style={[styles.text, { color: themeColors.white }]}>
                    {randomText}
                </ThemedText>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    textContainer: {
        paddingTop: Sizes.bottomSpaceLarge,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: Spaces.XL,
        paddingRight: Spaces.XXL * 2,
    },
    text: {
        textAlign: 'left',
    },
});
