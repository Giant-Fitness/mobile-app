// components/home/LargeActionTile.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

interface LargeActionTileProps {
    title: string;
    titleSize?: ThemedTextProps['type'];
    bodySize?: ThemedTextProps['type'];
    description: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    image: ImageSourcePropType;
    imageSize?: number;
    containerStyle?: ViewStyle;
}

// Create an animated version of TouchableOpacity using Reanimated
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const LargeActionTile = ({
    title,
    description,
    onPress,
    backgroundColor,
    textColor,
    image,
    titleSize = 'titleXLarge',
    bodySize = 'body',
    containerStyle,
    imageSize = Sizes.imageSM,
}: LargeActionTileProps) => {
    // Shared value for scale animation
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

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            style={[
                styles.container,
                animatedStyle,
                {
                    backgroundColor,
                    padding: Spaces.LG,
                    paddingTop: Spaces.LG + Spaces.MD,
                    marginHorizontal: Spaces.LG,
                    marginBottom: Spaces.XL,
                },
                containerStyle,
            ]}
        >
            <View style={styles.contentContainer}>
                <ThemedText type={titleSize} style={[styles.title, { color: textColor, textAlign: 'center' }]}>
                    {title}
                </ThemedText>
                <ThemedText type={bodySize} style={[{ color: textColor, textAlign: 'center' }]}>
                    {description}
                </ThemedText>
            </View>
            <Image source={image} style={[styles.image, { width: imageSize, height: imageSize }]} resizeMode='contain' />
        </AnimatedTouchable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Spaces.MD,
        alignItems: 'center',
        overflow: 'visible',
        minHeight: 200,
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
        right: Spaces.SM,
    },
});
