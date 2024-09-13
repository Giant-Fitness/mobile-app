// app/programs/exercise-details.tsx

import React from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Exercise } from '@/store/types';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { sizes } from '@/utils/sizes';
import { spacing } from '@/utils/spacing';
import { TextButton } from '@/components/base/TextButton';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { ThemedText } from '@/components/base/ThemedText';
import { ThumbnailVideoPlayer } from '@/components/video/ThumbnailVideoPlayer';
import { BulletedList } from '@/components/base/BulletedList';
import { Icon } from '@/components/icons/Icon';
import { HighlightedTip } from '@/components/base/HighlightedTip';

type ExerciseDetailsScreenParams = {
    Exercise: {
        exercise: Exercise;
    };
};

const ExerciseDetailsScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigation = useNavigation();
    const route = useRoute<RouteProp<ExerciseDetailsScreenParams, 'Exercise'>>();

    const { exercise } = route.params;

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const handleLogExercise = () => {
        console.log('Log button pressed');
    };
    const handlePlaybackStatusUpdate = (status) => {
        // Handle video playback status if needed
    };

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={sizes.imageLargeHeight} headerInterpolationEnd={sizes.imageLargeHeight + spacing.xxl} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                    <ThumbnailVideoPlayer videoUrl={exercise.VideoUrl} onPlaybackStatusUpdate={handlePlaybackStatusUpdate} thumbnailUrl={exercise.BannerUrl} />
                    <ThemedView style={[styles.topCard, { backgroundColor: themeColors.background }]}>
                        <ThemedView style={styles.titleContainer}>
                            <ThemedText type='titleLarge'>{exercise.ExerciseName}</ThemedText>
                        </ThemedView>

                        {/* Attributes in a Row with Bullets */}
                        <ThemedView style={styles.attributeRow}>
                            {/* Attribute 1: Reps */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='counter' style={[{ color: themeColors.text }]} size={verticalScale(14)} />
                                <ThemedText type='overline' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Reps: {exercise.RepsLower}-{exercise.RepsUpper}
                                </ThemedText>
                            </ThemedView>

                            {/* Attribute 2: Sets */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='repeat' style={[{ color: themeColors.text }]} size={verticalScale(14)} />
                                <ThemedText type='overline' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Sets: {exercise.Sets}
                                </ThemedText>
                            </ThemedView>

                            {/* Attribute 3: Rest */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='hourglass' style={[{ color: themeColors.text }]} size={verticalScale(12)} />
                                <ThemedText type='overline' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Rest: {exercise.Rest}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <HighlightedTip iconName='bulb' tipText={exercise.WeightInstructions} />
                    </ThemedView>

                    <ThemedView style={styles.instructionContainer}>
                        <ThemedText type='link' style={{ color: themeColors.text, paddingBottom: spacing.md }}>
                            Instructions
                        </ThemedText>
                        {/* Render Instructions as a Bulleted List */}
                        <BulletedList items={exercise.InstructionsDetailed} />
                    </ThemedView>
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
    mainContainer: {
        paddingBottom: verticalScale(120),
    },
    titleContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    topCard: {
        marginBottom: spacing.xl,
        paddingBottom: spacing.lg,
    },
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
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: spacing.md,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 2,
        marginLeft: spacing.lg,
        alignSelf: 'flex-start',
    },
    tipIcon: {
        marginRight: spacing.sm,
    },
    instructionContainer: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow wrapping if needed
        alignItems: 'center',
        paddingBottom: spacing.sm,
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
});

export default ExerciseDetailsScreen;
