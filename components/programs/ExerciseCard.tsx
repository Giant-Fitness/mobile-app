// components/programs/ExerciseCard.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { Exercise } from '@/store/types';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TouchableOpacity } from 'react-native';

type ExerciseCardProps = {
    exercise: Exercise;
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme as 'light' | 'dark'];

    const navigation = useNavigation();

    const navigateToExerciseDetail = () => {
        navigation.navigate('programs/exercise-details', exercise);
    };

    return (
        <ThemedView style={styles.card}>
            <ThemedText type='title' style={styles.title}>
                {exercise.ExerciseName}
            </ThemedText>
            <View style={[styles.divider, { borderBottomColor: themeColors.systemBorderColor }]} />
            <View style={styles.infoContainer}>
                <ThemedText>
                    Reps: {exercise.RepsLower}-{exercise.RepsUpper}
                </ThemedText>
                <ThemedText>Sets: {exercise.Sets}</ThemedText>
                <ThemedText>Rest: {exercise.Rest} mins</ThemedText>
            </View>
            {exercise.QuickTip && (
                <View style={styles.tipContainer}>
                    <Icon name='bulb' size={moderateScale(14)} color={themeColors.text} style={{ marginTop: spacing.xs }} />
                    <ThemedText type='italic' style={styles.quickTip}>
                        {exercise.QuickTip}
                    </ThemedText>
                </View>
            )}
            <View style={[styles.divider, { borderBottomColor: themeColors.systemBorderColor }]} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={[styles.playButton, { backgroundColor: themeColors.background }]} onPress={navigateToExerciseDetail}>
                    <View style={styles.buttonContent}>
                        <ThemedText style={[styles.viewDrillText, { color: themeColors.subText }]}>View Drill</ThemedText>
                        <Icon name='chevron-forward' color={themeColors.subText} />
                    </View>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: spacing.md,
        borderRadius: spacing.sm,
        marginBottom: spacing.lg,
    },
    title: {
        marginBottom: spacing.md,
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: spacing.md,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    quickTip: {
        marginLeft: spacing.xs,
        flex: 1,
    },
    detailsButton: {
        paddingVertical: spacing.sm,
        marginTop: spacing.sm,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: spacing.xs,
    },
    playButton: {
        borderRadius: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        flex: 1,
    },
    viewDrillButton: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    viewDrillText: {
        paddingRight: spacing.sm,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
});
