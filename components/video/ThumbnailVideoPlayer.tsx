// components/video/ThumbnailVideoPlayer.tsx

import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Animated, Modal, ActivityIndicator } from 'react-native';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/video/FullScreenVideoPlayer';
import { spacing } from '@/utils/spacing';
import { moderateScale } from '@/utils/scaling';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { sizes } from '@/utils/sizes';
import SkeletonPlaceholder from 'expo-skeleton-placeholder';

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
                {/* Image */}
                <Animated.Image
                    source={{ uri: thumbnailUrl }}
                    style={[styles.thumbnail, { opacity: imageOpacity }]}
                    onLoadEnd={handleImageLoadEnd}
                    onError={handleImageError}
                />
                {/* Skeleton Placeholder Overlay */}
                {isLoading && (
                    <View style={styles.skeletonContainer}>
                        <SkeletonPlaceholder highlightColor='#e1e9ee' backgroundColor='#f2f8fc'>
                            <SkeletonPlaceholder.Item width='100%' height='100%' borderRadius={spacing.xxs} />
                        </SkeletonPlaceholder>
                        {/* Optional: Add an ActivityIndicator for debugging */}
                        {/* <ActivityIndicator size="small" color="#0000ff" style={styles.activityIndicator} /> */}
                    </View>
                )}

                {/* Play Button */}
                <View style={styles.playButtonContainer}>
                    <Icon name='play' size={spacing.xxl} color={themeColors.white} />
                </View>
            </TouchableOpacity>

            {/* Modal for fade overlay */}
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
            </Modal>

            <FullScreenVideoPlayer
                ref={videoPlayerRef}
                source={{ uri: videoUrl }}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                onDismiss={handleDismiss} // Pass the dismiss handler
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: '100%',
        height: sizes.imageXLargeHeight, // Ensure this is a valid number
        backgroundColor: '#ccc', // Temporary background for debugging
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        borderRadius: spacing.xxs,
    },
    skeletonContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: spacing.xxs,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Ensure background doesn't block the skeleton
    },
    playButtonContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: spacing.xxxl,
        height: spacing.xxxl,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
            { translateX: -spacing.xl }, // Half of width
            { translateY: -spacing.xl }, // Half of height
        ],
    },
    fadeOverlay: {
        ...StyleSheet.absoluteFillObject, // Fills the entire screen
        backgroundColor: 'black',
    },
    activityIndicator: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -10 }, // Half of ActivityIndicator width
            { translateY: -10 }, // Half of ActivityIndicator height
        ],
    },
});
