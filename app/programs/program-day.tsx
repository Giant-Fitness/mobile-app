// app/programs/program-day.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ExerciseCard } from '@/components/programs/ExerciseCard';
import { Icon } from '@/components/icons/Icon';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';
import { TopImageInfoCard } from '@/components/layout/TopImageInfoCard';
import { moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';
import { RouteProp } from '@react-navigation/native';
import { ProgramDay } from '@/types/types';
import { TextButton } from '@/components/base/TextButton';

type ProgramDayScreenParams = {
    ProgramDay: {
        day: ProgramDay;
    };
};

const ProgramDayScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigation = useNavigation();
    const route = useRoute<RouteProp<ProgramDayScreenParams, 'ProgramDay'>>();

    const { day } = route.params;

    const navigateToAllWorkouts = (initialFilters = {}) => {
        navigation.navigate('workouts/all-workouts', { initialFilters });
    };

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleCompleteDay = () => {
        console.log('Complete Day button pressed');
    };

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={sizes.imageLargeHeight} headerInterpolationEnd={sizes.imageLargeHeight + spacing.xxl} />
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
                <TopImageInfoCard
                    image={{ uri: day.PhotoUrl }}
                    title={day.DayTitle}
                    subtitle={`Week ${day.Week} Day ${day.Day}`} // Updated subtitle
                    titleType='titleXLarge'
                    subtitleStyle={{ marginBottom: spacing.md, color: themeColors.subText, marginTop: 0 }}
                    titleStyle={{ marginBottom: spacing.xs }}
                    containerStyle={{ elevation: 5, marginBottom: 0 }}
                    contentContainerStyle={{ backgroundColor: themeColors.background, paddingHorizontal: spacing.lg }}
                    imageStyle={{ height: sizes.imageXLargeHeight }}
                    titleFirst={true}
                    extraContent={
                        <ThemedView>
                            {day.RestDay ? (
                                <ThemedView style={styles.tipContainer}>
                                    <Icon
                                        name='sleep'
                                        size={moderateScale(16)}
                                        color={themeColors.subText}
                                        style={{ marginRight: spacing.sm, marginTop: spacing.xs }}
                                    />
                                    <ThemedText type='body' style={{ color: themeColors.subText }}>
                                        {'Take it easy today! Focus on recovery and hydration.'}
                                    </ThemedText>
                                </ThemedView>
                            ) : (
                                <ThemedView>
                                    <ThemedView style={styles.attributeRow}>
                                        <ThemedView style={styles.attribute}>
                                            <Icon name='stopwatch' size={moderateScale(18)} color={themeColors.text} />
                                            <ThemedText type='body' style={styles.attributeText}>
                                                {day.Time} mins
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                    <ThemedView style={styles.attributeRow}>
                                        <ThemedView style={styles.attribute}>
                                            <Icon name='kettlebell' size={moderateScale(18)} color={themeColors.text} />
                                            <ThemedText type='body' style={styles.attributeText}>
                                                {day.Equipment.join(', ')}
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                    <ThemedView style={styles.attributeRow}>
                                        <ThemedView style={styles.attribute}>
                                            <Icon name='yoga' size={moderateScale(18)} color={themeColors.text} />
                                            <ThemedText type='body' style={styles.attributeText}>
                                                {day.MuscleGroups.join(', ')}
                                            </ThemedText>
                                        </ThemedView>
                                    </ThemedView>
                                </ThemedView>
                            )}
                        </ThemedView>
                    }
                />
                {!day.RestDay && (
                    <ThemedView style={[styles.exercisesContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                        {day.Exercises && day.Exercises.map((exercise) => <ExerciseCard key={exercise.ExerciseId} exercise={exercise} />)}
                    </ThemedView>
                )}
            </Animated.ScrollView>
            <ThemedView style={styles.buttonContainer}>
                <TextButton
                    text='Finish Day'
                    textType='bodyMedium'
                    style={[styles.completeButton, { backgroundColor: themeColors.buttonPrimary }]}
                    onPress={handleCompleteDay}
                />
                {day.RestDay && ( // Show mobility button only on rest day
                    <TextButton
                        text='Mobility Workouts'
                        textStyle={[{ color: themeColors.text }]}
                        textType='bodyMedium'
                        style={[
                            styles.mobilityButton,
                            {
                                backgroundColor: themeColors.background,
                                borderColor: themeColors.text,
                            },
                        ]}
                        onPress={() => navigateToAllWorkouts({ focus: ['Mobility'] })}
                    />
                )}
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingRight: 8,
        paddingBottom: 90, // Add padding to ensure content doesn't overlap with the bottom bar
    },
    container: {
        marginRight: '27%',
        alignItems: 'center',
    },
    title: {
        fontFamily: 'InterMedium',
        fontSize: 18,
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: spacing.sm,
    },
    attributeText: {
        marginLeft: spacing.sm,
        lineHeight: spacing.lg,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    exercisesContainer: {
        paddingVertical: spacing.lg,
        paddingBottom: 120,
        paddingHorizontal: spacing.md,
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
    completeButton: {
        width: '100%',
        paddingVertical: spacing.md,
    },
    mobilityButton: {
        width: '100%',
        borderWidth: StyleSheet.hairlineWidth,
        paddingVertical: spacing.md,
        marginTop: spacing.md,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.sm,
        backgroundColor: 'transparent',
    },
});

export default ProgramDayScreen;
