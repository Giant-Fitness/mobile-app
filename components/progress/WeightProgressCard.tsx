// components/progress/WeightProgressCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserNutritionGoal, UserWeightMeasurement } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

import { LinearProgressBar } from '../charts/LinearProgressBar';

interface WeightProgressCardProps {
    nutritionGoal: UserNutritionGoal | null;
    userWeightMeasurements: UserWeightMeasurement[];
    onPress: () => void;
    style?: any;
    weightUnit?: string;
}

export const WeightProgressCard: React.FC<WeightProgressCardProps> = ({ nutritionGoal, userWeightMeasurements, onPress, style = {}, weightUnit = 'kgs' }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handlePress = () => {
        trigger('impactLight');
        onPress();
    };

    if (!nutritionGoal || !userWeightMeasurements.length) {
        return null;
    }

    // Calculate weight progress data
    const getCurrentWeight = () => {
        return userWeightMeasurements[0].Weight;
    };

    const getStartingWeight = () => {
        return nutritionGoal.StartingWeight;
    };

    const currentWeight = getCurrentWeight();
    const startingWeight = getStartingWeight();
    const goalWeight = nutritionGoal.TargetWeight;

    const isWeightLoss = startingWeight > goalWeight;
    const isWeightGain = startingWeight < goalWeight;
    const isMaintenance = Math.abs(startingWeight - goalWeight) <= 2;

    // Calculate progress and determine status
    let progressCurrent = 0;
    let progressGoal = 1;
    let progressPercentage = 0;
    let isOffTrack = false;
    let hasExceededGoal = false;

    if (isMaintenance) {
        const deviation = Math.abs(currentWeight - goalWeight);
        const maxDeviation = 2; // Allow 2 units of variation for maintenance

        if (deviation <= maxDeviation) {
            // On track for maintenance
            progressCurrent = Math.max(0, maxDeviation - deviation);
            progressGoal = maxDeviation;
            progressPercentage = Math.min((progressCurrent / progressGoal) * 100, 100);
        } else {
            // Off track - too much deviation
            isOffTrack = true;
            progressCurrent = 0.1; // Show minimal progress for visual consistency
            progressGoal = maxDeviation;
            progressPercentage = 0;
        }
    } else if (isWeightLoss) {
        const weightChange = startingWeight - currentWeight; // Positive if lost weight
        const totalWeightToLose = startingWeight - goalWeight;

        if (weightChange >= totalWeightToLose) {
            // Goal achieved or exceeded
            hasExceededGoal = true;
            progressCurrent = totalWeightToLose;
            progressGoal = totalWeightToLose;
            progressPercentage = 100;
        } else if (weightChange >= 0) {
            // Making progress (losing weight)
            progressCurrent = weightChange;
            progressGoal = totalWeightToLose;
            progressPercentage = Math.min((progressCurrent / progressGoal) * 100, 100);
        } else {
            // Off track (gained weight instead of losing)
            isOffTrack = true;
            progressCurrent = 0.1; // Show minimal progress for visual consistency
            progressGoal = totalWeightToLose;
            progressPercentage = 0;
        }
    } else if (isWeightGain) {
        const weightChange = currentWeight - startingWeight; // Positive if gained weight
        const totalWeightToGain = goalWeight - startingWeight;

        if (weightChange >= totalWeightToGain) {
            // Goal achieved or exceeded
            hasExceededGoal = true;
            progressCurrent = totalWeightToGain;
            progressGoal = totalWeightToGain;
            progressPercentage = 100;
        } else if (weightChange >= 0) {
            // Making progress (gaining weight)
            progressCurrent = weightChange;
            progressGoal = totalWeightToGain;
            progressPercentage = Math.min((progressCurrent / progressGoal) * 100, 100);
        } else {
            // Off track (lost weight instead of gaining)
            isOffTrack = true;
            progressCurrent = 0.1; // Show minimal progress for visual consistency
            progressGoal = totalWeightToGain;
            progressPercentage = 0;
        }
    }

    // Ensure we have a minimum goal to avoid division by zero
    progressGoal = Math.max(0.1, progressGoal);

    // Calculate subtitle text
    const getSubtitleText = () => {
        if (hasExceededGoal) {
            const excess = Math.abs(currentWeight - goalWeight);
            if (isWeightLoss) {
                return excess > 0 ? `${excess.toFixed(1)} ${weightUnit} past goal` : 'Goal achieved';
            } else if (isWeightGain) {
                return excess > 0 ? `${excess.toFixed(1)} ${weightUnit} past goal` : 'Goal achieved';
            } else {
                return 'Goal achieved';
            }
        } else if (isOffTrack) {
            if (isWeightLoss) {
                const gained = Math.abs(currentWeight - startingWeight);
                return `${gained.toFixed(1)} ${weightUnit} gained`;
            } else if (isWeightGain) {
                const lost = Math.abs(startingWeight - currentWeight);
                return `${lost.toFixed(1)} ${weightUnit} lost`;
            } else {
                const deviation = Math.abs(currentWeight - goalWeight);
                return `${deviation.toFixed(1)} ${weightUnit} from target`;
            }
        } else if (isMaintenance) {
            const deviation = Math.abs(currentWeight - goalWeight);
            return deviation <= 1 ? 'Within target range' : `${deviation.toFixed(1)} ${weightUnit} from target`;
        } else {
            const remaining = Math.abs(goalWeight - currentWeight);
            return `${remaining.toFixed(1)} ${weightUnit} to go`;
        }
    };

    // Common divider styling for consistent placement
    const dividerStyle = [
        styles.divider,
        {
            borderBottomColor: themeColors.systemBorderColor,
            borderBottomWidth: StyleSheet.hairlineWidth,
        },
    ];

    // Display text based on status
    const getDisplayText = () => {
        if (hasExceededGoal) {
            return 'Goal Achieved!';
        } else if (isOffTrack) {
            return 'Off Track';
        } else if (isMaintenance && progressPercentage > 80) {
            return 'Maintaining';
        } else {
            return `${Math.round(progressPercentage)}%`;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                styles.shadowContainer,
                {
                    backgroundColor: themeColors.background,
                },
                style,
            ]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <ThemedText type='button'>Weight Goal</ThemedText>
                    <ThemedText type='bodySmall' style={[styles.subtitle, { color: themeColors.subText }]}>
                        {getSubtitleText()}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <LinearProgressBar
                    current={progressCurrent}
                    goal={progressGoal}
                    color={themeColors.tangerineSolid}
                    backgroundColor={themeColors.tangerineTransparent}
                />
            </View>

            <View style={dividerStyle} />
            <View style={styles.footerContainer}>
                <ThemedText type='overline' style={[{ color: themeColors.subText }]}>
                    {getDisplayText()}
                </ThemedText>
                <Icon name='chevron-forward' size={14} color={themeColors.subText} style={{ marginTop: Spaces.XXS }} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    card: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
    },
    subtitle: {
        marginBottom: Spaces.MD,
    },
    progressContainer: {
        marginBottom: Spaces.SM,
    },
    divider: {
        marginTop: Spaces.SM,
        marginBottom: Spaces.XS,
        width: '100%',
        alignSelf: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
});
