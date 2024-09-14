// components/images/ImageTextOverlay.tsx

import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';

type ImageTextOverlayProps = {
    photo: any;
    title: string;
    subtitle?: string;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    textContainerStyle?: StyleProp<ViewStyle>;
    gradientColors?: string[];
    titleType?: string; // Optional type for title
    subtitleType?: string; // Optional type for subtitle
    placeholder?: any; // Placeholder image while loading
};

export const ImageTextOverlay: React.FC<ImageTextOverlayProps> = ({
    photo,
    title,
    subtitle,
    titleStyle,
    subtitleStyle,
    titleType = 'titleLarge', // Default to 'titleLarge' if not provided
    subtitleType = 'subtitle', // Default to 'subtitle' if not provided
    containerStyle,
    textContainerStyle,
    gradientColors = ['transparent', 'rgba(0,0,0,0.8)'],
    placeholder = '@/assets/images/adaptive-icon.png',
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[containerStyle]}>
            <ThemedView style={styles.imageWrapper}>
                <Image source={photo} style={styles.image} contentFit='cover' cachePolicy='memory-disk' placeholder={placeholder} />
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
        left: spacing.lg,
        right: spacing.lg,
        bottom: spacing.lg,
        zIndex: 3,
        backgroundColor: 'transparent',
    },
    title: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowRadius: sizes.textShadowRadius,
        marginRight: spacing.xxl,
        lineHeight: spacing.xxl,
    },
    subtitle: {
        marginTop: 8,
    },
});
