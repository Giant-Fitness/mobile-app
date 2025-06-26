// components/exercise/ExerciseCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TextButton } from '@/components/buttons/TextButton';
import { ExerciseAlternativesBottomSheet } from '@/components/exercise/ExerciseAlternativesBottomSheet';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { isLongTermTrackedLift } from '@/store/exerciseProgress/utils';
import { RootState } from '@/store/store';
import { Exercise } from '@/types';
import { isExerciseLoggable } from '@/types/exerciseProgressTypes';
import { lightenColor } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import { scale } from '@/utils/scaling';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { format } from 'date-fns';
import { trigger } from 'react-native-haptic-feedback';
import Svg, { Circle } from 'react-native-svg';
import { useSelector } from 'react-redux';

type LogButtonState = {
    type: 'empty' | 'partial' | 'complete';
    progress?: number; // 0-1 for partial
};

type ExerciseCardProps = {
    exercise: Exercise;
    isEnrolled: boolean;
    showLoggingButton?: boolean;
    onLogPress?: (exercise: Exercise) => void;
    exerciseNumber?: number;
    programId?: string;
};

const defaultLogPress = () => {};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    isEnrolled = false,
    showLoggingButton = false,
    onLogPress = defaultLogPress,
    exerciseNumber,
    programId,
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme as 'light' | 'dark'];
    const [showAlternativesSheet, setShowAlternativesSheet] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);

    // Animation value
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const { recentLogs, liftHistory } = useSelector((state: RootState) => state.exerciseProgress);
    const { userExerciseSubstitutions, userExerciseSetModifications } = useSelector((state: RootState) => state.user);
    const { exercises } = useSelector((state: RootState) => state.exercises);

    // Determine if this exercise can be logged
    const canLog = isExerciseLoggable(exercise);

    // Find if this exercise has a substitution
    const substitution = useMemo(() => {
        if (!programId) return null;

        return userExerciseSubstitutions.find(
            (sub) =>
                sub.OriginalExerciseId === exercise.ExerciseId &&
                (sub.ProgramId === programId || sub.ProgramId === null) &&
                // For temporary substitutions, check if it's for today
                (!sub.IsTemporary || (sub.IsTemporary && sub.TemporaryDate === format(new Date(), 'yyyy-MM-dd'))),
        );
    }, [exercise.ExerciseId, programId, userExerciseSubstitutions, forceUpdate]);

    // Get the substituted exercise name (if substituted)
    const substituteExercise = useMemo(() => {
        if (substitution && exercises[substitution.SubstituteExerciseId]) {
            return exercises[substitution.SubstituteExerciseId];
        }
        return null;
    }, [substitution, exercises, forceUpdate]);

    // Find applicable set modification for this exercise
    const setModification = useMemo(() => {
        if (!programId) return null;

        const today = format(new Date(), 'yyyy-MM-dd');
        const exerciseId = substituteExercise ? substituteExercise.ExerciseId : exercise.ExerciseId;

        return userExerciseSetModifications.find(
            (mod) =>
                mod.ExerciseId === exerciseId &&
                mod.ProgramId === programId &&
                mod.OriginalSets === (exercise.Sets ?? 0) &&
                // For temporary modifications, check if it's for today
                (!mod.IsTemporary || (mod.IsTemporary && mod.TemporaryDate === today)),
        );
    }, [exercise.ExerciseId, exercise.Sets, programId, substituteExercise, userExerciseSetModifications, forceUpdate]);

    // Calculate the effective number of sets (original + additional)
    const effectiveSets = useMemo(() => {
        return (exercise.Sets ?? 0) + (setModification?.AdditionalSets || 0);
    }, [exercise.Sets, setModification]);

    // Check if demo video is available - fixed logic
    const hasDemoVideo = useMemo(() => {
        if (substituteExercise) {
            return !!substituteExercise.YTDemoUrl;
        }
        return !!exercise.YTDemoUrl;
    }, [substituteExercise, exercise.YTDemoUrl]);

    // Calculate log button state based on today's progress
    const logButtonState = useMemo<LogButtonState>(() => {
        if (!canLog) return { type: 'empty' };

        const today = format(new Date(), 'yyyy-MM-dd');
        // When logging, we want to log against the substitute exercise ID if it exists
        const exerciseIdToLog = substituteExercise ? substituteExercise.ExerciseId : exercise.ExerciseId;
        const exerciseLogId = `${exerciseIdToLog}#${today}`;

        // Get today's log from either source
        const todaysLog =
            recentLogs[exerciseIdToLog]?.[exerciseLogId] || (isLongTermTrackedLift(exerciseIdToLog) ? liftHistory[exerciseIdToLog]?.[exerciseLogId] : null);

        if (!todaysLog) {
            return { type: 'empty' };
        }

        const loggedSets = todaysLog.Sets.length;
        // Use effective sets (including modifications) for progress calculation
        const requiredSets = effectiveSets;

        if (loggedSets >= requiredSets) {
            return { type: 'complete' };
        }

        return {
            type: 'partial',
            progress: loggedSets / requiredSets,
        };
    }, [exercise.ExerciseId, effectiveSets, substituteExercise, recentLogs, liftHistory, canLog]);

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

    const navigateToExerciseDetail = () => {
        // When navigating to a substituted exercise, we want to keep the workout parameters
        // from the original exercise but show the details of the substituted exercise
        let targetExercise;

        if (substituteExercise) {
            // Create a new object that combines substitute exercise details with original exercise parameters
            targetExercise = {
                ...substituteExercise,
                // Inject the original exercise's workout parameters (with modifications applied)
                Sets: effectiveSets,
                RepsLower: exercise.RepsLower,
                RepsUpper: exercise.RepsUpper,
                Rest: exercise.Rest,
                ORMPercentage: exercise.ORMPercentage, // Include One Rep Max percentage if available
            };
        } else {
            targetExercise = {
                ...exercise,
                // Apply set modifications to original exercise
                Sets: effectiveSets,
            };
        }

        debounce(router, {
            pathname: '/(app)/programs/exercise-details',
            params: {
                exercise: JSON.stringify(targetExercise),
                exerciseId: targetExercise.ExerciseId,
                isEnrolled: isEnrolled.toString(),
            },
        });
    };

    const handleSwapPress = () => {
        setShowAlternativesSheet(true);
    };

    // Handle the bottom sheet closing - trigger a re-render
    const handleSheetClose = () => {
        setShowAlternativesSheet(false);
        // Force a re-render after closing the sheet
        setForceUpdate((prev) => prev + 1);
    };

    // Handle logging with substituted exercise and set modifications
    const handleLogPress = () => {
        // Create a callback to trigger re-render when logging sheet closes
        const onLoggingSheetClose = () => {
            setForceUpdate((prev) => prev + 1);
        };

        // FIXED: Pass the original exercise definition without set modifications applied
        // The ExerciseLoggingSheet will handle modifications internally
        if (substituteExercise) {
            // Create an exercise object that combines the substitute exercise's details
            // with the original exercise's workout parameters (WITHOUT set modifications)
            const logExercise = {
                ...substituteExercise,
                // Keep the original exercise's workout parameters WITHOUT modifications
                Sets: exercise.Sets, // Use original sets count, not effectiveSets
                RepsLower: exercise.RepsLower,
                RepsUpper: exercise.RepsUpper,
                Rest: exercise.Rest,
                ORMPercentage: exercise.ORMPercentage,
                // Add callback for when logging completes
                onLoggingComplete: onLoggingSheetClose,
            };

            // Pass the combined exercise to the log handler
            onLogPress(logExercise);
        } else {
            // No substitution, use the original exercise WITHOUT set modifications
            const logExercise = {
                ...exercise,
                // Don't modify Sets here - let ExerciseLoggingSheet handle it
                // Add callback for when logging completes
                onLoggingComplete: onLoggingSheetClose,
            };
            onLogPress(logExercise);
        }
    };

    const handleDemoPress = async () => {
        const demoUrl = substituteExercise?.YTDemoUrl || exercise.YTDemoUrl;
        if (!demoUrl) return;

        try {
            await Linking.openURL(demoUrl);
            trigger('impactLight');
        } catch (error) {
            console.error('Error opening demo:', error);
            Alert.alert('Error', 'Unable to open demo video');
        }
    };

    const renderLogButton = () => {
        if (!showLoggingButton || !canLog) return null;

        let buttonContent;
        switch (logButtonState.type) {
            case 'complete':
                buttonContent = (
                    <>
                        <Icon name='check' size={16} color={themeColors.buttonPrimaryText} style={styles.buttonIcon} />
                        <ThemedText type='bodyMedium' style={{ color: themeColors.buttonPrimaryText, fontSize: 16 }}>
                            Logged
                        </ThemedText>
                    </>
                );
                break;

            case 'partial':
                const progress = logButtonState.progress || 0;
                const size = 16;
                const strokeWidth = 2;
                const radius = (size - strokeWidth) / 2;
                const circumference = radius * 2 * Math.PI;
                const strokeDashoffset = circumference - progress * circumference;

                buttonContent = (
                    <>
                        <View style={styles.progressRing}>
                            <Svg width={size} height={size}>
                                {/* Background circle */}
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={lightenColor(themeColors.buttonPrimary, 0.3)}
                                    strokeWidth={strokeWidth}
                                    fill='none'
                                />
                                {/* Progress circle */}
                                <Circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={themeColors.buttonPrimaryText}
                                    strokeWidth={strokeWidth}
                                    fill='none'
                                    strokeDasharray={`${circumference} ${circumference}`}
                                    strokeDashoffset={strokeDashoffset}
                                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                    strokeLinecap='butt'
                                />
                            </Svg>
                        </View>
                        <ThemedText type='bodyMedium' style={{ color: themeColors.buttonPrimaryText, fontSize: 16 }}>
                            Log
                        </ThemedText>
                    </>
                );
                break;

            default:
                buttonContent = (
                    <ThemedText type='bodyMedium' style={{ color: themeColors.buttonPrimaryText, fontSize: 16 }}>
                        Log
                    </ThemedText>
                );
        }

        return (
            <TextButton
                onPress={handleLogPress}
                style={[
                    styles.logButton,
                    { backgroundColor: lightenColor(themeColors.buttonPrimary, 0.1) },
                    // Apply 50-50 width when both buttons are present
                    hasDemoVideo ? styles.halfWidthButton : styles.fullWidthButton,
                ]}
                haptic='impactLight'
                hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
            >
                {buttonContent}
            </TextButton>
        );
    };

    // Get appropriate label for reps/time display
    const getMetricLabel = () => {
        if (exercise.LoggingType === 'time') {
            return 'secs';
        }
        return 'Reps';
    };

    const getMetricRange = () => {
        if (exercise.LoggingType === 'time') {
            // For time-based exercises, show the time range if available
            return exercise.RepsLower && exercise.RepsUpper ? `${exercise.RepsLower}-${exercise.RepsUpper}` : 'Target';
        }
        return `${exercise.RepsLower}-${exercise.RepsUpper}`;
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                activeOpacity={1}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={navigateToExerciseDetail}
                style={[
                    styles.card,
                    {
                        backgroundColor: themeColors.background,
                        borderColor: themeColors.systemBorderColor,
                    },
                    Platform.OS === 'ios' ? styles.shadowIOS : styles.shadowAndroid,
                ]}
            >
                <ThemedView style={[styles.titleContainer, { backgroundColor: 'transparent' }]}>
                    <View style={styles.titleRow}>
                        <View style={styles.exerciseNameContainer}>
                            <ThemedText type='titleLarge' style={[{ color: themeColors.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                                {exerciseNumber ? (
                                    <ThemedText type='titleLarge' style={[{ color: lightenColor(themeColors.text, 0.7), fontSize: scale(16) }]}>
                                        #{exerciseNumber}{' '}
                                    </ThemedText>
                                ) : null}
                                {substituteExercise ? substituteExercise.ExerciseName : exercise.ExerciseName}
                            </ThemedText>

                            {/* Substitution and modification tags */}
                            {substitution && (
                                <View style={styles.substitutionTag}>
                                    <Icon name='swap' size={14} color={themeColors.tangerineSolid} />
                                    <ThemedText type='caption' style={[styles.substitutionText, { color: themeColors.tangerineSolid }]}>
                                        {substitution.IsTemporary ? 'Today only' : 'Substituted'}
                                    </ThemedText>
                                </View>
                            )}

                            {setModification && (
                                <View style={styles.modificationTag}>
                                    <ThemedText type='caption' style={[styles.modificationText, { color: themeColors.tangerineSolid }]}>
                                        {setModification.IsTemporary
                                            ? `+${setModification.AdditionalSets} sets today`
                                            : `+${setModification.AdditionalSets} sets`}
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        {/* Swap Icon Button */}
                        {isEnrolled && (
                            <TouchableOpacity
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleSwapPress();
                                    trigger('impactLight');
                                }}
                                style={styles.swapButton}
                                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                            >
                                <Icon name='swap' size={24} color={substitution ? themeColors.tangerineSolid : lightenColor(themeColors.iconSelected, 0.15)} />
                            </TouchableOpacity>
                        )}
                    </View>
                </ThemedView>

                {/* Info containers and tip remain the same */}
                <ThemedView style={styles.infoContainer}>
                    <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                        <View style={styles.setsContainer}>
                            <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                                {effectiveSets}
                            </ThemedText>
                        </View>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                            Sets
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                        <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                            {getMetricRange()}
                        </ThemedText>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                            {getMetricLabel()}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                        <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                            {exercise.Rest}s
                        </ThemedText>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                            Rest
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                {(substituteExercise?.QuickTip || exercise.QuickTip) && (
                    <ThemedView style={styles.tipContainer}>
                        <Icon name='bulb' size={Sizes.fontSizeDefault} color={themeColors.text} style={{ marginTop: Spaces.XS }} />
                        <ThemedText type='italic' style={styles.quickTip}>
                            {substituteExercise?.QuickTip || exercise.QuickTip}
                        </ThemedText>
                    </ThemedView>
                )}

                {/* Button container - updated for 50-50 layout */}
                <View style={styles.buttonContainer}>
                    {/* Demo button - only show if demo exists */}
                    {hasDemoVideo && (
                        <TextButton
                            text='Demo'
                            iconName='play'
                            iconSize={14}
                            iconColor={lightenColor(themeColors.text, 0.15)}
                            onPress={handleDemoPress}
                            textType='bodyMedium'
                            style={[
                                {
                                    borderRadius: Spaces.SM,
                                },
                                // Apply 50-50 width when both buttons are present
                                isEnrolled && showLoggingButton && canLog ? styles.halfWidthButton : styles.fullWidthButton,
                            ]}
                        />
                    )}

                    {/* Log button */}
                    {isEnrolled && showLoggingButton && renderLogButton()}
                </View>
            </TouchableOpacity>

            {/* Exercise Alternatives Bottom Sheet */}
            <ExerciseAlternativesBottomSheet visible={showAlternativesSheet} onClose={handleSheetClose} exercise={exercise} programId={programId} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    exerciseNameContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    substitutionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    substitutionText: {
        marginLeft: 4,
        fontStyle: 'italic',
    },
    modificationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    modificationText: {
        marginLeft: 4,
        fontStyle: 'italic',
        opacity: 0.8,
    },
    setsContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    card: {
        borderRadius: Spaces.SM,
        marginBottom: Spaces.MD,
        position: 'relative',
        paddingBottom: Spaces.LG,
        borderWidth: StyleSheet.hairlineWidth,
    },
    shadowIOS: {
        shadowColor: '#777',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    shadowAndroid: {
        elevation: 5,
    },
    titleContainer: {
        paddingHorizontal: Spaces.LG,
        borderTopLeftRadius: Spaces.SM,
        borderTopRightRadius: Spaces.SM,
        paddingTop: Spaces.MD,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.LG,
        paddingTop: Spaces.MD,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spaces.MD,
        paddingHorizontal: Spaces.LG,
    },
    quickTip: {
        marginLeft: Spaces.XS,
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spaces.SM,
        marginHorizontal: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.SM,
        gap: Spaces.MD, // Add gap between buttons for better spacing
    },
    infoBox: {
        padding: Spaces.LG,
        borderRadius: Spaces.SM,
        marginHorizontal: Spaces.XS,
        alignItems: 'center',
    },
    logButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Spaces.SM,
    },
    halfWidthButton: {
        flex: 1,
    },
    fullWidthButton: {
        flex: 1,
    },
    buttonIcon: {
        marginRight: Spaces.XS,
    },
    progressRing: {
        marginRight: Spaces.MD,
        marginTop: 1,
    },
    swapButton: {
        padding: Spaces.XS,
    },
});
