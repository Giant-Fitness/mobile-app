// components/layout/LeftImageInfoCard.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View, StyleProp, ViewStyle, ImageSourcePropType, TextStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';

type LeftImageInfoCardProps = {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    extraContent?: React.ReactNode; // For any additional content like icons or extra text
    onPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
};

export const LeftImageInfoCard: React.FC<LeftImageInfoCardProps> = ({
    image,
    title,
    subtitle,
    extraContent,
    onPress,
    containerStyle,
    imageStyle,
    contentContainerStyle,
    titleStyle,
    subtitleStyle,
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, containerStyle]} activeOpacity={1}>
            <Image source={image} style={[styles.image, imageStyle]} />
            <ThemedView style={[styles.textContainer, contentContainerStyle]}>
                <ThemedText type='bodyMedium' style={[styles.title, titleStyle, { color: themeColors.text }]}>
                    {title}
                </ThemedText>
                {subtitle && (
                    <ThemedText type='bodySmall' style={[styles.subtitle, subtitleStyle, { color: themeColors.subText }]}>
                        {subtitle}
                    </ThemedText>
                )}
                {extraContent && <ThemedView style={styles.extraContent}>{extraContent}</ThemedView>}
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
    },
    image: {
        borderRadius: 6,
        height: 120,
        width: 120,
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    title: {
        marginBottom: 5,
        lineHeight: 20,
        marginRight: 48,
    },
    subtitle: {
        marginTop: 5,
        lineHeight: 20,
    },
});
