// app/workouts/workout-details.tsx

import React, { useRef, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { CustomBackButton } from '@/components/base/CustomBackButton';
import { ImageTextOverlay } from '@/components/images/ImageTextOverlay';
import { Icon } from '@/components/icons/Icon';
import { TextButton } from '@/components/base/TextButton';
import { IconButton } from '@/components/base/IconButton';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/video/FullScreenVideoPlayer';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const scrollY = useRef(new Animated.Value(0)).current;
    const videoPlayerRef = useRef<FullScreenVideoPlayerHandle>(null);

    // Constants for milestone tracking and skip logic
    const MILESTONES = [0.25, 0.5, 0.75, 1.0]; // Define milestones as percentages
    const SKIP_THRESHOLD = 0.25; // Max allowed skip percentage

    // State for tracking playback position
    const [lastPlaybackPosition, setLastPlaybackPosition] = useState(0);
    const reachedMilestones = useRef(new Set());

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const { name, length, level, equipment, focus, photo, trainer, longText, focusMulti } = route.params;

    // Convert focusMulti array to a comma-separated string
    const focusMultiText = focusMulti.join(', ');
    const levelIcon = 'level-' + level.toLowerCase();

    // Function to start the video playback
    const handleStartWorkout = () => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.startPlayback(); // Call the method to start playback
        }
    };

    // Function to handle playback status updates from the video player
    const handlePlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            const duration = status.durationMillis;
            const currentPosition = status.positionMillis;
            const progress = currentPosition / duration;

            // Check and log milestones
            MILESTONES.forEach((milestone) => {
                if (progress >= milestone && !reachedMilestones.current.has(milestone)) {
                    console.log(`Milestone reached: ${milestone * 100}%`);
                    reachedMilestones.current.add(milestone); // Mark this milestone as reached
                }
            });

            // Check if a skip occurred
            if (lastPlaybackPosition !== null && Math.abs(currentPosition - lastPlaybackPosition) > duration * SKIP_THRESHOLD) {
                console.log(`Skip detected from ${lastPlaybackPosition / 1000}s to ${currentPosition / 1000}s`);
            }

            // Update the last playback position
            setLastPlaybackPosition(currentPosition);

            // when full screen is exited and a significant threshold is reached (like 75%), show a toast asking the user if they want to log their workout
            // there needs to be some special logic built in here. we'll have to make a request to the backend to see if this should even be logged
            // backend should check if this exercise was logged in the last x hours (maybe 1-2). if not, then get the app to show the toast
            // this is a pseudo version of session tracking
        }
    };

    return (
        <ThemedView style={styles.container}>
            <CustomBackButton style={styles.backButton} iconColor={themeColors.white} />
            <Animated.ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} overScrollMode='never'>
                <ImageTextOverlay
                    photo={photo}
                    title={name}
                    titleType='titleXXLarge'
                    gradientColors={['transparent', 'rgba(0,0,0,0.4)']}
                    containerStyle={{ height: sizes.imageXXLHeight, elevation: 5 }}
                    textContainerStyle={{ bottom: spacing.lg, left: spacing.lg }}
                />

                <ThemedView style={[styles.textContainer]}>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name='stopwatch' size={moderateScale(18)} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText]}>
                                {length}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name={levelIcon} size={moderateScale(18)} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText]}>
                                {level}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name='dumbbell' size={moderateScale(18)} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText]}>
                                {equipment}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name='yoga' size={moderateScale(18)} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText]}>
                                {focusMultiText}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={[styles.detailsContainer]}>
                        <ThemedText type='body' style={[styles.detailsText, { color: themeColors.subText }]}>
                            {longText}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </Animated.ScrollView>
            <FullScreenVideoPlayer
                ref={videoPlayerRef}
                source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate} // Pass the handler
            />
            <ThemedView style={styles.buttonContainer}>
                <TextButton
                    text='Start Workout'
                    textType='bodyMedium'
                    style={[styles.startButton, { backgroundColor: themeColors.buttonPrimary }]}
                    onPress={handleStartWorkout}
                />
                <IconButton
                    iconName='notebook'
                    style={[styles.notesButton, { backgroundColor: themeColors.buttonSecondary }]}
                    iconSize={moderateScale(24)}
                    iconColor={themeColors.buttonPrimary}
                />
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'none',
    },
    gradientOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: spacing.md,
    },
    backButton: {
        position: 'absolute',
        top: spacing.xxl,
        left: spacing.md,
        zIndex: 10,
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: verticalScale(120),
        zIndex: 2,
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: spacing.md,
    },
    attributeText: {
        marginLeft: spacing.md,
        lineHeight: spacing.lg,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    detailsContainer: {
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
    },
    detailsText: {
        lineHeight: spacing.lg,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%',
        position: 'absolute',
        bottom: verticalScale(30),
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    startButton: {
        width: '80%',
        paddingVertical: spacing.md,
        marginRight: '2%',
    },
    notesButton: {
        width: '18%', // Fixed width for the icon button
        height: '100%', // Fixed height for the icon button
        alignItems: 'center',
        borderRadius: moderateScale(100), // Ensure the button is perfectly circular
    },
});
