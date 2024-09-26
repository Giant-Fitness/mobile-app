// components/media/FullScreenVideoPlayer.tsx

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Alert, Animated, Dimensions } from 'react-native';
import { Video, ResizeMode, Audio, AVPlaybackStatus } from 'expo-av';
import PropTypes from 'prop-types';

interface FullScreenVideoPlayerProps {
    source: { uri: string };
    startInFullscreen?: boolean;
    onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
    onDismiss?: () => void;
}

export interface FullScreenVideoPlayerHandle {
    startPlayback: () => void;
}

export const FullScreenVideoPlayer = forwardRef<FullScreenVideoPlayerHandle, FullScreenVideoPlayerProps>(
    ({ source, startInFullscreen = false, onPlaybackStatusUpdate, onDismiss }, ref) => {
        const video = useRef<Video>(null);
        const [isVideoVisible, setIsVideoVisible] = useState(false);
        const [isVideoLoaded, setIsVideoLoaded] = useState(false);
        const [isFullscreenPresented, setIsFullscreenPresented] = useState(false);
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const dismissTimer = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
            const configureAudio = async () => {
                try {
                    await Audio.setAudioModeAsync({
                        playsInSilentModeIOS: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: true,
                    });
                } catch (error) {
                    console.error('Error setting audio mode:', error);
                }
            };
            configureAudio();

            return () => {
                if (dismissTimer.current) {
                    clearTimeout(dismissTimer.current);
                }
            };
        }, []);

        useImperativeHandle(ref, () => ({
            startPlayback: handleFullScreen,
        }));

        const handleFullScreen = async () => {
            if (isFullscreenPresented) return;

            setIsVideoVisible(true);
            setIsFullscreenPresented(true);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(async () => {
                if (video.current) {
                    try {
                        await video.current.presentFullscreenPlayer();
                    } catch (error) {
                        setIsFullscreenPresented(false);
                        console.error('Error presenting fullscreen:', error);
                    }
                }
            });
        };

        const handleVideoLoad = async () => {
            setIsVideoLoaded(true);
            if (video.current) {
                try {
                    await video.current.playAsync();
                } catch (error) {
                    Alert.alert('Error', 'An error occurred while playing the video.');
                }
            }
        };

        const handleFullscreenUpdate = async ({ fullscreenUpdate }: { fullscreenUpdate: number }) => {
            if (fullscreenUpdate === 3) {
                // FULLSCREEN_UPDATE_PLAYER_DID_DISMISS
                await dismissVideo();
            }
        };

        const dismissVideo = async () => {
            try {
                if (dismissTimer.current) {
                    clearTimeout(dismissTimer.current);
                    dismissTimer.current = null;
                }
                if (video.current) {
                    await video.current.stopAsync();
                    await video.current.setPositionAsync(0);
                }
                setIsFullscreenPresented(false);
                setIsVideoVisible(false);
                setIsVideoLoaded(false);
                fadeAnim.setValue(0);
                if (onDismiss) {
                    onDismiss();
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while resetting the video.');
                console.error('Error resetting video state:', error);
            }
        };

        const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
            if (status.isLoaded && status.didJustFinish) {
                // Start the 3-second timer when the video finishes
                dismissTimer.current = setTimeout(() => {
                    dismissVideo();
                }, 3000);
            }
            if (onPlaybackStatusUpdate) {
                onPlaybackStatusUpdate(status);
            }
        };

        return (
            <View style={styles.container}>
                {isVideoVisible && (
                    <Video
                        ref={video}
                        style={isVideoVisible ? styles.video : { width: 0, height: 0 }}
                        source={source}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping={false}
                        onLoad={handleVideoLoad}
                        onFullscreenUpdate={handleFullscreenUpdate}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    />
                )}
                {isVideoVisible && <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />}
            </View>
        );
    },
);

FullScreenVideoPlayer.displayName = 'FullScreenVideoPlayer';

FullScreenVideoPlayer.propTypes = {
    source: PropTypes.shape({
        uri: PropTypes.string.isRequired,
    }).isRequired,
    startInFullscreen: PropTypes.bool,
    onPlaybackStatusUpdate: PropTypes.func,
    onDismiss: PropTypes.func,
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    video: {
        alignSelf: 'center',
        width: 1,
        height: 1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        backgroundColor: 'black',
        zIndex: 10,
    },
});
