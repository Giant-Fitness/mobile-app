// components/programs/ExerciseCard.tsx

import React, { useMemo } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
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

type LogButtonState = {
    type: 'empty' | 'partial' | 'complete';
    progress?: number; // 0-1 for partial
};

type ExerciseCardProps = {
    exercise: Exercise;
    isEnrolled: boolean;
    showLoggingButton?: boolean;
    onLogPress?: () => void;
    exerciseNumber?: number;
};

const defaultLogPress = () => {};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    isEnrolled = false,
    showLoggingButton = false,
    onLogPress = defaultLogPress,
    exerciseNumber,
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme as 'light' | 'dark'];

    const { recentLogs, liftHistory } = useSelector((state: RootState) => state.exerciseProgress);

    // Calculate log button state based on today's progress
    const logButtonState = useMemo<LogButtonState>(() => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const exerciseLogId = `${exercise.ExerciseId}#${today}`;

        // Get today's log from either source

        const todaysLog =
            recentLogs[exercise.ExerciseId]?.[exerciseLogId] ||
            (isLongTermTrackedLift(exercise.ExerciseId) ? liftHistory[exercise.ExerciseId]?.[exerciseLogId] : null);

        if (!todaysLog) {
            return { type: 'empty' };
        }

        const loggedSets = todaysLog.Sets.length;
        const requiredSets = exercise.Sets;

        if (loggedSets >= requiredSets) {
            return { type: 'complete' };
        }

        return {
            type: 'partial',
            progress: loggedSets / requiredSets,
        };
    }, [exercise.ExerciseId, exercise.Sets, recentLogs, liftHistory]);

    const navigateToExerciseDetail = () => {
        debounce(router, {
            pathname: '/(app)/programs/exercise-details',
            params: {
                exercise: JSON.stringify(exercise),
                exerciseId: exercise.ExerciseId,
                isEnrolled: isEnrolled.toString(),
            },
        });
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
            <TextButton onPress={onLogPress} style={[styles.logButton, { backgroundColor: lightenColor(themeColors.buttonPrimary, 0.1) }]}>
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
                <View style={[styles.titleRow, { flex: 1 }]}>
                    <ThemedText type='titleLarge' style={[{ color: themeColors.text, flex: 1 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.5}>
                        {exerciseNumber ? (
                            <ThemedText type='titleLarge' style={[{ color: lightenColor(themeColors.text, 0.7), fontSize: scale(16) }]}>
                                #{exerciseNumber}{' '}
                            </ThemedText>
                        ) : null}
                        {exercise.ExerciseName}
                    </ThemedText>
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
            {exercise.QuickTip && (
                <ThemedView style={styles.tipContainer}>
                    <Icon name='bulb' size={Sizes.fontSizeDefault} color={themeColors.text} style={{ marginTop: Spaces.XS }} />
                    <ThemedText type='italic' style={styles.quickTip}>
                        {exercise.QuickTip}
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
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
    detailsButton: {
        paddingVertical: Spaces.SM,
        marginTop: Spaces.SM,
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
});
