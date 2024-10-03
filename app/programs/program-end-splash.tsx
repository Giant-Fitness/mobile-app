// app/programs/program-end-splash.tsx

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const motivationalTexts = [
    'Every end is a new beginning',
    "You've got this, keep going",
    'Change is growth in disguise',
    'Your journey is just starting',
    'Embrace the challenge ahead',
];

export default function ProgramEndSplashScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();
    const router = useRouter();

    const slideAnim = useRef(new Animated.Value(50)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace('/(tabs)/home');
        }, 3000); // Changed back to 3 seconds (3000ms)
        return () => clearTimeout(timer);
    }, [router]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [slideAnim, fadeAnim]);

    const randomText = motivationalTexts[Math.floor(Math.random() * motivationalTexts.length)];

    return (
        <View style={[styles.container, { backgroundColor: themeColors.accent }]}>
            <Animated.View
                style={[
                    styles.textContainer,
                    {
                        transform: [{ translateY: slideAnim }],
                        opacity: fadeAnim,
                    },
                ]}
            >
                <ThemedText type='headline' style={styles.text}>
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
        paddingRight: Spaces.XXL * 2, // Increased right padding
    },
    text: {
        textAlign: 'left',
    },
});
