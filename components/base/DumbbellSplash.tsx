// components/base/DumbbellSplash.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';

interface SplashScreenProps {
    onAnimationComplete?: () => void;
    isDataLoaded: boolean;
    showLoadingText?: boolean;
    loadingText?: string;
}

export const DumbbellSplash: React.FC<SplashScreenProps> = ({
    onAnimationComplete = () => {},
    isDataLoaded,
    showLoadingText = false,
    loadingText = 'Loading...',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const animation = useRef<LottieView | null>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const loadingFadeAnim = useRef(new Animated.Value(0)).current;
    const [startTime] = useState(Date.now());
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (animation.current) {
            animation.current.play();
        }

        // Animate loading text in if enabled
        if (showLoadingText) {
            setTimeout(() => {
                Animated.timing(loadingFadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }).start();
            }, 800); // Delay to let the dumbbell animation establish itself
        }
    }, [showLoadingText]);

    useEffect(() => {
        const minDuration = 1800; // Minimum duration in milliseconds
        const currentTime = Date.now();
        const elapsedTime = currentTime - startTime;

        if (isDataLoaded && !isExiting) {
            setIsExiting(true);

            const remainingTime = Math.max(0, minDuration - elapsedTime);

            setTimeout(() => {
                // Fade out loading text first if showing
                const loadingFadeOutPromise = showLoadingText
                    ? new Promise<void>((resolve) => {
                          Animated.timing(loadingFadeAnim, {
                              toValue: 0,
                              duration: 200,
                              useNativeDriver: true,
                          }).start(() => resolve());
                      })
                    : Promise.resolve();

                loadingFadeOutPromise.then(() => {
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
                });
            }, remainingTime);
        }
    }, [isDataLoaded, startTime, scaleAnim, fadeAnim, loadingFadeAnim, onAnimationComplete, isExiting, showLoadingText]);

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
                <LottieView ref={animation} source={require('@/assets/animations/dumbbell.json')} style={styles.lottie} autoPlay={false} loop={true} />
            </Animated.View>

            {showLoadingText && (
                <Animated.View
                    style={[
                        styles.loadingContainer,
                        {
                            opacity: loadingFadeAnim,
                        },
                    ]}
                >
                    <ActivityIndicator size='small' color={themeColors.subText} />
                    <ThemedText style={[styles.loadingText, { color: themeColors.subText }]}>{loadingText}</ThemedText>
                </Animated.View>
            )}
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
    loadingContainer: {
        position: 'absolute',
        bottom: '25%',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spaces.SM,
        fontSize: 16,
        fontWeight: '500',
    },
});
