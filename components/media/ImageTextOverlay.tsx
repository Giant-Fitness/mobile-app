// components/media/ImageTextOverlay.tsx

import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
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

export const ImageTextOverlay: React.FC<ImageTextOverlayProps> = ({
    image,
    title,
    subtitle,
    titleStyle,
    subtitleStyle,
    imageContentFit = 'cover',
    titleType = 'titleLarge', // Default to 'titleLarge' if not provided
    subtitleType = 'subtitle', // Default to 'subtitle' if not provided
    containerStyle,
    textContainerStyle,
    gradientColors = ['transparent', 'rgba(0,0,0,0.8)'],
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [isLoading, setIsLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const checkCache = async () => {
            try {
                if (typeof image === 'string') {
                    const isCached = await Image.getCachePathAsync(image);
                    if (isCached) {
                        setIsLoading(false);
                        setInitialLoad(false);
                    }
                } else if (image && typeof image === 'object' && 'uri' in image && image.uri) {
                    const isCached = await Image.getCachePathAsync(image.uri);
                    if (isCached) {
                        setIsLoading(false);
                        setInitialLoad(false);
                    }
                }
            } catch (error) {
                console.log('Cache check error:', error);
            }
        };

        checkCache();
    }, [image]);

    const renderImage = () => {
        return (
            <ThemedView style={styles.imageWrapper}>
                <Image
                    source={image}
                    style={styles.image}
                    contentFit={imageContentFit}
                    cachePolicy='memory-disk'
                    onLoadStart={() => {
                        if (initialLoad) {
                            setIsLoading(true);
                        }
                    }}
                    onLoad={() => {
                        setIsLoading(false);
                        setInitialLoad(false);
                    }}
                    priority='normal'
                    recyclingKey={typeof image === 'string' ? image : image.toString()}
                />
                {initialLoad && (
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
        );
    };

    return <ThemedView style={[styles.container, containerStyle]}>{renderImage()}</ThemedView>;
};

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
        height: Sizes.imageLGHeight, // Ensure you have this size defined
    },
    image: {
        width: '100%',
        height: '100%',
    },
    shimmer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject, // Ensures the gradient covers the entire image
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
