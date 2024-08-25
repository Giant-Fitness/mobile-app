// components/images/ImageTextOverlay.tsx

import React from 'react';
import { ImageBackground, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[containerStyle]}>
            <ImageBackground source={photo} style={styles.image}>
                <LinearGradient colors={gradientColors} style={[StyleSheet.absoluteFill]} />
                <ThemedView style={[styles.textContainer, textContainerStyle]}>
                    <ThemedText type={titleType} style={[styles.title, titleStyle, { color: themeColors.background }]}>
                        {title}
                    </ThemedText>
                    {subtitle && (
                        <ThemedText type={subtitleType} style={[styles.subtitle, subtitleStyle, { color: themeColors.textMedium }]}>
                            {subtitle}
                        </ThemedText>
                    )}
                </ThemedView>
            </ImageBackground>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    textContainer: {
        position: 'absolute',
        left: 24,
        right: 24,
        bottom: 24,
        zIndex: 3,
        backgroundColor: 'transparent',
    },
    title: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowRadius: 10,
        marginRight: 48,
        lineHeight: 40,
        zIndex: 20,
    },
    subtitle: {
        marginTop: 8,
    },
});
