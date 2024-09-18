// components/layout/TopImageInfoCard.tsx

import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, ImageSourcePropType, ImageStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';
import { ThemedTextProps } from '@/components/base/ThemedText';

type TopImageInfoCardProps = {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    titleType?: ThemedTextProps['type']; // Use ThemedTextProps for titleType
    subtitleType?: ThemedTextProps['type']; // Use ThemedTextProps for subtitleType
    extraContent?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    placeholder?: any;
    titleFirst?: boolean;
    onPress?: () => void;
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
    titleType = 'title',
    subtitleType = 'body',
    placeholder = '@/assets/images/vb.webp',
    titleFirst = false,
    onPress,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors
    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]} activeOpacity={1}>
            <Image source={image} style={[styles.image, imageStyle]} placeholder={placeholder} />
            <ThemedView style={[styles.contentContainer, { backgroundColor: themeColors.containerHighlight }, contentContainerStyle]}>
                {/* Conditionally render title and subtitle based on the 'titleFirst' prop */}
                {titleFirst ? (
                    <>
                        <ThemedText type={titleType} style={[styles.title, titleStyle]}>
                            {title}
                        </ThemedText>
                        {subtitle && (
                            <ThemedText type={subtitleType} style={[styles.subtitle, subtitleStyle]}>
                                {subtitle}
                            </ThemedText>
                        )}
                    </>
                ) : (
                    <>
                        {subtitle && (
                            <ThemedText type={subtitleType} style={[styles.subtitle, subtitleStyle]}>
                                {subtitle}
                            </ThemedText>
                        )}
                        <ThemedText type={titleType} style={[styles.title, titleStyle]}>
                            {title}
                        </ThemedText>
                    </>
                )}
                {extraContent}
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: sizes.imageLargeHeight,
        borderTopRightRadius: spacing.sm,
        borderTopLeftRadius: spacing.sm,
    },
    contentContainer: {
        width: '100%',
        paddingHorizontal: spacing.md,
        marginTop: -spacing.xxs,
        paddingVertical: spacing.md,
        borderBottomLeftRadius: spacing.sm,
        borderBottomRightRadius: spacing.sm,
    },
    title: {
        marginBottom: spacing.sm,
    },
    subtitle: {
        marginTop: spacing.xxs,
    },
});
