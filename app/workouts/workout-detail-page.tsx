// app/workouts/workout-detail-page.tsx

import React, { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { ImageTextOverlay } from '@/components/images/ImageTextOverlay';
import { Icon } from '@/components/icons/Icon';
import { TextButton } from '@/components/base/TextButton';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/video/FullScreenVideoPlayer';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';

type WorkoutDetailScreenParams = {
    Workout: {
        name: string;
        length: string;
        level: string;
        equipment: string;
        photo: string;
        longText: string;
        focusMulti: string[];
    };
};

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigation = useNavigation();
    const route = useRoute<RouteProp<WorkoutDetailScreenParams, 'Workout'>>();

    const scrollY = useSharedValue(0);

    const videoPlayerRef = useRef<FullScreenVideoPlayerHandle>(null);

    // Constants for milestone tracking and skip logic
    const MILESTONES = [0.25, 0.5, 0.75, 1.0]; // Milestones as percentages
    const SKIP_THRESHOLD = 0.25; // Max allowed skip percentage

    // State for tracking playback position
    const [lastPlaybackPosition, setLastPlaybackPosition] = useState(0);
    const reachedMilestones = useRef(new Set());

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const { name, length, level, equipment, photo, longText, focusMulti } = route.params;

    // Convert focusMulti array to a comma-separated string
    const focusMultiText = focusMulti.join(', ');
    const levelIcon = 'level-' + level.toLowerCase();

    // Function to start the video playback
    const handleStartWorkout = () => {
        if (videoPlayerRef.current) {
            videoPlayerRef.current.startPlayback();
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
                    reachedMilestones.current.add(milestone);
                }
            });

            // Check if a skip occurred
            if (lastPlaybackPosition !== null && Math.abs(currentPosition - lastPlaybackPosition) > duration * SKIP_THRESHOLD) {
                console.log(`Skip detected from ${lastPlaybackPosition / 1000}s to ${currentPosition / 1000}s`);
            }

            // Update the last playback position
            setLastPlaybackPosition(currentPosition);

            // Additional session tracking logic can be implemented here
        }
    };

    // Scroll Handler for Animated Header
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <ThemedView style={styles.container}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} backButtonColor={themeColors.white} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <ImageTextOverlay
                    image={photo}
                    gradientColors={['transparent', 'rgba(0,0,0,0.4)']}
                    containerStyle={{ height: sizes.imageXLargeHeight, elevation: 5 }}
                />
                <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                    {/* Exercise Name */}
                    <ThemedView style={styles.topCard}>
                        <ThemedView style={styles.titleContainer}>
                            <ThemedText type='titleLarge'>{name}</ThemedText>
                        </ThemedView>

                        {/* Attributes in a Row */}
                        <ThemedView style={[styles.attributeRow, { backgroundColor: themeColors.background }]}>
                            {/* Attribute 1: Length */}
                            <View style={styles.attributeItem}>
                                <Icon name='stopwatch' size={verticalScale(14)} color={themeColors.text} />
                                <ThemedText type='overline' style={[styles.attributeText, { color: themeColors.text }]}>
                                    {length}
                                </ThemedText>
                            </View>

                            {/* Attribute 2: Level */}
                            <View style={styles.attributeItem}>
                                <Icon name={levelIcon} size={verticalScale(12)} color={themeColors.text} />
                                <ThemedText type='overline' style={[styles.attributeText, { color: themeColors.text }]}>
                                    {level}
                                </ThemedText>
                            </View>

                            {/* Attribute 3: Equipment */}
                            <View style={styles.attributeItem}>
                                <Icon name='kettlebell' size={verticalScale(14)} color={themeColors.text} />
                                <ThemedText type='overline' style={[styles.attributeText, { color: themeColors.text }]}>
                                    {equipment}
                                </ThemedText>
                            </View>

                            {/* Attribute 4: Focus */}
                            <View style={styles.attributeItem}>
                                <Icon name='yoga' size={verticalScale(14)} color={themeColors.text} />
                                <ThemedText type='overline' style={[styles.attributeText, { color: themeColors.text }]}>
                                    {focusMultiText}
                                </ThemedText>
                            </View>
                        </ThemedView>
                    </ThemedView>

                    {/* Description Container */}
                    <ThemedView style={[styles.descriptionContainer, { backgroundColor: themeColors.background }]}>
                        <ThemedText type='link' style={{ color: themeColors.text, paddingBottom: spacing.md }}>
                            What to Expect
                        </ThemedText>
                        <ThemedText type='body' style={[{ color: themeColors.text }]}>
                            {longText}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </Animated.ScrollView>
            <FullScreenVideoPlayer
                ref={videoPlayerRef}
                source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            />
            <ThemedView style={styles.buttonContainer}>
                <TextButton
                    text='Start Workout'
                    textType='bodyMedium'
                    style={[styles.startButton, { backgroundColor: themeColors.buttonPrimary }]}
                    onPress={handleStartWorkout}
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
    mainContainer: {
        paddingBottom: verticalScale(120),
    },
    topCard: {
        marginBottom: spacing.xl,
        paddingBottom: spacing.lg,
    },
    titleContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow wrapping if needed
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.xl, // Space between attribute groups
        marginBottom: spacing.sm, // Space below if wrapped
    },
    attributeText: {
        marginLeft: spacing.xs,
        lineHeight: spacing.lg,
    },
    descriptionContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    buttonContainer: {
        flexDirection: 'column', // Column for single button
        alignItems: 'center', // Center horizontally
        position: 'absolute',
        bottom: verticalScale(30),
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    startButton: {
        width: '80%',
        paddingVertical: spacing.md,
    },
});
