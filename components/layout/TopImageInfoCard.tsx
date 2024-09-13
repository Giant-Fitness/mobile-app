import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, ImageSourcePropType, ImageStyle } from 'react-native';
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
    extraContent?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    placeholder?: any;
    titleFirst?: boolean;
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
    placeholder = '@/assets/images/adaptive-icon.png',
    titleFirst = false,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <ThemedView style={[styles.container, containerStyle]}>
            <Image source={image} style={[styles.image, imageStyle]} placeholder={placeholder} />
            <ThemedView style={[styles.contentContainer, { backgroundColor: themeColors.containerHighlight }, contentContainerStyle]}>
                {/* Conditionally render title and subtitle based on the 'titleFirst' prop */}
                {titleFirst ? (
                    <>
                        <ThemedText type={titleType} style={[styles.title, titleStyle]}>
                            {title}
                        </ThemedText>
                        {subtitle && <ThemedText style={[styles.subtitle, subtitleStyle]}>{subtitle}</ThemedText>}
                    </>
                ) : (
                    <>
                        {subtitle && <ThemedText style={[styles.subtitle, subtitleStyle]}>{subtitle}</ThemedText>}
                        <ThemedText type={titleType} style={[styles.title, titleStyle]}>
                            {title}
                        </ThemedText>
                    </>
                )}
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
        marginTop: -spacing.xxs,
        paddingVertical: spacing.md,
        borderBottomLeftRadius: spacing.xs,
        borderBottomRightRadius: spacing.xs,
    },
    title: {
        marginBottom: spacing.sm,
    },
    subtitle: {
        marginTop: spacing.xxs,
        fontSize: moderateScale(14),
    },
});
