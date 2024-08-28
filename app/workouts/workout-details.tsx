// app/workouts/workout-details.tsx

import React, { useRef } from 'react';
import { StyleSheet, ScrollView, Animated } from 'react-native';
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

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const scrollY = useRef(new Animated.Value(0)).current;
    const videoPlayerRef = useRef<VideoPlayerHandle>(null);

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

    return (
        <ThemedView style={styles.container}>
            <CustomBackButton style={styles.backButton} iconColor={themeColors.white} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                // bounces={false}
                overScrollMode='never'
            >
                <ImageTextOverlay
                    photo={photo}
                    title={name}
                    titleType='titleXXLarge'
                    gradientColors={['transparent', 'rgba(0,0,0,0.4)']}
                    containerStyle={{ height: 500, elevation: 5 }}
                    textContainerStyle={{ bottom: 24 }}
                />

                <ThemedView style={[styles.textContainer]}>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name='stopwatch' size={18} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText]}>
                                {length}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name={levelIcon} size={18} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText]}>
                                {level}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name='dumbbell' size={18} color={themeColors.text} />

                            <ThemedText type='body' style={[styles.attributeText]}>
                                {equipment}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow]}>
                        <ThemedView style={[styles.attribute]}>
                            <Icon name='yoga' size={18} color={themeColors.text} />
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
            <FullScreenVideoPlayer ref={videoPlayerRef} source={{ uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4' }} />
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
                    iconSize={24}
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
        padding: 16,
        paddingLeft: 24,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 15,
        zIndex: 10,
    },
    textContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 120,
        zIndex: 2,
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
    },
    attributeText: {
        marginLeft: 12,
        lineHeight: 24,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    detailsContainer: {
        paddingTop: 18,
        paddingBottom: 36,
    },
    detailsText: {
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: '5%',
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    startButton: {
        width: '80%',
        paddingVertical: 16,
        marginRight: '2%',
    },
    notesButton: {
        width: '18%', // Fixed width for the icon button
        height: '100%', // Fixed height for the icon button
        alignItems: 'center',
        alignItems: 'center',
        borderRadius: '100%', // Ensure the button is perfectly circular
    },
});
