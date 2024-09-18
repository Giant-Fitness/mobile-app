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
import MathView from 'react-native-math-view';
import { HighlightedTip } from '@/components/base/HighlightedTip';

interface OneRepMaxCalculatorProps {
    visible: boolean;
    onClose: () => void;
    ormPercentage: number;
}

export const OneRepMaxCalculator: React.FC<OneRepMaxCalculatorProps> = ({ visible, onClose, ormPercentage }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [weight, setWeight] = useState<string>('');
    const [reps, setReps] = useState<string>('');
    const [oneRM, setOneRM] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [isResultVisible, setIsResultVisible] = useState(false);

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
            setIsResultVisible(false);
            return;
        }
        setError('');
        const calculatedOneRM = (w * (1 + r / 30) * ormPercentage) / 100;
        setOneRM(Math.round(calculatedOneRM));
        setIsResultVisible(true); // Show the result and hide the calculator
    };

    return (
        <BottomDrawer visible={visible} onClose={onClose} style={[{ maxHeight: '60%' }]}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header with Title and Close Button */}
                <ThemedView style={styles.header}>
                    <ThemedText type='title' style={styles.headerTitle}>
                        {`Weight Calculator`}
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

                <ThemedText type='bodySmall' style={styles.instructions}>
                    {'Choose a light weight and do as many reps as you can.\nEnter the weight you lifted and the number of reps completed.'}
                </ThemedText>

                {isResultVisible && oneRM ? (
                    <ThemedView style={styles.resultContainer}>
                        {/* Estimated 1RM */}
                        <ThemedView style={styles.resultTitle}>
                            <HighlightedTip
                                tipText={`Recommended weight: ${oneRM} kgs`}
                                disableIcon={true}
                                textType='bodyMedium'
                                containerStyle={{ marginHorizontal: 0, borderRadius: spacing.sm }}
                            />
                        </ThemedView>

                        <TextButton
                            text='Calculate Again'
                            textType='bodyMedium'
                            style={[
                                styles.recalcButton,
                                { backgroundColor: themeColors.background, borderColor: themeColors.text, borderRadius: spacing.sm, flex: 1 },
                            ]}
                            textStyle={[{ color: themeColors.text }]}
                            onPress={() => setIsResultVisible(false)}
                        />
                    </ThemedView>
                ) : (
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
                                text='Calculate'
                                textType='bodyMedium'
                                style={[styles.button, { backgroundColor: themeColors.buttonPrimary }]}
                                onPress={calculateOneRM}
                            />
                        </View>
                    </ThemedView>
                )}

                {/* Methodology */}
                <ThemedView style={{ marginBottom: spacing.md, marginTop: spacing.lg }}>
                    <ThemedView style={{ flexDirection: 'row', marginBottom: spacing.xs, alignItems: 'center' }}>
                        <Icon name='info' size={16} color={themeColors.text} style={styles.infoIcon} />
                        <ThemedText type='buttonSmall' style={styles.subtitle}>
                            How it works
                        </ThemedText>
                    </ThemedView>
                    <ThemedText type='bodySmall' style={styles.methodology}>
                        We use the Epley Formula to estimate your one-rep-max (1RM) and calculate how much weight you should lift based on the intensity of
                        today's workout.
                    </ThemedText>
                    {/* Styled Formula */}
                    <ThemedView style={[styles.formulaContainer, { backgroundColor: themeColors.container, borderColor: themeColors.systemBorderColor }]}>
                        <MathView math={'1RM = Weight \\times (1 + \\frac{Reps}{30})'} />
                    </ThemedView>
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
    recalcButton: {
        borderWidth: StyleSheet.hairlineWidth,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
        width: '60%',
        alignSelf: 'center',
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
    },
    infoIcon: {
        paddingRight: spacing.xs,
    },
    subtitle: {
        textAlign: 'left',
    },
    formulaContainer: {
        padding: spacing.sm,
        borderRadius: spacing.xs,
        borderWidth: StyleSheet.hairlineWidth,
        marginVertical: spacing.sm,
        alignItems: 'center', // Center the formula horizontally
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
        paddingVertical: spacing.md,
        borderRadius: spacing.xs,
        marginHorizontal: spacing.md,
        borderWidth: StyleSheet.hairlineWidth,
        textAlign: 'center',
    },
    calculator: {
        borderRadius: spacing.sm,
        borderWidth: StyleSheet.hairlineWidth,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
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
        marginBottom: spacing.lg,
        textAlign: 'center',
        alignSelf: 'center',
    },
    instructions: {
        marginBottom: spacing.md,
        textAlign: 'left',
    },
});
