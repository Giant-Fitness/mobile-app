// components/programs/ExerciseCard.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { Exercise } from '@/store/types';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TextButton } from '@/components/base/TextButton';

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
        navigation.navigate('programs/exercise-details', exercise);
    };

    return (
        <ThemedView style={[styles.card, { backgroundColor: themeColors.background }]}>
            <ThemedView style={[styles.titleContainer, { backgroundColor: themeColors.background }]}>
                <ThemedText type='titleLarge' style={[{ color: themeColors.text }]}>
                    {exercise.ExerciseName}
                </ThemedText>
            </ThemedView>
            <View style={[styles.divider, { borderBottomColor: themeColors.systemBorderColor }]} />
            <ThemedView style={styles.infoContainer}>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <ThemedText type='bodyMedium'>{exercise.Sets}</ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                        Sets
                    </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <ThemedText type='bodyMedium'>
                        {exercise.RepsLower}-{exercise.RepsUpper}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
                        Reps
                    </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <ThemedText type='bodyMedium'>{exercise.Rest}</ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.subText }]}>
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
        marginBottom: spacing.xl,
        position: 'relative',
        paddingBottom: spacing.lg,
    },
    titleContainer: {
        padding: spacing.md,
        borderTopLeftRadius: spacing.sm,
        borderTopRightRadius: spacing.sm,
        paddingBottom: spacing.sm,
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        width: '90%',
        alignSelf: 'center',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        paddingTop: spacing.lg,
        backgroundColor: 'transparent',
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
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
        margin: spacing.xs,
        alignItems: 'center',
    },
});
