// components/layout/TopImageInfoCard.tsx

import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';

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
    placeholder?: any;
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
    placeholder = '@/assets/images/adaptive-icon.png',
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.container, containerStyle]}>
            <Image source={image} style={[styles.image, imageStyle]} placeholder={placeholder} />
            <ThemedView style={[styles.contentContainer, contentContainerStyle, { backgroundColor: themeColors.containerHighlight }]}>
                {subtitle && <ThemedText style={[styles.subtitle, subtitleStyle]}>{subtitle}</ThemedText>}
                <ThemedText type='title' style={[styles.title, titleStyle]}>
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
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: sizes.imageLargeHeight,
        borderTopRightRadius: spacing.xs,
        borderTopLeftRadius: spacing.xs,
    },
    contentContainer: {
        width: '100%',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomLeftRadius: spacing.xs,
        borderBottomRightRadius: spacing.xs,
    },
    title: {
        marginBottom: spacing.sm,
    },
    subtitle: {
        marginTop: spacing.xs,
        fontSize: moderateScale(14),
    },
});
