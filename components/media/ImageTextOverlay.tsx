// components/media/ImageTextOverlay.tsx

import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native';

import { Image, ImageContentFit } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

const ShimmerPlaceholderComponent = ShimmerPlaceHolder as unknown as React.ComponentType<any>;

type ImageTextOverlayProps = {
    image: any;
    title?: string;
    subtitle?: string;
    imageContentFit?: ImageContentFit;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    containerStyle?: StyleProp<ViewStyle>;
    textContainerStyle?: StyleProp<ViewStyle>;
    gradientColors?: string[];
    titleType?: ThemedTextProps['type'];
    subtitleType?: ThemedTextProps['type'];
};

export const ImageTextOverlay = React.memo<ImageTextOverlayProps>(
    ({
        image,
        title,
        subtitle,
        titleStyle,
        subtitleStyle,
        imageContentFit = 'cover',
        titleType = 'titleLarge',
        subtitleType = 'subtitle',
        containerStyle,
        textContainerStyle,
        gradientColors = ['transparent', 'rgba(0,0,0,0.8)'],
    }) => {
        const colorScheme = useColorScheme() as 'light' | 'dark';
        const themeColors = Colors[colorScheme];
        const [isLoading, setIsLoading] = useState(true);

        // Get stable image URI for recycling key
        const currentImageUri = typeof image === 'string' ? image : image?.uri;

        return (
            <ThemedView style={[styles.container, containerStyle]}>
                <ThemedView style={styles.imageWrapper}>
                    <Image
                        source={image}
                        style={styles.image}
                        contentFit={imageContentFit}
                        cachePolicy='memory-disk'
                        onLoadStart={() => setIsLoading(true)}
                        onLoad={() => setIsLoading(false)}
                        priority='high'
                        recyclingKey={currentImageUri}
                        transition={200}
                    />
                    {isLoading && (
                        <ShimmerPlaceholderComponent
                            LinearGradient={LinearGradient}
                            style={styles.shimmer}
                            visible={!isLoading}
                            shimmerColors={colorScheme === 'dark' ? ['#1A1A1A', '#2A2A2A', '#1A1A1A'] : ['#D0D0D0', '#E0E0E0', '#D0D0D0']}
                        />
                    )}
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
    },
    (prevProps, nextProps) => {
        // Custom comparison to prevent unnecessary re-renders
        const prevUri = typeof prevProps.image === 'string' ? prevProps.image : prevProps.image?.uri;
        const nextUri = typeof nextProps.image === 'string' ? nextProps.image : nextProps.image?.uri;

        return (
            prevUri === nextUri &&
            prevProps.title === nextProps.title &&
            prevProps.subtitle === nextProps.subtitle &&
            prevProps.imageContentFit === nextProps.imageContentFit
        );
    },
);

ImageTextOverlay.displayName = 'ImageTextOverlay';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        overflow: 'hidden',
        position: 'relative',
    },
    imageWrapper: {
        flex: 1,
        overflow: 'hidden',
        width: '100%',
        height: Sizes.imageLGHeight,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    shimmer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 1,
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
    },
    textContainer: {
        position: 'absolute',
        left: Spaces.MD,
        bottom: Spaces.MD,
        zIndex: 3,
        backgroundColor: 'transparent',
    },
    title: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowRadius: Sizes.textShadowRadius,
        marginRight: Spaces.XXL,
        lineHeight: Spaces.XXL,
    },
    subtitle: {
        marginTop: 0,
    },
});
