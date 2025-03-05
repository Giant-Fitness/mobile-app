// components/programs/ActiveProgramDayCompressedCard.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { ImageTextOverlay } from '../media/ImageTextOverlay';
import { router } from 'expo-router';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { LinearGradient } from 'expo-linear-gradient';
import { Workout } from '@/types';
import { ProgramDay } from '@/types';
import { debounce } from '@/utils/debounce';

// Cast ShimmerPlaceHolder to the correct type
const ShimmerPlaceholder = ShimmerPlaceHolder as unknown as React.ComponentType<any>;

type ActiveProgramDayCompressedCardProps = {};

export const ActiveProgramDayCompressedCard: React.FC<ActiveProgramDayCompressedCardProps> = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const { workouts } = useSelector((state: RootState) => state.workouts);

    const { userProgramProgress } = useSelector((state: RootState) => state.user);
    const { programDays, programDaysState } = useSelector((state: RootState) => state.programs);

    const programId = userProgramProgress?.ProgramId;
    const dayId = userProgramProgress?.CurrentDay;

    const currentDay = programId && dayId ? programDays[programId]?.[dayId] : null;
    const currentDayState = programId && dayId ? programDaysState[programId]?.[dayId] : REQUEST_STATE.IDLE;

    const getDisplayImage = (day: ProgramDay, workouts: Record<string, Workout>) => {
        if (day.Type === 'video' && day.WorkoutId && workouts[day.WorkoutId]) {
            return { uri: workouts[day.WorkoutId].PhotoUrl };
        }
        return { uri: day.PhotoUrl };
    };

    // Loading and error states are handled below
    if (currentDayState === REQUEST_STATE.PENDING || !currentDay) {
        // Render shimmer effect
        return (
            <View style={[styles.shadowContainer, { backgroundColor: themeColors.background }]}>
                <ShimmerPlaceholder
                    LinearGradient={LinearGradient}
                    style={styles.shimmerContainer}
                    shimmerColors={colorScheme === 'dark' ? ['#1A1A1A', '#2A2A2A', '#1A1A1A'] : ['#D0D0D0', '#E0E0E0', '#D0D0D0']}
                    autoRun={true}
                >
                    <View style={styles.shimmerContent}>
                        <View style={styles.shimmerImage} />
                        <View style={styles.shimmerTextContainer}>
                            <View style={styles.shimmerTitle} />
                            <View style={styles.shimmerSubtitle} />
                        </View>
                    </View>
                </ShimmerPlaceholder>
            </View>
        );
    }

    if (currentDayState === REQUEST_STATE.REJECTED || !currentDay) {
        // Render an error message or placeholder
        return (
            <ThemedView style={[styles.cardContainer, { backgroundColor: themeColors.background }]}>
                <ThemedText>Error loading the current day.</ThemedText>
            </ThemedView>
        );
    }

    const navigateToProgramDay = () => {
        if (programId && dayId) {
            debounce(
                router,
                {
                    pathname: '/(app)/programs/program-day',
                    params: {
                        programId,
                        dayId,
                    },
                },
                1200,
            );
        }
    };

    const day = currentDay;

    return (
        <View style={[styles.shadowContainer, { backgroundColor: themeColors.background }]}>
            <TouchableOpacity onPress={navigateToProgramDay} style={styles.cardContainer} activeOpacity={1}>
                <ImageTextOverlay
                    image={getDisplayImage(currentDay, workouts)}
                    title={day.DayTitle}
                    gradientColors={['transparent', 'rgba(0,0,0,0.65)']}
                    containerStyle={{ height: '100%' }}
                    textContainerStyle={{ bottom: Spaces.LG }}
                    subtitleType='bodySmall'
                    titleType='title'
                    titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20) }}
                    subtitleStyle={{ marginTop: Spaces.XS }}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: 'rgba(0,80,0,0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
        borderRadius: Spaces.SM, // Match the child border radius
    },
    cardContainer: {
        width: '100%',
        height: Sizes.imageLGHeight,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
    },
    shimmerContainer: {
        width: '100%',
        height: Sizes.imageLGHeight,
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    shimmerContent: {
        flex: 1,
        padding: Spaces.MD,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shimmerImage: {
        width: '100%',
        height: '70%',
        borderRadius: Spaces.SM,
        marginBottom: Spaces.SM,
    },
    shimmerTextContainer: {
        width: '80%',
    },
    shimmerTitle: {
        width: '60%',
        height: 20,
        borderRadius: 4,
        marginBottom: Spaces.XXS,
    },
    shimmerSubtitle: {
        width: '40%',
        height: 14,
        borderRadius: 4,
    },
});
