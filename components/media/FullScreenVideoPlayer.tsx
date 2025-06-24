// components/media/FullScreenVideoPlayer.tsx

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, StyleSheet, View } from 'react-native';

import { setAudioModeAsync } from 'expo-audio';
import { useVideoPlayer, VideoView } from 'expo-video';

import PropTypes from 'prop-types';

export interface VideoPlaybackStatus {
    isLoaded: boolean;
    isPlaying: boolean;
    isBuffering: boolean;
    positionMillis: number;
    durationMillis: number | null;
    didJustFinish: boolean;
}

interface FullScreenVideoPlayerProps {
    source: { uri: string };
    onPlaybackStatusUpdate?: (status: VideoPlaybackStatus) => void;
    onDismiss?: () => void;
}

export interface FullScreenVideoPlayerHandle {
    startPlayback: () => void;
}

export const FullScreenVideoPlayer = forwardRef<FullScreenVideoPlayerHandle, FullScreenVideoPlayerProps>(
    ({ source, onPlaybackStatusUpdate, onDismiss }, ref) => {
        const [isVideoVisible, setIsVideoVisible] = useState(false);
        const [isFullscreenPresented, setIsFullscreenPresented] = useState(false);
        const fadeAnim = useRef(new Animated.Value(0)).current;
        const dismissTimer = useRef<NodeJS.Timeout | null>(null);
        const videoRef = useRef<VideoView>(null);

        // Create video player
        const player = useVideoPlayer(source, (player) => {
            player.loop = false;
            player.allowsExternalPlayback = false;
        });

        useEffect(() => {
            const configureAudio = async () => {
                try {
                    await setAudioModeAsync({
                        playsInSilentMode: true,
                        interruptionMode: 'duckOthers',
                        shouldRouteThroughEarpiece: true,
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

        // Subscribe to player events
        useEffect(() => {
            const subscription = player.addListener('statusChange', (statusEvent) => {
                const videoStatus: VideoPlaybackStatus = {
                    isLoaded: statusEvent.status !== 'error' && statusEvent.status !== 'idle',
                    isPlaying: player.playing,
                    isBuffering: statusEvent.status === 'loading',
                    positionMillis: player.currentTime * 1000,
                    durationMillis: player.duration ? player.duration * 1000 : null,
                    didJustFinish: false,
                };

                if (onPlaybackStatusUpdate) {
                    onPlaybackStatusUpdate(videoStatus);
                }
            });

            const playbackStatusSubscription = player.addListener('playingChange', (playingEvent) => {
                const videoStatus: VideoPlaybackStatus = {
                    isLoaded: true,
                    isPlaying: playingEvent.isPlaying,
                    isBuffering: false,
                    positionMillis: player.currentTime * 1000,
                    durationMillis: player.duration ? player.duration * 1000 : null,
                    didJustFinish: false,
                };

                if (onPlaybackStatusUpdate) {
                    onPlaybackStatusUpdate(videoStatus);
                }
            });

            const playToEndSubscription = player.addListener('playToEnd', () => {
                const videoStatus: VideoPlaybackStatus = {
                    isLoaded: true,
                    isPlaying: false,
                    isBuffering: false,
                    positionMillis: player.duration ? player.duration * 1000 : 0,
                    durationMillis: player.duration ? player.duration * 1000 : null,
                    didJustFinish: true,
                };

                if (onPlaybackStatusUpdate) {
                    onPlaybackStatusUpdate(videoStatus);
                }

                // Start the 3-second timer when the video finishes
                dismissTimer.current = setTimeout(() => {
                    dismissVideo();
                }, 3000);
            });

            // Add periodic status updates while playing
            let intervalId: NodeJS.Timeout | null = null;

            const startPeriodicUpdates = () => {
                if (intervalId) clearInterval(intervalId);
                intervalId = setInterval(() => {
                    if (player.playing && onPlaybackStatusUpdate) {
                        const videoStatus: VideoPlaybackStatus = {
                            isLoaded: true,
                            isPlaying: player.playing,
                            isBuffering: false,
                            positionMillis: player.currentTime * 1000,
                            durationMillis: player.duration ? player.duration * 1000 : null,
                            didJustFinish: false,
                        };
                        onPlaybackStatusUpdate(videoStatus);
                    }
                }, 500); // Update every 500ms
            };

            const stopPeriodicUpdates = () => {
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            };

            // Start/stop periodic updates based on playing state
            const playingSubscription = player.addListener('playingChange', (playingEvent) => {
                if (playingEvent.isPlaying) {
                    startPeriodicUpdates();
                } else {
                    stopPeriodicUpdates();
                }
            });

            return () => {
                subscription?.remove();
                playbackStatusSubscription?.remove();
                playToEndSubscription?.remove();
                playingSubscription?.remove();
                stopPeriodicUpdates();
            };
        }, [player, onPlaybackStatusUpdate]);

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
                try {
                    if (videoRef.current) {
                        await videoRef.current.enterFullscreen();
                        player.play();
                    }
                } catch (error) {
                    setIsFullscreenPresented(false);
                    console.error('Error presenting fullscreen:', error);
                }
            });
        };

        const handleFullscreenExit = async () => {
            await dismissVideo();
        };

        const dismissVideo = async () => {
            try {
                if (dismissTimer.current) {
                    clearTimeout(dismissTimer.current);
                    dismissTimer.current = null;
                }

                player.pause();
                player.currentTime = 0;

                if (videoRef.current) {
                    await videoRef.current.exitFullscreen();
                }

                setIsFullscreenPresented(false);
                setIsVideoVisible(false);
                fadeAnim.setValue(0);

                if (onDismiss) {
                    onDismiss();
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while resetting the video.');
                console.error('Error resetting video state:', error);
            }
        };

        return (
            <View style={styles.container}>
                {isVideoVisible && (
                    <VideoView
                        ref={videoRef}
                        style={isVideoVisible ? styles.video : { width: 0, height: 0 }}
                        player={player}
                        allowsFullscreen={true}
                        allowsPictureInPicture={false}
                        onFullscreenExit={handleFullscreenExit}
                        contentFit='contain'
                        nativeControls={true}
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
