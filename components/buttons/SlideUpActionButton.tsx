// components/buttons/SlideUpActionButton.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, useDerivedValue, withTiming, SharedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Spaces } from '@/constants/Spaces';

type SlideUpActionButtonProps = {
    children: React.ReactNode;
    scrollY: SharedValue<number>;
    slideUpThreshold?: number;
    contentHeight?: SharedValue<number>;
    screenHeight?: SharedValue<number>;
    bottomProximity?: number;
    hideOnScrollUp?: boolean;
};

export const SlideUpActionButton: React.FC<SlideUpActionButtonProps> = ({
    children,
    scrollY,
    slideUpThreshold = 100,
    contentHeight,
    screenHeight,
    bottomProximity = 300, // Show when within 300px of bottom
    hideOnScrollUp = false,
}) => {
    const hasAppeared = useSharedValue(false);
    const lastScrollY = useSharedValue(0);
    const isScrollingUp = useSharedValue(false);

    const derivedTranslateY = useDerivedValue(() => {
        // Track scroll direction
        const currentScrollY = scrollY.value;
        const deltaY = currentScrollY - lastScrollY.value;

        // Only update scroll direction for significant scrolls and when not overscrolling
        const maxScroll = contentHeight && screenHeight ? Math.max(0, contentHeight.value - screenHeight.value) : 0;
        const isOverscrolling = currentScrollY > maxScroll || currentScrollY < 0;

        if (Math.abs(deltaY) > 5 && !isOverscrolling) {
            isScrollingUp.value = deltaY < 0;
        }
        lastScrollY.value = currentScrollY;

        let shouldShow = false;

        if (contentHeight && screenHeight) {
            // Bottom proximity mode: show when near bottom of content
            const isAtOrPastBottom = currentScrollY >= maxScroll - bottomProximity;

            if (hideOnScrollUp) {
                // Show when near bottom AND not scrolling up (only if we have valid heights)
                // Always show if we're at or past the bottom (including overscroll)
                shouldShow = maxScroll > 0 && isAtOrPastBottom && (!isScrollingUp.value || isOverscrolling) && currentScrollY > 100;
            } else {
                // Show when near bottom regardless of scroll direction (only if we have valid heights)
                shouldShow = maxScroll > 0 && isAtOrPastBottom && currentScrollY > 100;
            }
        } else {
            // Fixed threshold mode (original behavior)
            if (hideOnScrollUp) {
                shouldShow = currentScrollY >= slideUpThreshold && !isScrollingUp.value;
            } else {
                shouldShow = currentScrollY >= slideUpThreshold;
            }
        }

        if (shouldShow && !hasAppeared.value) {
            hasAppeared.value = true;
        } else if (!shouldShow && hasAppeared.value && hideOnScrollUp) {
            hasAppeared.value = false;
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
