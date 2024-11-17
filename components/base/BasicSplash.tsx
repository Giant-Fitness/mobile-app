// components/base/BasicSplash.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Animated, Image } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';

type BasicSplashProps = {
    isDataLoaded?: boolean;
    onAnimationComplete?: () => void;
    showLoadingText?: boolean;
};

export const BasicSplash: React.FC<BasicSplashProps> = ({ isDataLoaded = false, onAnimationComplete, showLoadingText = true }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const fadeAnim = new Animated.Value(1);

    useEffect(() => {
        if (isDataLoaded && onAnimationComplete) {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                onAnimationComplete();
            });
        }
    }, [isDataLoaded, onAnimationComplete]);

    return (
        <Animated.View style={[styles.container, { backgroundColor: themeColors.background }, { opacity: fadeAnim }]}>
            <Image source={require('@/assets/images/splash.png')} style={styles.splash} resizeMode='contain' />
            {showLoadingText && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color={themeColors.text} />
                    <ThemedText style={styles.text}>Loading...</ThemedText>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    splash: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        position: 'absolute',
        bottom: 100,
        alignItems: 'center',
    },
    text: {
        marginTop: Spaces.MD,
    },
});
