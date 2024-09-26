import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import LottieView from 'lottie-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SplashScreenProps {
    onAnimationComplete: () => void;
    isDataLoaded: boolean;
}

export const DumbbellSplash: React.FC<SplashScreenProps> = ({ onAnimationComplete, isDataLoaded }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const animation = useRef<LottieView | null>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [startTime] = useState(Date.now());
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (animation.current) {
            animation.current.play();
        }
    }, []);

    useEffect(() => {
        const minDuration = 1800; // Minimum duration in milliseconds
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        if (isDataLoaded && !isExiting) {
            setIsExiting(true);

            const remainingTime = Math.max(0, minDuration - elapsedTime);

            setTimeout(() => {
                // Start exit animation
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    Animated.parallel([
                        Animated.timing(scaleAnim, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(fadeAnim, {
                            toValue: 0,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        onAnimationComplete();
                    });
                });
            }, remainingTime);
        }
    }, [isDataLoaded, startTime, scaleAnim, fadeAnim, onAnimationComplete, isExiting]);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <Animated.View
                style={[
                    styles.lottieContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <LottieView ref={animation} source={require('@/assets/splash/dumbbell2.json')} style={styles.lottie} autoPlay={false} loop={true} />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lottieContainer: {
        width: 200,
        height: 200,
    },
    lottie: {
        width: '100%',
        height: '100%',
    },
});
