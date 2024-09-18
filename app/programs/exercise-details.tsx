// app/programs/exercise-details.tsx

import React, { useState } from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Button, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Exercise } from '@/types/types';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { sizes } from '@/utils/sizes';
import { spacing } from '@/utils/spacing';
import { TextButton } from '@/components/base/TextButton';
import { IconButton } from '@/components/base/IconButton';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { ThemedText } from '@/components/base/ThemedText';
import { ThumbnailVideoPlayer } from '@/components/video/ThumbnailVideoPlayer';
import { BulletedList } from '@/components/base/BulletedList';
import { Icon } from '@/components/icons/Icon';
import { HighlightedTip } from '@/components/base/HighlightedTip';
import { OneRepMaxCalculator } from '@/components/calculators/OneRepMaxCalculator';

type ExerciseDetailsScreenParams = {
    Exercise: {
        exercise: Exercise;
        isEnrolled: boolean;
    };
};

const ExerciseDetailsScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [isCalculatorVisible, setCalculatorVisible] = useState<boolean>(false);

    const navigation = useNavigation();
    const route = useRoute<RouteProp<ExerciseDetailsScreenParams, 'Exercise'>>();

    const { exercise, isEnrolled } = route.params;

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

    const openCalculator = () => {
        setCalculatorVisible(true);
    };

    const closeCalculator = () => {
        setCalculatorVisible(false);
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
                <ThemedView
                    style={[styles.mainContainer, { backgroundColor: themeColors.backgroundTertiary }, isEnrolled && [{ paddingBottom: verticalScale(120) }]]}
                >
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
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Reps: {exercise.RepsLower}-{exercise.RepsUpper}
                                </ThemedText>
                            </ThemedView>

                            {/* Attribute 2: Sets */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='repeat' style={[{ color: themeColors.text }]} size={verticalScale(14)} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Sets: {exercise.Sets}
                                </ThemedText>
                            </ThemedView>

                            {/* Attribute 3: Rest */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='hourglass' style={[{ color: themeColors.text }]} size={verticalScale(12)} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Rest: {exercise.Rest}
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        {isEnrolled && <HighlightedTip iconName='bulb' tipText={'Quickly find your ideal lifting weight using the Calculator'} />}
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
            <OneRepMaxCalculator visible={isCalculatorVisible} onClose={closeCalculator} ormPercentage={exercise.ORMPercentage} />

            {isEnrolled && (
                <ThemedView style={styles.buttonContainer}>
                    <TextButton
                        text='Log'
                        textType='bodyMedium'
                        style={[styles.logButton, { backgroundColor: themeColors.buttonPrimary }]}
                        onPress={handleLogExercise}
                    />
                    <IconButton
                        iconName='calculator'
                        onPress={openCalculator}
                        iconSize={spacing.lg + spacing.xs}
                        iconColor={themeColors.text}
                        style={styles.calculatorButton}
                    />
                </ThemedView>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        paddingBottom: spacing.xxl,
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
        position: 'absolute',
        bottom: verticalScale(30),
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: spacing.md,
    },
    logButton: {
        width: '75%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginRight: spacing.sm,
    },
    calculatorButton: {
        width: spacing.xxxl,
        height: spacing.xxxl,
        borderRadius: spacing.xxl,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
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
