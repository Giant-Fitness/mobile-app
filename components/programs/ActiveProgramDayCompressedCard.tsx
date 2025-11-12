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

// Helper function to extract base URL without query parameters
const getBaseUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    const urlWithoutQuery = url.split('?')[0];
    return urlWithoutQuery;
};

// CRITICAL: Deep equality function for program day data
const selectCurrentDayDataEqual = (prev: any, next: any) => {
    if (prev === next) return true;
    if (!prev || !next) return prev === next;

    // Compare only the fields we actually use
    return (
        prev.programId === next.programId &&
        prev.dayId === next.dayId &&
        prev.currentDayState === next.currentDayState &&
        prev.currentDay?.DayId === next.currentDay?.DayId &&
        prev.currentDay?.DayTitle === next.currentDay?.DayTitle &&
        prev.currentDay?.Type === next.currentDay?.Type &&
        prev.currentDay?.PhotoUrl === next.currentDay?.PhotoUrl &&
        prev.currentDay?.WorkoutId === next.currentDay?.WorkoutId
    );
};

// Create a memoized selector for the current day data
const selectCurrentDayData = (state: RootState) => {
    const programId = state.user.userProgramProgress?.ProgramId;
    const dayId = state.user.userProgramProgress?.CurrentDay;

    if (!programId || !dayId) {
        return { currentDay: null, currentDayState: REQUEST_STATE.IDLE, programId: null, dayId: null };
    }

    return {
        currentDay: state.programs.programDays[programId]?.[dayId] || null,
        currentDayState: state.programs.programDaysState[programId]?.[dayId] || REQUEST_STATE.IDLE,
        programId,
        dayId,
    };
};

export const ActiveProgramDayCompressedCard: React.FC<ActiveProgramDayCompressedCardProps> = React.memo(
    ({ source, showBadge = true, badgeText = 'Start', badgeIcon = 'play' }) => {
        const colorScheme = useColorScheme() as 'light' | 'dark';
        const themeColors = Colors[colorScheme];
        const shadowColor = 'rgba(0,0,0,0.2)';

        // Use custom equality function to prevent re-renders when values haven't changed
        const { currentDay, currentDayState, programId, dayId } = useSelector(selectCurrentDayData, selectCurrentDayDataEqual);

        // Only select the specific workout we need with deep equality
        const currentWorkout = useSelector(
            (state: RootState) => {
                if (currentDay?.Type === 'video' && currentDay.WorkoutId) {
                    return state.workouts.workouts[currentDay.WorkoutId];
                }
                return null;
            },
            (prev, next) => {
                // Custom equality: only re-render if PhotoUrl actually changed
                if (!prev && !next) return true;
                if (!prev || !next) return false;
                return prev.PhotoUrl === next.PhotoUrl;
            },
        );

        // Animation values
        const scaleAnim = useRef(new Animated.Value(1)).current;
        const badgeScaleAnim = useRef(new Animated.Value(1)).current;

        // CRITICAL FIX: Extract base URL without query parameters for stable key
        const displayImageBaseUrl = useMemo(() => {
            if (!currentDay) return null;

            let fullUrl: string | null = null;
            if (currentDay.Type === 'video' && currentWorkout) {
                fullUrl = currentWorkout.PhotoUrl;
            } else {
                fullUrl = currentDay.PhotoUrl || null;
            }

            return getBaseUrl(fullUrl);
        }, [currentDay?.Type, currentDay?.PhotoUrl, currentWorkout?.PhotoUrl]);

        // Get full URL for the actual image (with credentials)
        const displayImageUri = useMemo(() => {
            if (!currentDay) return null;

            if (currentDay.Type === 'video' && currentWorkout) {
                return currentWorkout.PhotoUrl;
            }
            return currentDay.PhotoUrl;
        }, [currentDay?.Type, currentDay?.PhotoUrl, currentWorkout?.PhotoUrl]);

        // Create stable image object using full URL
        const displayImage = useMemo(() => {
            return displayImageUri ? { uri: displayImageUri } : null;
        }, [displayImageUri]);

        // Cache the title
        const dayTitle = useMemo(() => currentDay?.DayTitle ?? null, [currentDay?.DayTitle]);

        // CRITICAL: Use base URL (without query params) for stable key
        const imageKey = useMemo(() => {
            return `program-day-${dayId}-${displayImageBaseUrl}`;
        }, [dayId, displayImageBaseUrl]);

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
                            title={dayTitle ?? undefined}
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
    },
    (prevProps, nextProps) => {
        return (
            prevProps.source === nextProps.source &&
            prevProps.showBadge === nextProps.showBadge &&
            prevProps.badgeText === nextProps.badgeText &&
            prevProps.badgeIcon === nextProps.badgeIcon
        );
    },
);

ActiveProgramDayCompressedCard.displayName = 'ActiveProgramDayCompressedCard';

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
