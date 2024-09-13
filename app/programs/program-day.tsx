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
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';
import { RouteProp } from '@react-navigation/native';
import { ProgramDay } from '@/store/types';

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

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={sizes.imageLargeHeight} headerInterpolationEnd={sizes.imageLargeHeight + spacing.xxl} />
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
                <TopImageInfoCard
                    image={{ uri: day.PhotoUrl }}
                    title={day.WorkoutDayTitle}
                    subtitle={`Week ${day.Week} Day ${day.Day}`} // Updated subtitle
                    titleType='titleXLarge'
                    subtitleStyle={{ marginBottom: spacing.lg, color: themeColors.subText, marginTop: 0 }}
                    titleStyle={{ marginBottom: spacing.sm }}
                    containerStyle={{ elevation: 5, marginBottom: spacing.sm }}
                    contentContainerStyle={{ backgroundColor: themeColors.background, paddingHorizontal: spacing.lg }}
                    imageStyle={{ height: sizes.imageXLargeHeight }}
                    titleFirst={true}
                    extraContent={
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
                                    <Icon name='dumbbell' size={moderateScale(18)} color={themeColors.text} />
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
                    }
                />
                <ThemedView style={[styles.exercisesContainer, { backgroundColor: themeColors.backgroundTertiary }]}>
                    {day.Exercises && day.Exercises.map((exercise) => <ExerciseCard key={exercise.ExerciseId} exercise={exercise} />)}
                </ThemedView>
            </Animated.ScrollView>
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
    subView: {
        marginTop: 4, // Adjust as needed
        alignItems: 'center',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    subText: {
        fontFamily: 'InterMedium',
        fontSize: 12,
    },
    subTextView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: spacing.sm,
    },
    attributeText: {
        marginLeft: spacing.md,
        lineHeight: spacing.lg,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    exercisesContainer: {
        paddingVertical: spacing.xxl,
        marginBottom: 100,
        paddingHorizontal: spacing.md,
    },
});

export default ProgramDayScreen;
