// components/programs/ActiveProgramDayCompressedCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RootState } from '@/store/store';
import { debounce } from '@/utils/debounce';
import { moderateScale } from '@/utils/scaling';
import React, { useMemo, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import { useSelector } from 'react-redux';

import { ImageTextOverlay } from '../media/ImageTextOverlay';

type ActiveProgramDayCompressedCardProps = {
    source: 'home';
    showBadge?: boolean;
    badgeText?: string;
    badgeIcon?: string;
};

export const ActiveProgramDayCompressedCard: React.FC<ActiveProgramDayCompressedCardProps> = ({
    source,
    showBadge = true,
    badgeText = 'Start',
    badgeIcon = 'play',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const shadowColor = 'rgba(0,0,0,0.2)';
    const { workouts } = useSelector((state: RootState) => state.workouts);

    const { userProgramProgress } = useSelector((state: RootState) => state.user);
    const { programDays, programDaysState } = useSelector((state: RootState) => state.programs);

    const programId = userProgramProgress?.ProgramId;
    const dayId = userProgramProgress?.CurrentDay;

    const currentDay = programId && dayId ? programDays[programId]?.[dayId] : null;
    const currentDayState = programId && dayId ? programDaysState[programId]?.[dayId] : REQUEST_STATE.IDLE;

    // Animation values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const badgeScaleAnim = useRef(new Animated.Value(1)).current;

    // Memoize the display image to prevent recalculation on every render
    const displayImage = useMemo(() => {
        if (!currentDay) return null;

        if (currentDay.Type === 'video' && currentDay.WorkoutId && workouts[currentDay.WorkoutId]) {
            return { uri: workouts[currentDay.WorkoutId].PhotoUrl };
        }
        return { uri: currentDay.PhotoUrl };
    }, [currentDay?.DayId, currentDay?.Type, currentDay?.WorkoutId, currentDay?.PhotoUrl, workouts]);

    // Cache the title to prevent unnecessary updates
    const dayTitle = useMemo(() => currentDay?.DayTitle, [currentDay?.DayId, currentDay?.DayTitle]);

    // Create a stable key based on the day ID
    const imageKey = useMemo(() => `program-day-${dayId}-${displayImage?.uri}`, [dayId, displayImage?.uri]);

    // Show error only if we have no data
    if (currentDayState === REQUEST_STATE.REJECTED && !currentDay) {
        return (
            <View style={styles.shadowContainer}>
                <ThemedView style={[styles.cardContainer, { backgroundColor: themeColors.background }]}>
                    <ThemedText>Error loading the current day.</ThemedText>
                </ThemedView>
            </View>
        );
    }

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(badgeScaleAnim, {
                toValue: 0.95,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(badgeScaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
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

    const renderBadge = () => {
        if (!showBadge) return null;

        const badgeColor = themeColors.tangerineSolid;
        const badgeTextColor = themeColors.white;

        return (
            <Animated.View
                style={[
                    styles.floatingBadge,
                    {
                        backgroundColor: badgeColor,
                        shadowColor: shadowColor,
                        transform: [{ scale: badgeScaleAnim }],
                    },
                ]}
            >
                <Icon name={badgeIcon} color={badgeTextColor} size={12} style={{ marginRight: Spaces.XS }} />
                <ThemedText type='buttonSmall' style={[styles.badgeText, { color: badgeTextColor }]}>
                    {badgeText}
                </ThemedText>
            </Animated.View>
        );
    };

    return (
        <Animated.View style={[styles.shadowContainer, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} activeOpacity={1} style={styles.cardContainer}>
                <View style={styles.imageContainer}>
                    <ImageTextOverlay
                        key={imageKey}
                        image={displayImage}
                        title={dayTitle}
                        gradientColors={['transparent', 'rgba(0,0,0,0.65)']}
                        containerStyle={{ height: '100%' }}
                        titleType='title'
                        titleStyle={{ marginRight: 2 * Spaces.XXL, lineHeight: moderateScale(20), marginBottom: 0 }}
                    />
                    {renderBadge()}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: 'rgba(100, 100, 100, 0.3)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
    },
    cardContainer: {
        width: '100%',
        height: Sizes.imageLGHeight,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
    },
    imageContainer: {
        position: 'relative',
        height: '100%',
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
    // Floating badge styles
    floatingBadge: {
        position: 'absolute',
        bottom: Spaces.MD,
        right: Spaces.MD,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
        borderRadius: Spaces.MD,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: Spaces.SM,
        elevation: 3,
        zIndex: 10,
    },
    badgeText: {
        fontSize: 11,
    },
});
