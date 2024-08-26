// components/layout/TopImageInfoCard.tsx

import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';

type TopImageInfoCardProps = {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    extraContent?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
};

export const TopImageInfoCard: React.FC<TopImageInfoCardProps> = ({
    image,
    title,
    subtitle,
    extraContent,
    containerStyle,
    imageStyle,
    contentContainerStyle,
    titleStyle,
    subtitleStyle,
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.container, containerStyle]}>
            <Image source={image} style={[styles.image, imageStyle]} />
            <ThemedView style={[styles.contentContainer, contentContainerStyle, { backgroundColor: themeColors.containerColor }]}>
                {subtitle && <ThemedText style={[styles.subtitle, subtitleStyle, { color: themeColors.textLight }]}>{subtitle}</ThemedText>}
                <ThemedText type='titleSmall' style={[styles.title, titleStyle, { color: themeColors.text }]}>
                    {title}
                </ThemedText>
                {extraContent}
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        borderRadius: 5,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
    },
    contentContainer: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    title: {
        marginBottom: 8,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
    },
});
