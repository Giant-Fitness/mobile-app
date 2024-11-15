// app/(app)/programs/program-complete.tsx

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { router, useLocalSearchParams } from 'expo-router';

export default function ProgramCompleteScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const { programId } = useLocalSearchParams<{ programId: string }>();

    const mainMessageOpacity = useRef(new Animated.Value(0)).current;
    const journeyMessageOpacity = useRef(new Animated.Value(0)).current;
    const fabOpacity = useRef(new Animated.Value(0)).current;
    const lottieRef = useRef<LottieView>(null);

    useEffect(() => {
        // Start the animation sequence
        const animationSequence = async () => {
            // Main message fade in
            Animated.timing(mainMessageOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }).start();

            // Start Lottie animation
            lottieRef.current?.play();

            // Journey message fade in after delay
            const journeyTimer = setTimeout(() => {
                Animated.timing(journeyMessageOpacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            }, 2000);

            // Show FAB after all animations
            const fabTimer = setTimeout(() => {
                Animated.timing(fabOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            }, 3500);

            return { journeyTimer, fabTimer };
        };

        // Start animation sequence
        const timers = animationSequence();

        // Cleanup function
        return () => {
            // Clean up animation timers
            timers.then(({ journeyTimer, fabTimer }) => {
                clearTimeout(journeyTimer);
                clearTimeout(fabTimer);
            });
        };
    }, [mainMessageOpacity, journeyMessageOpacity, fabOpacity]);

    const handleContinue = () => {
        router.replace({
            pathname: '/(app)/programs/program-complete-feedback',
            params: { programId },
        });
    };

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <LottieView ref={lottieRef} source={require('@/assets/animations/celebration.json')} style={styles.lottieAnimation} loop={true} autoPlay={true} />
            <LottieView ref={lottieRef} source={require('@/assets/animations/confetti.json')} autoPlay={true} loop={false} style={StyleSheet.absoluteFill} />
            <View style={styles.contentContainer}>
                <Animated.View style={[styles.textContainer, { opacity: mainMessageOpacity }]}>
                    <ThemedText type='titleXLarge' style={[styles.text, { color: themeColors.text }]}>
                        Congrats! You&apos;ve Completed Your Program!
                    </ThemedText>
                </Animated.View>

                <Animated.View style={[styles.textContainer, { opacity: journeyMessageOpacity }]}>
                    <ThemedText type='subtitle' style={[styles.journeyText, { color: themeColors.text }]}>
                        This is a milestone, not the finish line. Keep pushing forward and leveling up your fitness!
                    </ThemedText>
                </Animated.View>
            </View>
            <Animated.View style={[styles.fabContainer, { opacity: fabOpacity }]}>
                <PrimaryButton text='Continue' onPress={handleContinue} size='LG' style={styles.fab} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        marginTop: -Sizes.bottomSpaceLarge - Sizes.bottomSpaceLarge,
    },
    lottieAnimation: {
        width: '90%',
        height: '50%',
        alignSelf: 'center',
    },
    textContainer: {
        paddingHorizontal: Spaces.XL,
        marginBottom: Spaces.MD,
    },
    text: {
        textAlign: 'left',
    },
    journeyText: {
        textAlign: 'left',
        opacity: 0.7,
    },
    fabContainer: {
        position: 'absolute',
        bottom: Spaces.XL,
        width: '80%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    fab: {
        marginHorizontal: Spaces.LG,
        width: '100%',
    },
});
