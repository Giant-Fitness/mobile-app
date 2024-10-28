// components/buttons/SlideUpActionButton.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, useDerivedValue, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Spaces } from '@/constants/Spaces';

type SlideUpActionButtonProps = {
    children: React.ReactNode;
    scrollY: Animated.SharedValue<number>;
    slideUpThreshold?: number;
};

export const SlideUpActionButton: React.FC<SlideUpActionButtonProps> = ({ children, scrollY, slideUpThreshold = 100 }) => {
    const hasAppeared = useSharedValue(false);

    const derivedTranslateY = useDerivedValue(() => {
        if (scrollY.value >= slideUpThreshold && !hasAppeared.value) {
            hasAppeared.value = true;
        }

        return hasAppeared.value ? withTiming(0, { duration: 300 }) : withTiming(100, { duration: 300 });
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: derivedTranslateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <LinearGradient colors={['rgba(255,255,255,0)', 'rgba(0,0,0,0.5)']} style={styles.gradient}>
                <Animated.View style={styles.buttonContainer}>{children}</Animated.View>
            </LinearGradient>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    gradient: {
        width: '100%',
        paddingVertical: Spaces.LG,
        paddingHorizontal: Spaces.SM,
    },
    buttonContainer: {
        width: '90%',
        alignSelf: 'center',
        paddingBottom: Spaces.SM,
    },
});

export default SlideUpActionButton;
