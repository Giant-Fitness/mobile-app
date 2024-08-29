// components/video/FullScreenVideoPlayer.tsx

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, Button, Alert, Animated, Dimensions } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import PropTypes from 'prop-types'; // Import PropTypes for validation

interface FullScreenVideoPlayerProps {
    source: { uri: string };
    startInFullscreen?: boolean;
    onPlaybackStatusUpdate?: (status: any) => void; // Add callback for playback status updates
}

export interface FullScreenVideoPlayerHandle {
    startPlayback: () => void;
}

export const FullScreenVideoPlayer = forwardRef<FullScreenVideoPlayerHandle, FullScreenVideoPlayerProps>(
    ({ source, startInFullscreen = false, onPlaybackStatusUpdate }, ref) => {
        const video = useRef<Video>(null);
        const [isFullScreen, setIsFullScreen] = useState(startInFullscreen);
        const [isVideoVisible, setIsVideoVisible] = useState(false);
        const [isVideoLoaded, setIsVideoLoaded] = useState(false);
        const [isFullscreenPresented, setIsFullscreenPresented] = useState(false); // Track fullscreen state
        const fadeAnim = useRef(new Animated.Value(0)).current;

        useEffect(() => {
            const configureAudio = async () => {
                try {
                    await Audio.setAudioModeAsync({
                        shouldDuckIOS: true,
                        playsInSilentModeIOS: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: true,
                    });
                } catch (error) {
                    console.error('Error setting audio mode:', error);
                }
            };
            configureAudio();
        }, []);

        // Expose startPlayback method to the parent component
        useImperativeHandle(ref, () => ({
            startPlayback: handleFullScreen,
        }));

        // Function to handle full screen mode
        const handleFullScreen = async () => {
            if (isFullscreenPresented) return; // Prevent multiple requests to enter fullscreen

            setIsVideoVisible(true);
            setIsFullscreenPresented(true); // Mark fullscreen as being presented
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(async () => {
                if (video.current) {
                    try {
                        await video.current.presentFullscreenPlayer(); // Present the video in fullscreen
                    } catch (error) {
                        setIsFullscreenPresented(false); // Reset if presenting fails
                        console.error('Error presenting fullscreen:', error);
                    }
                }
            });
        };

        // Callback when the video is loaded and ready to play
        const handleVideoLoad = async () => {
            setIsVideoLoaded(true);
            try {
                await video.current.playAsync();
            } catch (error) {
                Alert.alert('Error', 'An error occurred while playing the video.');
                console.error('Error starting video playback:', error);
            }
        };

        // Function to handle fullscreen updates using integer values
        const handleFullscreenUpdate = async ({ fullscreenUpdate }) => {
            // Reset state when fullscreen is about to dismiss
            if (fullscreenUpdate === 2) {
                // FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS
                setIsFullscreenPresented(false); // Mark fullscreen as dismissed
                setIsVideoVisible(false); // Ensure the video is hidden
            }

            // Fully reset state when fullscreen has been dismissed
            if (fullscreenUpdate === 3) {
                // FULLSCREEN_UPDATE_PLAYER_DID_DISMISS
                try {
                    if (video.current) {
                        await video.current.stopAsync();
                        await video.current.setPositionAsync(0);
                    }
                    setIsFullScreen(false);
                    setIsVideoLoaded(false);
                    fadeAnim.setValue(0); // Ensure fade is reset
                } catch (error) {
                    Alert.alert('Error', 'An error occurred while resetting the video.');
                    console.error('Error resetting video state:', error);
                }
            }
        };

        return (
            <View style={styles.container}>
                {isVideoVisible && (
                    <Video
                        ref={video}
                        style={isVideoVisible ? styles.video : { width: 0, height: 0 }} // Forcefully hide the video if not visible
                        source={source}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping={false}
                        onLoad={handleVideoLoad}
                        onFullscreenUpdate={handleFullscreenUpdate}
                        onPlaybackStatusUpdate={onPlaybackStatusUpdate} // Pass playback status updates to the handler
                    />
                )}
                {!isFullScreen &&
                    !isVideoVisible && ( // Only show button when video is not visible or fullscreen
                        <View style={styles.buttons}>
                            <Button title='Play Fullscreen' onPress={handleFullScreen} />
                        </View>
                    )}
                {isVideoVisible && <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />}
            </View>
        );
    },
);

// Adding a display name for better debugging and linting
FullScreenVideoPlayer.displayName = 'FullScreenVideoPlayer';

// Adding PropTypes validation to handle ESLint warnings
FullScreenVideoPlayer.propTypes = {
    source: PropTypes.shape({
        uri: PropTypes.string.isRequired,
    }).isRequired,
    startInFullscreen: PropTypes.bool,
    onPlaybackStatusUpdate: PropTypes.func, // Validation for the new prop
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
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
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
