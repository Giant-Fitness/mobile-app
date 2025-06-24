// components/media/ThumbnailVideoPlayer.tsx

import { Icon } from '@/components/base/Icon';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/media/FullScreenVideoPlayer';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

// Cast ShimmerPlaceHolder to the correct type for TypeScript compatibility
const ShimmerPlaceholder = ShimmerPlaceHolder as unknown as React.ComponentType<any>;

type ThumbnailVideoPlayerProps = {
    videoUrl: string;
    thumbnailUrl: string;
    onPlaybackStatusUpdate?: (status: any) => void;
};

export const ThumbnailVideoPlayer: React.FC<ThumbnailVideoPlayerProps> = ({ videoUrl, thumbnailUrl, onPlaybackStatusUpdate }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const videoPlayerRef = useRef<FullScreenVideoPlayerHandle>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const checkCache = async () => {
            try {
                const isCached = await Image.getCachePathAsync(thumbnailUrl);
                if (isCached) {
                    setIsLoading(false);
                    setInitialLoad(false);
                }
            } catch (error) {
                console.log('Cache check error:', error);
            }
        };

        checkCache();
    }, [thumbnailUrl]);

    const handlePlayPress = () => {
        setIsModalVisible(true);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            if (videoPlayerRef.current) {
                videoPlayerRef.current.startPlayback();
            }
        });
    };

    const handleDismiss = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsModalVisible(false);
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePlayPress} activeOpacity={0.9}>
                {/* Thumbnail Image */}
                <Image
                    source={thumbnailUrl}
                    style={styles.thumbnail}
                    contentFit='cover'
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
                    recyclingKey={thumbnailUrl}
                />

                {/* Shimmer Placeholder Overlay */}
                {initialLoad && (
                    <ShimmerPlaceholder
                        LinearGradient={LinearGradient}
                        style={styles.shimmer}
                        visible={!isLoading}
                        shimmerColors={colorScheme === 'dark' ? ['#1A1A1A', '#2A2A2A', '#1A1A1A'] : ['#D0D0D0', '#E0E0E0', '#D0D0D0']}
                    />
                )}

                {/* Play Button */}
                <View style={styles.playButtonContainer}>
                    <Icon name='play' size={Spaces.XXL} color={themeColors.white} />
                </View>
            </TouchableOpacity>

            {/* Modal for Full Screen Video */}
            <Modal visible={isModalVisible} transparent={true} animationType='none' onRequestClose={handleDismiss}>
                <Animated.View
                    style={[
                        styles.fadeOverlay,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                    pointerEvents='none'
                />
                <FullScreenVideoPlayer
                    ref={videoPlayerRef}
                    source={{ uri: videoUrl }}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    onDismiss={handleDismiss}
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
        height: Sizes.image3XLHeight,
        backgroundColor: '#ccc',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: Spaces.XXS,
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: Spaces.XXS,
    },
    playButtonContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: Spaces.XXXL,
        height: Spaces.XXXL,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateX: -Spaces.XL }, { translateY: -Spaces.XL }],
    },
    fadeOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
    },
});
