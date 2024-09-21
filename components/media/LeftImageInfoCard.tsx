// components/media/LeftImageInfoCard.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View, StyleProp, ViewStyle, ImageSourcePropType, TextStyle, ImageStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

type LeftImageInfoCardProps = {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    extraContent?: React.ReactNode;
    onPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>; // Change from ViewStyle to ImageStyle
    contentContainerStyle?: StyleProp<ViewStyle>;
    imageContainerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    placeholder?: any;
    gradientColors?: string[];
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
    imageContainerStyle,
    titleStyle,
    subtitleStyle,
    gradientColors = ['transparent', 'rgba(0,0,0,0.4)'],
    placeholder = '@/assets/images/adaptive-icon.png',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, containerStyle]} activeOpacity={1}>
            <View style={[styles.imageBackground]}>
                <ThemedView style={[styles.roundedBackground, imageContainerStyle]}>
                    <Image source={image} style={[styles.image, imageStyle]} placeholder={placeholder} />
                    <LinearGradient colors={gradientColors} style={styles.gradientOverlay} />
                </ThemedView>
            </View>
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
    imageBackground: {
        borderRadius: Spaces.XXS,
        backgroundColor: 'transparent', // Adjust to your desired background color
    },
    roundedBackground: {
        borderRadius: Spaces.XXS,
        overflow: 'hidden',
    },
    image: {
        height: Sizes.imageMDHeight,
        width: Sizes.imageMDWidth,
    },
    textContainer: {
        marginLeft: Spaces.MD,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    title: {
        marginBottom: Spaces.XS,
        lineHeight: Spaces.MD,
        marginRight: Spaces.XXL,
    },
    subtitle: {
        marginTop: Spaces.XS,
        lineHeight: Spaces.MD,
    },
    extraContent: {
        backgroundColor: 'transparent',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
});
