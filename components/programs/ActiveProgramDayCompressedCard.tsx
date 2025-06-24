// components/programs/ActiveProgramDayCompressedCard.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RootState } from '@/store/store';
import { ProgramDay, Workout } from '@/types';
import { debounce } from '@/utils/debounce';
import { moderateScale } from '@/utils/scaling';
import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import { useSelector } from 'react-redux';

import { ImageTextOverlay } from '../media/ImageTextOverlay';

const ShimmerPlaceholder = ShimmerPlaceHolder as unknown as React.ComponentType<any>;

type ActiveProgramDayCompressedCardProps = {
    source: 'home';
};

export const ActiveProgramDayCompressedCard: React.FC<ActiveProgramDayCompressedCardProps> = ({ source }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const { workouts } = useSelector((state: RootState) => state.workouts);

    const { userProgramProgress } = useSelector((state: RootState) => state.user);
    const { programDays, programDaysState } = useSelector((state: RootState) => state.programs);

    const programId = userProgramProgress?.ProgramId;
    const dayId = userProgramProgress?.CurrentDay;

    const currentDay = programId && dayId ? programDays[programId]?.[dayId] : null;
    const currentDayState = programId && dayId ? programDaysState[programId]?.[dayId] : REQUEST_STATE.IDLE;

    // Animation value
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const getDisplayImage = (day: ProgramDay, workouts: Record<string, Workout>) => {
        if (day.Type === 'video' && day.WorkoutId && workouts[day.WorkoutId]) {
            return { uri: workouts[day.WorkoutId].PhotoUrl };
        }
        return { uri: day.PhotoUrl };
    };

    // Loading and error states
    if (currentDayState === REQUEST_STATE.PENDING || !currentDay) {
        return (
            <View style={styles.shadowContainer}>
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
        return (
            <View style={styles.shadowContainer}>
                <ThemedView style={[styles.cardContainer, { backgroundColor: themeColors.background }]}>
                    <ThemedText>Error loading the current day.</ThemedText>
                </ThemedView>
            </View>
        );
    }

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const navigateToProgramDay = () => {
        if (programId && dayId) {
            debounce(
                router,
                {
                    pathname: '/(app)/programs/program-day',
                    params: { programId, dayId, source },
                },
                1200,
            );
        }
    };

    const handlePress = () => {
        trigger('impactLight');
        navigateToProgramDay();
    };

    return (
        <Animated.View style={[styles.shadowContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} activeOpacity={1} style={styles.cardContainer}>
                <ImageTextOverlay
                    image={getDisplayImage(currentDay, workouts)}
                    title={currentDay.DayTitle}
                    gradientColors={['transparent', 'rgba(0,0,0,0.65)']}
                    containerStyle={{ height: '100%' }}
                    textContainerStyle={{ bottom: Spaces.LG }}
                    subtitleType='bodySmall'
                    titleType='title'
                    titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20) }}
                    subtitleStyle={{ marginTop: Spaces.XS }}
                />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: 'rgba(0,80,0,0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5,
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
