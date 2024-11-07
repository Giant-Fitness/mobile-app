// components/media/TopImageInfoCard.tsx

import React from 'react';
import { StyleSheet, StyleProp, ViewStyle, TextStyle, ImageSourcePropType, ImageStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Image } from 'expo-image';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { ThemedTextProps } from '@/components/base/ThemedText';

type TopImageInfoCardProps = {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    titleType?: ThemedTextProps['type'];
    subtitleType?: ThemedTextProps['type'];
    extraContent?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    placeholder?: any;
    titleFirst?: boolean;
    onPress?: () => void;
    useImageContainer?: boolean; // New prop for optional image container
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
    placeholder = '@/assets/images/logo.png',
    titleFirst = false,
    onPress,
    useImageContainer = false, // Default to false for backward compatibility
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const renderImage = () => {
        if (useImageContainer) {
            return (
                <ThemedView style={styles.imageContainer}>
                    <Image source={image} style={[styles.image, imageStyle]} placeholder={placeholder} contentFit='contain' />
                </ThemedView>
            );
        }
        return <Image source={image} style={[styles.image, imageStyle]} placeholder={placeholder} />;
    };

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]} activeOpacity={1}>
            {renderImage()}
            <ThemedView style={[styles.contentContainer, { backgroundColor: themeColors.containerHighlight }, contentContainerStyle]}>
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
    imageContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    image: {
        width: '100%',
        height: Sizes.imageLGHeight,
        borderTopRightRadius: Spaces.SM,
        borderTopLeftRadius: Spaces.SM,
    },
    contentContainer: {
        width: '100%',
        paddingHorizontal: Spaces.MD,
        marginTop: -Spaces.XXS,
        paddingVertical: Spaces.MD,
        borderBottomLeftRadius: Spaces.SM,
        borderBottomRightRadius: Spaces.SM,
    },
    title: {
        marginBottom: Spaces.SM,
    },
    subtitle: {
        marginTop: Spaces.XXS,
    },
});
