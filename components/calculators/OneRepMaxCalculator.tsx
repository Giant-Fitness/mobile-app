// components/calculators/OneRepMaxCalculator.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, ScrollView } from 'react-native';
import { BottomDrawer } from '@/components/layout/BottomDrawer';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { spacing } from '@/utils/spacing';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from '@/components/icons/Icon';
import { scale, moderateScale } from '@/utils/scaling';
import { TextButton } from '@/components/base/TextButton';

interface OneRepMaxCalculatorProps {
    visible: boolean;
    onClose: () => void;
}

export const OneRepMaxCalculator: React.FC<OneRepMaxCalculatorProps> = ({ visible, onClose }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [weight, setWeight] = useState<string>('');
    const [reps, setReps] = useState<string>('');
    const [oneRM, setOneRM] = useState<number | null>(null);
    const [error, setError] = useState<string>('');

    // Reset state when the calculator is closed
    useEffect(() => {
        if (!visible) {
            setWeight('');
            setReps('');
            setOneRM(null);
            setError('');
        }
    }, [visible]);

    const calculateOneRM = () => {
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (isNaN(w) || isNaN(r) || r <= 0) {
            setError('Please enter valid numbers for weight and repetitions.');
            setOneRM(null);
            return;
        }
        setError('');
        // Epley Formula: 1RM = w * (1 + r / 30)
        const calculatedOneRM = w * (1 + r / 30);
        setOneRM(Math.round(calculatedOneRM));
    };

    // Percentage table based on Epley formula
    const percentageTable = oneRM
        ? [
              { percentage: 65, weight: Math.round(oneRM * 0.65) },
              { percentage: 75, weight: Math.round(oneRM * 0.75) },
              { percentage: 85, weight: Math.round(oneRM * 0.85) },
              { percentage: 90, weight: Math.round(oneRM * 0.9) },
              { percentage: 95, weight: Math.round(oneRM * 0.95) },
              { percentage: 100, weight: oneRM },
          ]
        : [];

    return (
        <BottomDrawer visible={visible} onClose={onClose}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header with Title and Close Button */}
                <ThemedView style={styles.header}>
                    <ThemedText type='title' style={styles.headerTitle}>
                        One Rep Max (1RM) Calculator
                    </ThemedText>
                    <TouchableOpacity
                        onPress={onClose}
                        style={styles.closeButton}
                        activeOpacity={0.7}
                        accessibilityRole='button'
                        accessibilityLabel='Close Calculator'
                        hitSlop={{ top: scale(20), bottom: scale(20), left: scale(20), right: scale(20) }}
                    >
                        <Icon name='close' size={22} color={themeColors.text} />
                    </TouchableOpacity>
                </ThemedView>

                {/* Explanation of 1RM */}
                <ThemedView style={styles.descriptionContainer}>
                    <ThemedView style={styles.infoIcon}>
                        <Icon name='info' size={14} color={themeColors.subText} />
                    </ThemedView>
                    <ThemedText type='bodySmall' style={[styles.description, { color: themeColors.subText }]}>
                        1RM is the maximum weight that you can lift in a single repetition of an exercise.
                    </ThemedText>
                </ThemedView>

                <ThemedView style={[styles.calculator, { backgroundColor: themeColors.background, borderColor: themeColors.systemBorderColor }]}>
                    {/* Input Fields */}
                    <ThemedView style={styles.inputWrapper}>
                        {/* Weight Input */}
                        <ThemedView style={styles.inputRow}>
                            <ThemedText type='buttonSmall' style={styles.label}>
                                Weight (kgs)
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: themeColors.background,
                                        color: themeColors.text,
                                        borderColor: themeColors.systemBorderColor,
                                    },
                                ]}
                                keyboardType='numeric'
                                value={weight}
                                onChangeText={setWeight}
                                accessibilityLabel='Weight input'
                                placeholder='0'
                                placeholderTextColor={themeColors.subText}
                            />
                        </ThemedView>

                        {/* Reps Input */}
                        <ThemedView style={styles.inputRow}>
                            <ThemedText type='buttonSmall' style={styles.label}>
                                Reps
                            </ThemedText>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: themeColors.background,
                                        color: themeColors.text,
                                        borderColor: themeColors.systemBorderColor,
                                    },
                                ]}
                                keyboardType='numeric'
                                value={reps}
                                onChangeText={setReps}
                                accessibilityLabel='Repetitions input'
                                placeholder='0'
                                placeholderTextColor={themeColors.subText}
                            />
                        </ThemedView>
                    </ThemedView>

                    {/* Error Message */}
                    {error ? (
                        <ThemedText type='bodySmall' style={[styles.errorText, { color: themeColors.red }]}>
                            {error}
                        </ThemedText>
                    ) : null}

                    {/* Calculate Button */}
                    <View>
                        <TextButton
                            text='Calculate 1RM'
                            textType='bodyMedium'
                            style={[styles.button, { backgroundColor: themeColors.buttonPrimary }]}
                            onPress={calculateOneRM}
                        />
                    </View>
                </ThemedView>

                {/* Results */}
                {oneRM && (
                    <ThemedView style={styles.resultContainer}>
                        {/* Estimated 1RM */}
                        <ThemedText type='subtitle' style={styles.resultTitle}>
                            Your Estimated 1RM: {oneRM} kgs
                        </ThemedText>

                        {/* Percentage Table */}
                        <ThemedText type='subtitle' style={styles.subtitle}>
                            1RM Percentage Table
                        </ThemedText>

                        <ThemedView style={[styles.tableHeader, { borderBottomColor: themeColors.systemBorderColor }]}>
                            <ThemedText type='body' style={[styles.tableHeaderText, { color: themeColors.text }]}>
                                % of 1RM
                            </ThemedText>
                            <ThemedText type='body' style={[styles.tableHeaderText, { color: themeColors.text }]}>
                                Weight (kgs)
                            </ThemedText>
                        </ThemedView>

                        {percentageTable.map((row) => (
                            <ThemedView key={row.percentage} style={[styles.tableRow, { borderBottomColor: themeColors.systemBorderColor }]}>
                                <ThemedText type='bodySmall' style={[styles.tableText, { color: themeColors.text }]}>
                                    {row.percentage}%
                                </ThemedText>
                                <ThemedText type='bodySmall' style={[styles.tableText, { color: themeColors.text }]}>
                                    {row.weight} kgs
                                </ThemedText>
                            </ThemedView>
                        ))}
                    </ThemedView>
                )}

                {/* Instructions */}
                <ThemedText type='bodyMedium' style={styles.subtitle}>
                    How to Use the Calculator
                </ThemedText>

                <ThemedText type='bodySmall' style={styles.instructions}>
                    Do a set to failure on any exercise, then enter the weight lifted and the number of reps completed into the calculator.
                </ThemedText>

                {/* Methodology */}
                <ThemedView>
                    <ThemedText type='bodyMedium' style={styles.subtitle}>
                        Methodology
                    </ThemedText>
                    <ThemedText type='bodySmall' style={styles.methodology}>
                        We use the Epley Formula to estimate your 1RM:
                        {'\n'}
                        1RM = Weight × (1 + Reps / 30)
                    </ThemedText>
                </ThemedView>

                {/* Caution */}
                <ThemedView style={{ marginBottom: spacing.md }}>
                    <ThemedView style={{ flexDirection: 'row', marginTop: spacing.lg, alignItems: 'center' }}>
                        <Icon name='warning' size={14} color={themeColors.red} />
                        <ThemedText type='bodyMedium' style={[styles.cautionTitle, { color: themeColors.red }]}>
                            Caution
                        </ThemedText>
                    </ThemedView>
                    <ThemedText type='bodySmall' style={[styles.caution, { color: themeColors.red }]}>
                        Testing your 1RM is not recommended for beginners and should only be performed with an experienced spotter to ensure safety.
                    </ThemedText>
                </ThemedView>
            </ScrollView>
        </BottomDrawer>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.lg,
        paddingBottom: spacing.xl,
    },
    header: {
        marginBottom: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        textAlign: 'left',
        flex: 1,
        paddingRight: spacing.xxxl,
        lineHeight: spacing.md + spacing.sm,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
    },
    descriptionContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'flex-start',
    },
    infoIcon: {
        paddingRight: spacing.xs,
        marginTop: spacing.xs,
    },
    description: {
        marginBottom: spacing.md,
        textAlign: 'left',
        flex: 1,
        flexWrap: 'wrap',
    },
    subtitle: {
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
        textAlign: 'left',
        fontWeight: '600',
    },
    instructions: {
        marginBottom: spacing.sm,
        textAlign: 'left',
    },
    cautionTitle: {
        marginLeft: spacing.xs,
        fontWeight: '600',
    },
    caution: {
        marginBottom: spacing.sm,
        textAlign: 'left',
        flex: 1,
        flexWrap: 'wrap',
    },
    methodology: {
        marginBottom: spacing.sm,
        textAlign: 'left',
    },
    inputWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
    },
    inputRow: {
        flex: 1,
    },
    label: {
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    input: {
        paddingVertical: spacing.sm,
        borderRadius: spacing.xs,
        marginHorizontal: spacing.md,
        borderWidth: StyleSheet.hairlineWidth,
        textAlign: 'center',
    },
    calculator: {
        borderRadius: spacing.md,
        borderWidth: StyleSheet.hairlineWidth,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
        marginHorizontal: spacing.sm,
        marginTop: spacing.sm,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: spacing.md,
    },
    button: {
        paddingVertical: spacing.sm + spacing.xs,
        width: '80%',
        alignSelf: 'center',
        borderRadius: spacing.sm,
    },
    errorText: {
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    resultContainer: {
        marginTop: spacing.lg,
    },
    resultTitle: {
        fontWeight: '700',
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.lg,
    },
    tableHeaderText: {},
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: spacing.lg,
    },
});
