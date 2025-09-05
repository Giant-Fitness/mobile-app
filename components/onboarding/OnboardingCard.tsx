// components/onboarding/OnboardingCard.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { debounce } from '@/utils/debounce';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface OnboardingCardProps {
    isOnboardingComplete?: boolean;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({ isOnboardingComplete }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Shared value for scale animation (moved from LargeActionTile)
    const scale = useSharedValue(1);

    // Animated style applying scale transform
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Shrink on press in to 95%
    const handlePressIn = () => {
        scale.value = withTiming(0.95, { duration: 100 });
    };

    // Return to normal on press out
    const handlePressOut = () => {
        scale.value = withTiming(1, { duration: 100 });
    };

    const handlePress = () => {
        debounce(router, '/(app)/onboarding/biodata/step-1-gender');
        trigger('soft');
    };

    if (isOnboardingComplete) {
        return null; // No tiles needed
    }

    return (
        <View style={styles.tilesContainer}>
            <ThemedText type='titleLarge' style={styles.tilesTitle}>
                Complete Setup
            </ThemedText>

            <Animated.View
                style={[
                    styles.tileContainer,
                    styles.shadowContainer,
                    animatedStyle,
                    {
                        backgroundColor: themeColors.containerHighlight,
                        padding: Spaces.LG,
                        paddingTop: Spaces.LG + Spaces.MD,
                        marginBottom: Spaces.XL,
                        minHeight: 220,
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={1}
                    style={styles.touchableContainer}
                >
                    <View style={styles.contentContainer}>
                        <ThemedText type='titleXLarge' style={[styles.title, { color: themeColors.highlightContainerText, textAlign: 'center' }]}>
                            Get started
                        </ThemedText>
                        <ThemedText type='body' style={[{ color: themeColors.highlightContainerText, textAlign: 'center' }]}>
                            Share your goals and lifestyle for personalized training and nutrition guidance
                        </ThemedText>
                    </View>
                    <Image
                        source={require('@/assets/images/fist.png')}
                        style={[styles.image, { width: Sizes.imageXSWidth, height: Sizes.imageXSWidth }]}
                        resizeMode='contain'
                    />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    tilesContainer: {},
    tilesTitle: {
        marginBottom: Spaces.MD,
        marginHorizontal: Spaces.LG,
    },
    tileContainer: {
        borderRadius: Spaces.SM,
        overflow: 'visible',
        position: 'relative',
    },
    shadowContainer: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    touchableContainer: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    title: {
        marginBottom: Spaces.SM,
    },
    contentContainer: {
        maxWidth: '80%',
    },
    image: {
        position: 'absolute',
        bottom: -Spaces.XL,
        right: -Spaces.MD,
    },
});
