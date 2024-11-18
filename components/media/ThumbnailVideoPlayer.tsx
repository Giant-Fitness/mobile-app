// components/media/ThumbnailVideoPlayer.tsx

import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated, Modal } from 'react-native';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/media/FullScreenVideoPlayer';
import { Spaces } from '@/constants/Spaces';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';

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
    const fadeAnim = useRef(new Animated.Value(0)).current; // Animation for fade effect
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // State to manage loading
    const imageOpacity = useRef(new Animated.Value(0)).current;

    const handleImageLoadEnd = () => {
        Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsLoading(false);
        });
    };

    const handlePlayPress = () => {
        // Show the modal
        setIsModalVisible(true);

        // Start fade animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300, // Duration of fade animation
            useNativeDriver: true,
        }).start(() => {
            // Callback after fade completes
            if (videoPlayerRef.current) {
                videoPlayerRef.current.startPlayback();
            }
        });
    };

    const handleDismiss = () => {
        // Start fade out animation
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300, // Duration of fade out
            useNativeDriver: true,
        }).start(() => {
            // Hide the modal after fade out
            setIsModalVisible(false);
        });
    };

    const handleImageError = () => {
        setIsLoading(false);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handlePlayPress} activeOpacity={0.9}>
                {/* Thumbnail Image */}
                <Animated.Image
                    source={{ uri: thumbnailUrl }}
                    style={[styles.thumbnail, { opacity: imageOpacity }]}
                    onLoadEnd={handleImageLoadEnd}
                    onError={handleImageError}
                />

                {/* Shimmer Placeholder Overlay */}
                {isLoading && (
                    <ShimmerPlaceholder
                        LinearGradient={LinearGradient}
                        style={styles.shimmer}
                        shimmerColors={colorScheme === 'dark' ? ['#1A1A1A', '#2A2A2A', '#1A1A1A'] : ['#D0D0D0', '#E0E0E0', '#D0D0D0']}
                        autoRun={true}
                    />
                )}

                {/* Play Button */}
                <View style={styles.playButtonContainer}>
                    <Icon name='play' size={Spaces.XXL} color={themeColors.white} />
                </View>
            </TouchableOpacity>

            {/* Modal for Full Screen Video */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType='none' // We handle animation manually
                onRequestClose={handleDismiss}
            >
                <Animated.View
                    style={[
                        styles.fadeOverlay,
                        {
                            opacity: fadeAnim,
                        },
                    ]}
                    pointerEvents='none' // Prevents the overlay from blocking touch events
                />
                <FullScreenVideoPlayer
                    ref={videoPlayerRef}
                    source={{ uri: videoUrl }}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    onDismiss={handleDismiss} // Pass the dismiss handler
                />
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
        height: Sizes.imageXXLHeight, // Ensure this is a valid number
        backgroundColor: '#ccc', // Temporary background for debugging
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
        transform: [
            { translateX: -Spaces.XL }, // Half of width
            { translateY: -Spaces.XL }, // Half of height
        ],
    },
    fadeOverlay: {
        ...StyleSheet.absoluteFillObject, // Fills the entire screen
        backgroundColor: 'black',
    },
});
