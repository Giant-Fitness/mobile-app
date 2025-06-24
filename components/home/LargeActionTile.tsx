// components/home/LargeActionTile.tsx

import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
        <Animated.View
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
            <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1} style={styles.touchableContainer}>
                <View style={styles.contentContainer}>
                    <ThemedText type={titleSize} style={[styles.title, { color: textColor, textAlign: 'center' }]}>
                        {title}
                    </ThemedText>
                    <ThemedText type={bodySize} style={[{ color: textColor, textAlign: 'center' }]}>
                        {description}
                    </ThemedText>
                </View>
                <Image source={image} style={[styles.image, { width: imageSize, height: imageSize }]} resizeMode='contain' />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Spaces.MD,
        overflow: 'visible',
        minHeight: 200,
        position: 'relative',
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
        right: Spaces.SM,
    },
});
