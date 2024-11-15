// components/media/ImageTextOverlay.tsx

import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image, ImageContentFit } from 'expo-image';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

type ImageTextOverlayProps = {
    image: any;
    title?: string;
    subtitle?: string;
    imageContentFit?: ImageContentFit;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    textContainerStyle?: StyleProp<ViewStyle>;
    gradientColors?: string[];
    titleType?: ThemedTextProps['type'];
    subtitleType?: ThemedTextProps['type'];
    placeholder?: any; // Placeholder image while loading
};

export const ImageTextOverlay: React.FC<ImageTextOverlayProps> = ({
    image,
    title,
    subtitle,
    titleStyle,
    subtitleStyle,
    imageContentFit = 'cover',
    titleType = 'titleLarge', // Default to 'titleLarge' if not provided
    subtitleType = 'subtitle', // Default to 'subtitle' if not provided
    containerStyle,
    textContainerStyle,
    gradientColors = ['transparent', 'rgba(0,0,0,0.8)'],
    placeholder = '@/assets/images/logo.png',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[containerStyle]}>
            <ThemedView style={styles.imageWrapper}>
                <Image source={image} style={styles.image} contentFit={imageContentFit} cachePolicy='memory-disk' placeholder={placeholder} />
                <LinearGradient colors={gradientColors} style={styles.gradientOverlay} />
                <ThemedView style={[styles.textContainer, textContainerStyle]}>
                    <ThemedText type={titleType} style={[styles.title, titleStyle, { color: themeColors.white }]}>
                        {title}
                    </ThemedText>
                    {subtitle && (
                        <ThemedText type={subtitleType} style={[styles.subtitle, subtitleStyle, { color: themeColors.white }]}>
                            {subtitle}
                        </ThemedText>
                    )}
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    imageWrapper: {
        flex: 1,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject, // Ensures the gradient covers the entire image
        zIndex: 2,
    },
    textContainer: {
        position: 'absolute',
        left: Spaces.LG,
        right: Spaces.LG,
        bottom: Spaces.LG,
        zIndex: 3,
        backgroundColor: 'transparent',
    },
    title: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowRadius: Sizes.textShadowRadius,
        marginRight: Spaces.XXL,
        lineHeight: Spaces.XXL,
    },
    subtitle: {
        marginTop: 8,
    },
});
