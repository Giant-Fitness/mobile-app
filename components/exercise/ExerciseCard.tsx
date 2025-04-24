// components/exercise/ExerciseCard.tsx

import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Exercise } from '@/types';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TextButton } from '@/components/buttons/TextButton';
import { router } from 'expo-router';
import { lightenColor } from '@/utils/colorUtils';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { isLongTermTrackedLift } from '@/store/exerciseProgress/utils';
import { scale } from '@/utils/scaling';
import { debounce } from '@/utils/debounce';
import { ExerciseAlternativesBottomSheet } from '@/components/exercise/ExerciseAlternativesBottomSheet';

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

    const { recentLogs, liftHistory } = useSelector((state: RootState) => state.exerciseProgress);
    const { userExerciseSubstitutions } = useSelector((state: RootState) => state.user);
    const { exercises } = useSelector((state: RootState) => state.exercises);

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

    // Calculate log button state based on today's progress
    const logButtonState = useMemo<LogButtonState>(() => {
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
        const requiredSets = exercise.Sets ?? 0;

        if (loggedSets >= requiredSets) {
            return { type: 'complete' };
        }

        return {
            type: 'partial',
            progress: loggedSets / requiredSets,
        };
    }, [exercise.ExerciseId, exercise.Sets, substituteExercise, recentLogs, liftHistory]);

    const navigateToExerciseDetail = () => {
        // When navigating to a substituted exercise, we want to keep the workout parameters
        // from the original exercise but show the details of the substituted exercise
        let targetExercise;

        if (substituteExercise) {
            // Create a new object that combines substitute exercise details with original exercise parameters
            targetExercise = {
                ...substituteExercise,
                // Inject the original exercise's workout parameters
                Sets: exercise.Sets,
                RepsLower: exercise.RepsLower,
                RepsUpper: exercise.RepsUpper,
                Rest: exercise.Rest,
                ORMPercentage: exercise.ORMPercentage, // Include One Rep Max percentage if available
            };
        } else {
            targetExercise = exercise;
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

    // Handle logging with substituted exercise
    const handleLogPress = () => {
        // If this exercise has a substitution, pass the substitute exercise to the log handler
        if (substituteExercise) {
            // Create an exercise object that combines the substitute exercise's details
            // with the original exercise's workout parameters
            const logExercise = {
                ...substituteExercise,
                // Keep the original exercise's workout parameters
                Sets: exercise.Sets,
                RepsLower: exercise.RepsLower,
                RepsUpper: exercise.RepsUpper,
                Rest: exercise.Rest,
                ORMPercentage: exercise.ORMPercentage,
            };

            // Pass the combined exercise to the log handler
            onLogPress(logExercise);
        } else {
            // No substitution, use the original exercise
            onLogPress(exercise);
        }
    };

    const renderLogButton = () => {
        if (!showLoggingButton) return null;

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
            <TextButton onPress={handleLogPress} style={[styles.logButton, { backgroundColor: lightenColor(themeColors.buttonPrimary, 0.1) }]}>
                {buttonContent}
            </TextButton>
        );
    };

    const repRangeLabel = exercise.LoggingType === 'time' ? 'secs' : 'Reps';

    return (
        <ThemedView
            style={[
                styles.card,
                {
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.systemBorderColor,
                },
                Platform.OS === 'ios' ? styles.shadowIOS : styles.shadowAndroid,
            ]}
        >
            <ThemedView style={[styles.titleContainer, { backgroundColor: themeColors.background }]}>
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

                        {/* Substitution Tag */}
                        {substitution && (
                            <View style={styles.substitutionTag}>
                                <Icon name='swap' size={14} color={themeColors.tangerineSolid} />
                                <ThemedText type='caption' style={[styles.substitutionText, { color: themeColors.tangerineSolid }]}>
                                    {substitution.IsTemporary ? 'Today only' : 'Substituted'}
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    {/* Swap Icon Button */}
                    {isEnrolled && (
                        <TouchableOpacity onPress={handleSwapPress} style={styles.swapButton} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                            <Icon name='swap' size={24} color={substitution ? themeColors.tangerineSolid : themeColors.text} />
                        </TouchableOpacity>
                    )}
                </View>
            </ThemedView>
            <ThemedView style={styles.infoContainer}>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                    <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                        {exercise.Sets}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                        Sets
                    </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                    <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                        {exercise.RepsLower}-{exercise.RepsUpper}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                        {repRangeLabel}
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
            <View style={styles.buttonContainer}>
                <TextButton
                    text='View Guide'
                    onPress={navigateToExerciseDetail}
                    textStyle={[{ color: themeColors.text }]}
                    textType='bodyMedium'
                    style={[
                        {
                            flex: 1,
                            borderRadius: Spaces.SM,
                        },
                    ]}
                />
                {isEnrolled && showLoggingButton && renderLogButton()}
            </View>

            {/* Exercise Alternatives Bottom Sheet */}
            <ExerciseAlternativesBottomSheet
                visible={showAlternativesSheet}
                onClose={handleSheetClose}
                exercise={exercise} // Pass the original exercise for substitution logic
                programId={programId}
            />
        </ThemedView>
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
    },
    infoBox: {
        padding: Spaces.LG,
        borderRadius: Spaces.SM,
        marginHorizontal: Spaces.XS,
        alignItems: 'center',
    },
    logButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Spaces.SM,
        marginLeft: Spaces.LG,
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
