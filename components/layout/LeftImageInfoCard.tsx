import React from 'react';
import { StyleSheet, TouchableOpacity, View, StyleProp, ViewStyle, ImageSourcePropType, TextStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';

type LeftImageInfoCardProps = {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    extraContent?: React.ReactNode;
    onPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ViewStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
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
    titleStyle,
    subtitleStyle,
    gradientColors = ['transparent', 'rgba(0,0,0,0.4)'],
    placeholder = '@/assets/images/adaptive-icon.png',
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, containerStyle]} activeOpacity={1}>
            <View style={styles.imageBackground}>
                <ThemedView style={styles.roundedBackground}>
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
        borderRadius: spacing.xxs,
        backgroundColor: 'transparent', // Adjust to your desired background color
        marginRight: spacing.md,
    },
    roundedBackground: {
        borderRadius: spacing.xxs,
        overflow: 'hidden',
    },
    image: {
        height: sizes.imageMediumHeight,
        width: sizes.imageMediumWidth,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    title: {
        marginBottom: spacing.xs,
        lineHeight: spacing.md,
        marginRight: spacing.xxl,
    },
    subtitle: {
        marginTop: spacing.xs,
        lineHeight: spacing.md,
    },
    extraContent: {
        backgroundColor: 'transparent',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
});
