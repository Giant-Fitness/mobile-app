// app/programs/exercise-details.tsx

import React, { useRef, useState } from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Exercise } from '@/store/types';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { sizes } from '@/utils/sizes';
import { spacing } from '@/utils/spacing';
import { TextButton } from '@/components/base/TextButton';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/icons/Icon';
import { FullScreenVideoPlayer, FullScreenVideoPlayerHandle } from '@/components/video/FullScreenVideoPlayer';

type ExerciseDetailsScreenParams = {
    Exercise: {
        exercise: Exercise;
    };
};

const ExerciseDetailsScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigation = useNavigation();
    const route = useRoute<RouteProp<ExerciseDetailsScreenParams, 'Exercise'>>();

    const { exercise } = route.params;

    const scrollY = useSharedValue(0);
    const videoPlayerRef = useRef<FullScreenVideoPlayerHandle>(null);

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleLogExercise = () => {
        console.log('Log button pressed');
    };
    const handlePlaybackStatusUpdate = (status) => {
        console.log('Video Played', status);
    };
    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} title={exercise.ExerciseName} disableColorChange={true} headerBackground={themeColors.background} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingTop: sizes.imageSmall, paddingHorizontal: spacing.lg }}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
            >
                <FullScreenVideoPlayer
                    ref={videoPlayerRef}
                    source={{ uri: exercise.VideoUrl }}
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate} // Pass the handler
                />
                <ThemedView style={styles.infoContainer}>
                    <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <ThemedText type='bodyMedium'>{exercise.Sets}</ThemedText>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                            Sets
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <ThemedText type='bodyMedium'>
                            {exercise.RepsLower}-{exercise.RepsUpper}
                        </ThemedText>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                            Reps
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <ThemedText type='bodyMedium'>{exercise.Rest}</ThemedText>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                            Rest
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
                <ThemedView style={styles.tipContainer}>
                    <Icon name='bulb' size={moderateScale(16)} color={themeColors.subText} style={{ marginRight: spacing.sm, marginTop: spacing.xs }} />
                    <ThemedText type='body' style={{ color: themeColors.subText }}>
                        {exercise.WeightInstructions}
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.instructionContainer}>
                    <ThemedText type='body' style={[]}>
                        {exercise.InstructionsDetailed}
                    </ThemedText>
                </ThemedView>
            </Animated.ScrollView>

            <ThemedView style={styles.buttonContainer}>
                <TextButton
                    text='Log'
                    textType='bodyMedium'
                    style={[styles.logButton, { backgroundColor: themeColors.buttonPrimary }]}
                    onPress={handleLogExercise}
                />
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: '10%',
        position: 'absolute',
        bottom: verticalScale(30),
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    logButton: {
        width: '100%',
        paddingVertical: spacing.md,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.xl,
    },
    instructionContainer: {
        paddingTop: spacing.xl,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        paddingTop: spacing.lg,
        backgroundColor: 'transparent',
    },
    infoBox: {
        padding: spacing.lg,
        borderRadius: spacing.xs,
        margin: spacing.xs,
        alignItems: 'center',
    },
});

export default ExerciseDetailsScreen;
