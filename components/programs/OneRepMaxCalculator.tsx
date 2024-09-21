// components/calculators/OneRepMaxCalculator.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from '@/components/base/Icon';
import { scale, moderateScale } from '@/utils/scaling';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { TextButton } from '@/components/buttons/TextButton';
import MathView from 'react-native-math-view';
import { HighlightedTip } from '@/components/alerts/HighlightedTip';

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
        setIsResultVisible(true);
    };

    return (
        <BottomSheet visible={visible} onClose={onClose} style={{ maxHeight: '60%' }}>
            <View style={styles.container}>
                {/* Sticky Header */}
                <ThemedView style={styles.stickyHeader}>
                    <ThemedText type='title' style={styles.headerTitle}>
                        Weight Calculator
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

                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={styles.scrollableContent} showsVerticalScrollIndicator={false}>
                    <ThemedText type='bodySmall' style={styles.instructions}>
                        Choose a light weight and do as many reps as you can. Enter the weight you lifted and the number of reps completed.
                    </ThemedText>

                    {isResultVisible && oneRM ? (
                        <ThemedView style={styles.resultContainer}>
                            <HighlightedTip
                                tipText={`Suggested Weight: ${oneRM} kgs`}
                                disableIcon={true}
                                textType='link'
                                containerStyle={{
                                    marginHorizontal: 0,
                                    borderRadius: Spaces.SM,
                                    alignSelf: 'center',
                                    textAlign: 'center',
                                    paddingVertical: Spaces.XL,
                                }}
                            />
                            <TextButton
                                text='Calculate Again'
                                textType='bodyMedium'
                                style={[styles.recalcButton, { backgroundColor: themeColors.background, borderColor: themeColors.text, flex: 1 }]}
                                textStyle={[{ color: themeColors.text }]}
                                onPress={() => setIsResultVisible(false)}
                            />
                        </ThemedView>
                    ) : (
                        <ThemedView style={[styles.calculator, { backgroundColor: themeColors.background, borderColor: themeColors.systemBorderColor }]}>
                            <ThemedView style={styles.inputWrapper}>
                                <ThemedView style={styles.inputRow}>
                                    <ThemedText type='buttonSmall' style={styles.label}>
                                        Weight (kgs)
                                    </ThemedText>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.systemBorderColor },
                                        ]}
                                        keyboardType='numeric'
                                        value={weight}
                                        onChangeText={setWeight}
                                        placeholder='0'
                                        placeholderTextColor={themeColors.subText}
                                    />
                                </ThemedView>

                                <ThemedView style={styles.inputRow}>
                                    <ThemedText type='buttonSmall' style={styles.label}>
                                        Reps
                                    </ThemedText>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.systemBorderColor },
                                        ]}
                                        keyboardType='numeric'
                                        value={reps}
                                        onChangeText={setReps}
                                        placeholder='0'
                                        placeholderTextColor={themeColors.subText}
                                    />
                                </ThemedView>
                            </ThemedView>

                            {error && (
                                <ThemedText type='bodySmall' style={[styles.errorText, { color: themeColors.red }]}>
                                    {error}
                                </ThemedText>
                            )}

                            <PrimaryButton
                                text='Calculate'
                                textType='bodyMedium'
                                style={[styles.button, { backgroundColor: themeColors.buttonPrimary }]}
                                onPress={calculateOneRM}
                            />
                        </ThemedView>
                    )}

                    <ThemedView style={styles.methodology}>
                        <ThemedView style={{ flexDirection: 'row', marginBottom: Spaces.SM, alignItems: 'center' }}>
                            <Icon name='info' color={themeColors.text} style={styles.infoIcon} />
                            <ThemedText type='overline' style={styles.subtitle}>
                                How it works
                            </ThemedText>
                        </ThemedView>
                        <ThemedText type='bodySmall' style={styles.methodologyText}>
                            We use the Epley Formula to estimate your one-rep-max (1RM) and calculate how much weight you should lift based on the intensity of
                            today's workout.
                        </ThemedText>
                        <ThemedView style={[styles.formulaContainer, { backgroundColor: themeColors.container, borderColor: themeColors.systemBorderColor }]}>
                            <MathView math={'1RM = Weight \\times (1 + \\frac{Reps}{30})'} />
                        </ThemedView>
                    </ThemedView>
                </ScrollView>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    stickyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.SM,
        zIndex: 10,
    },
    headerTitle: {
        flex: 1,
        fontWeight: '600',
    },
    closeButton: {
        paddingLeft: Spaces.XL,
    },
    scrollableContent: {
        flex: 1,
        paddingTop: Spaces.SM,
        paddingBottom: Spaces.XXXL,
    },
    calculator: {
        marginHorizontal: Spaces.SM,
        marginBottom: Spaces.XL,
        marginTop: Spaces.LG,
        paddingTop: Spaces.XL,
        paddingBottom: Spaces.XL,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.SM,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    inputWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.LG,
    },
    inputRow: {
        flex: 1,
    },
    input: {
        paddingVertical: Spaces.MD,
        borderRadius: Spaces.XS,
        marginHorizontal: Spaces.MD,
        borderWidth: StyleSheet.hairlineWidth,
        textAlign: 'center',
    },
    button: {
        width: '80%',
        alignSelf: 'center',
        borderRadius: Spaces.SM,
        paddingVertical: Spaces.SM + Spaces.XS,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: Spaces.SM,
    },
    resultContainer: {
        marginTop: Spaces.LG,
    },
    recalcButton: {
        width: '60%',
        alignSelf: 'center',
        borderWidth: StyleSheet.hairlineWidth,
        marginVertical: Spaces.LG,
    },
    infoIcon: {
        paddingRight: Spaces.XS,
    },
    subtitle: {
        textAlign: 'left',
    },
    methodology: {
        marginVertical: Spaces.LG,
    },
    methodologyText: {
        marginBottom: Spaces.SM,
    },
    formulaContainer: {
        padding: Spaces.LG,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.XS,
        marginVertical: Spaces.SM,
        alignItems: 'center',
    },
    label: {
        marginBottom: Spaces.XS,
        textAlign: 'center',
    },
});
