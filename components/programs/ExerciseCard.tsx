// components/programs/ExerciseCard.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { Exercise } from '@/types/types';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TextButton } from '@/components/base/TextButton';
import { HighlightedTip } from '@/components/base/HighlightedTip';

type ExerciseCardProps = {
    exercise: Exercise;
};

type RootStackParamList = {
    'programs/exercise-details': Exercise; // Define the expected parameter type
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme as 'light' | 'dark'];

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigateToExerciseDetail = () => {
        navigation.navigate('programs/exercise-details', {
            exercise: exercise,
        });
    };

    return (
        <ThemedView style={[styles.card, { backgroundColor: themeColors.background }]}>
            <ThemedView style={[styles.titleContainer, { backgroundColor: themeColors.background }]}>
                <ThemedText type='titleLarge' style={[{ color: themeColors.text }]}>
                    {exercise.ExerciseName}
                </ThemedText>
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
                        Reps
                    </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                    <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                        {exercise.Rest}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                        Rest
                    </ThemedText>
                </ThemedView>
            </ThemedView>
            {exercise.QuickTip && (
                <ThemedView style={styles.tipContainer}>
                    <Icon name='bulb' size={moderateScale(14)} color={themeColors.text} style={{ marginTop: spacing.xs }} />
                    <ThemedText type='italic' style={styles.quickTip}>
                        {exercise.QuickTip}
                    </ThemedText>
                </ThemedView>
            )}
            <ThemedView style={styles.buttonContainer}>
                <TextButton
                    text='View Guide'
                    onPress={navigateToExerciseDetail}
                    textStyle={[{ color: themeColors.text }]}
                    textType='bodyMedium'
                    style={[
                        styles.viewDrillButton,
                        {
                            marginRight: spacing.lg,
                            backgroundColor: 'transparent',
                            borderColor: themeColors.text,
                            flex: 1,
                            paddingVertical: spacing.sm + spacing.xxs,
                        },
                    ]}
                />
                <TextButton
                    text='Log'
                    onPress={() => console.log(`Logging exercise: ${exercise.ExerciseName}`)}
                    textType='bodyMedium'
                    textStyle={[{ color: themeColors.background }]}
                    style={[{ flex: 1, paddingVertical: spacing.sm + spacing.xxs, backgroundColor: themeColors.buttonPrimary }]}
                />
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: spacing.sm,
        marginBottom: spacing.md,
        position: 'relative',
        paddingBottom: spacing.lg,
    },
    titleContainer: {
        paddingHorizontal: spacing.lg,
        borderTopLeftRadius: spacing.sm,
        borderTopRightRadius: spacing.sm,
        paddingTop: spacing.md,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.md,
        backgroundColor: 'transparent',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.lg,
        backgroundColor: 'transparent',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
        marginHorizontal: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: 'transparent',
        paddingBottom: spacing.sm,
    },
    viewDrillButton: {
        borderWidth: StyleSheet.hairlineWidth,
    },
    infoBox: {
        padding: spacing.lg,
        borderRadius: spacing.xs,
        marginHorizontal: spacing.xs,
        alignItems: 'center',
    },
});
