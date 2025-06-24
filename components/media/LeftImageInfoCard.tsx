// components/media/LeftImageInfoCard.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

// Cast ShimmerPlaceHolder to the correct type for TypeScript compatibility
const ShimmerPlaceholder = ShimmerPlaceHolder as unknown as React.ComponentType<any>;

type LeftImageInfoCardProps = {
    image: ImageSourcePropType;
    title: string;
    subtitle?: string;
    extraContent?: React.ReactNode;
    onPress?: () => void;
    containerStyle?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
    contentContainerStyle?: StyleProp<ViewStyle>;
    imageContainerStyle?: StyleProp<ViewStyle>;
    titleStyle?: StyleProp<TextStyle>;
    subtitleStyle?: StyleProp<TextStyle>;
    placeholder?: any;
    gradientColors?: [string, string, ...string[]];
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
    placeholder = '@/assets/images/fist.png',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

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
            <View style={[styles.imageBackground]}>
                <ThemedView style={[styles.roundedBackground, imageContainerStyle]}>
                    <Image
                        source={image}
                        style={[styles.image, imageStyle]}
                        placeholder={placeholder}
                        contentFit='cover'
                        transition={300}
                        onLoadStart={() => {
                            if (initialLoad) {
                                setIsLoading(true);
                            }
                        }}
                        onLoad={() => {
                            setIsLoading(false);
                            setInitialLoad(false);
                        }}
                        cachePolicy='memory-disk'
                        priority='normal'
                        recyclingKey={typeof image === 'string' ? image : image.toString()}
                    />
                    {initialLoad && (
                        <ShimmerPlaceholder
                            LinearGradient={LinearGradient}
                            style={[styles.shimmer, imageStyle]}
                            visible={!isLoading}
                            shimmerColors={colorScheme === 'dark' ? ['#1A1A1A', '#2A2A2A', '#1A1A1A'] : ['#D0D0D0', '#E0E0E0', '#D0D0D0']}
                        />
                    )}
                    <LinearGradient colors={gradientColors} style={styles.gradientOverlay} />
                </ThemedView>
            </View>
        );
    };

    return (
        <TouchableOpacity onPress={onPress} style={[styles.card, containerStyle]} activeOpacity={1}>
            {renderImage()}
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
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: Sizes.imageMDWidth,
        height: Sizes.imageMDHeight,
        borderRadius: Spaces.XXS,
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
