// components/media/TopImageInfoCard.tsx

import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
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

const ShimmerPlaceholder = ShimmerPlaceHolder as unknown as React.ComponentType<any>;

interface TopImageInfoCardProps {
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
    titleFirst?: boolean;
    onPress?: () => void;
    useImageContainer?: boolean;
}

export const TopImageInfoCard = ({
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
    titleFirst = false,
    onPress,
    useImageContainer = false,
}: TopImageInfoCardProps) => {
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
        const imageComponent = (
            <View style={[styles.imageWrapper, imageStyle]}>
                <Image
                    source={image}
                    style={[styles.image, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, imageStyle]}
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
                    contentPosition='center'
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
            </View>
        );

        if (useImageContainer) {
            return <ThemedView style={styles.imageContainer}>{imageComponent}</ThemedView>;
        }

        return imageComponent;
    };

    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, containerStyle]} activeOpacity={onPress ? 0.7 : 1}>
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
        position: 'relative',
    },
    imageContainer: {
        width: '100%',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    imageWrapper: {
        position: 'relative',
        width: '100%',
        height: Sizes.imageLGHeight,
    },
    image: {
        width: '100%',
        height: Sizes.imageLGHeight,
        borderTopRightRadius: Spaces.SM,
        borderTopLeftRadius: Spaces.SM,
    },
    shimmer: {
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
