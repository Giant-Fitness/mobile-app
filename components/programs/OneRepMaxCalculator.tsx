import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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

let MathView;
if (Platform.OS === 'ios') {
    MathView = require('react-native-math-view').default;
}

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

    const weightInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                weightInputRef.current?.focus();
            }, 100);
        } else {
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

    const renderFormula = () => {
        if (Platform.OS === 'ios' && MathView) {
            return <MathView math={'1RM = Weight \\times (1 + \\frac{Reps}{30})'} />;
        }
        return (
            <ThemedText type='bodyMedium' style={styles.formulaText}>
                1RM = Weight × (1 + Reps ÷ 30)
            </ThemedText>
        );
    };

    return (
        <BottomSheet visible={visible} onClose={onClose} style={{ maxHeight: '90%' }}>
            <View style={styles.container}>
                {/* Sticky Header */}
                <ThemedView style={[styles.stickyHeader, { borderBottomColor: themeColors.systemBorderColor }]}>
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

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                >
                    <KeyboardAwareScrollView
                        contentContainerStyle={styles.scrollableContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                        enableOnAndroid={true}
                        enableAutomaticScroll={true}
                    >
                        <ThemedText type='bodySmall' style={styles.instructions}>
                            Choose a light weight and do as many reps as you can. Enter the weight you lifted and the number of reps completed.
                        </ThemedText>

                        {isResultVisible && oneRM ? (
                            <ThemedView style={[styles.resultContainer]}>
                                <ThemedView style={[styles.suggested, { backgroundColor: themeColors.tipBackground }]}>
                                    <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText, textAlign: 'center', marginBottom: Spaces.SM }]}>
                                        {oneRM} kgs
                                    </ThemedText>
                                    <ThemedText type='bodySmall' style={[{ color: themeColors.tipText, textAlign: 'center' }]}>
                                        Suggested Weight
                                    </ThemedText>
                                </ThemedView>
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
                                            ref={weightInputRef}
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
                                                {
                                                    backgroundColor: themeColors.background,
                                                    color: themeColors.text,
                                                    borderColor: themeColors.systemBorderColor,
                                                },
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
                                We use the Epley Formula to estimate your one-rep-max (1RM) and calculate how much weight you should lift based on the intensity
                                of today&apos;s workout.
                            </ThemedText>
                            <ThemedView
                                style={[styles.formulaContainer, { backgroundColor: themeColors.container, borderColor: themeColors.systemBorderColor }]}
                            >
                                {renderFormula()}
                            </ThemedView>
                        </ThemedView>
                    </KeyboardAwareScrollView>
                </KeyboardAvoidingView>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollableContent: {
        flexGrow: 1,
        paddingBottom: Spaces.XXXL,
    },
    stickyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.MD,
        paddingLeft: Spaces.SM,
        marginBottom: Spaces.LG,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerTitle: {
        flex: 1,
    },
    closeButton: {
        paddingLeft: Spaces.XL,
    },
    calculator: {
        marginHorizontal: Spaces.SM,
        marginBottom: Spaces.XL,
        marginTop: Spaces.XS,
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
        marginBottom: Spaces.SM,
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
        marginTop: Spaces.LG,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: Spaces.SM,
    },
    resultContainer: {
        marginTop: Spaces.XS,
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
    suggested: {
        marginHorizontal: Spaces.XXL,
        borderRadius: Spaces.SM,
        alignSelf: 'center',
        paddingVertical: Spaces.XL,
        paddingHorizontal: Spaces.XL,
    },

    methodology: {
        marginVertical: Spaces.LG,
        marginHorizontal: Spaces.SM,
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
    instructions: {
        marginHorizontal: Spaces.SM,
        marginBottom: Spaces.MD,
    },
    formulaText: {
        textAlign: 'center',
        fontFamily: Platform.select({
            ios: 'Courier',
            android: 'monospace',
        }),
        fontSize: moderateScale(13),
    },
});
