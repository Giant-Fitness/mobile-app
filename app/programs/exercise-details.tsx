// app/programs/exercise-details.tsx

import React, { useEffect, useState } from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { Exercise } from '@/types';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { TextButton } from '@/components/buttons/TextButton';
import { ThemedText } from '@/components/base/ThemedText';
import { ThumbnailVideoPlayer } from '@/components/media/ThumbnailVideoPlayer';
import { BulletedList } from '@/components/layout/BulletedList';
import { Icon } from '@/components/base/Icon';
import { OneRepMaxCalculator } from '@/components/programs/OneRepMaxCalculator';

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

    useEffect(() => {
        // Hide header immediately on mount
        const hideHeader = () => {
            navigation.setOptions({
                headerShown: false,
                // Add any other header options you want to override
            });
        };

        // Run immediately and after a small delay to ensure it takes effect
        hideHeader();
        const timer = setTimeout(hideHeader, 1);

        return () => {
            clearTimeout(timer);
            // Optionally restore header on unmount if needed
            navigation.setOptions({ headerShown: true });
        };
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
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.backgroundSecondary }}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Spaces.XXL} headerInterpolationEnd={Sizes.imageLGHeight} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <ThemedView
                    style={[
                        styles.mainContainer,
                        { backgroundColor: themeColors.backgroundSecondary },
                        isEnrolled && exercise.ORMPercentage && [{ paddingBottom: Sizes.bottomSpaceLarge }],
                    ]}
                >
                    <ThumbnailVideoPlayer videoUrl={exercise.VideoUrl} onPlaybackStatusUpdate={handlePlaybackStatusUpdate} thumbnailUrl={exercise.PhotoUrl} />
                    <ThemedView style={[styles.topCard, { backgroundColor: themeColors.background }]}>
                        <ThemedView style={styles.titleContainer}>
                            <ThemedText type='titleLarge'>{exercise.ExerciseName}</ThemedText>
                        </ThemedView>
                        {/* Attributes in a Row with Bullets */}
                        <ThemedView style={styles.attributeRow}>
                            {/* Attribute 1: Reps */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='counter' style={[{ color: themeColors.text }]} size={Sizes.iconSizeSM} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Reps: {exercise.RepsLower}-{exercise.RepsUpper}
                                </ThemedText>
                            </ThemedView>

                            {/* Attribute 2: Sets */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='repeat' style={[{ color: themeColors.text }]} size={Sizes.iconSizeSM} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Sets: {exercise.Sets}
                                </ThemedText>
                            </ThemedView>

                            {/* Attribute 3: Rest */}
                            <ThemedView style={styles.attributeItem}>
                                <Icon name='hourglass' style={[{ color: themeColors.text }]} size={Sizes.iconSizeSM} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                    Rest: {exercise.Rest}s
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        {isEnrolled && exercise.ORMPercentage && (
                            // <HighlightedTip iconName='bulb' tipText={'Quickly find your ideal lifting weight using the Calculator'} />
                            <View style={styles.buttonContainer}>
                                <TextButton
                                    text='Weight Calculator'
                                    textType='buttonSmall'
                                    style={[styles.calculatorButton]}
                                    onPress={openCalculator}
                                    size={'LG'}
                                />
                                {/*                                <PrimaryButton
                                    text='Log Exercise'
                                    textType='buttonSmall'
                                    style={[styles.logButton, { marginLeft: Spaces.XS }]}
                                    onPress={handleLogExercise}
                                    size={'LG'}
                                />*/}
                            </View>
                        )}
                    </ThemedView>

                    <ThemedView style={styles.instructionContainer}>
                        <ThemedText type='subtitle' style={{ color: themeColors.text, paddingBottom: Spaces.MD }}>
                            Instructions
                        </ThemedText>
                        {/* Render Instructions as a Bulleted List */}
                        <BulletedList items={exercise.InstructionsDetailed} />
                    </ThemedView>
                </ThemedView>
            </Animated.ScrollView>
            <OneRepMaxCalculator visible={isCalculatorVisible} onClose={closeCalculator} ormPercentage={exercise.ORMPercentage} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        paddingBottom: Spaces.XXL,
    },
    titleContainer: {
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.MD,
    },
    topCard: {
        marginBottom: Spaces.XL,
        paddingBottom: Spaces.LG,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Spaces.MD,
    },
    logButton: {
        width: '50%',
        borderRadius: Spaces.SM,
    },
    calculatorButton: {
        width: '50%',
        borderRadius: Spaces.SM,
        paddingHorizontal: 0,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.LG,
        borderRadius: Spaces.MD,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 2,
        marginLeft: Spaces.LG,
        alignSelf: 'flex-start',
    },
    tipIcon: {
        marginRight: Spaces.SM,
    },
    instructionContainer: {
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.LG,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow wrapping if needed
        alignItems: 'center',
        paddingBottom: Spaces.SM,
        paddingHorizontal: Spaces.LG,
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spaces.XL, // Space between attribute groups
        marginBottom: Spaces.SM, // Space below if wrapped
    },
    attributeText: {
        marginLeft: Spaces.XS,
        lineHeight: Spaces.LG,
    },
});

export default ExerciseDetailsScreen;
