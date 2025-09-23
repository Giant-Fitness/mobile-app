// components/nutrition/QuickAddForm.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch } from '@/store/store';
import { addFoodEntryAsync } from '@/store/user/thunks';
import { MealType } from '@/types';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, TextInput as RNTextInput, ScrollView, StyleSheet, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';
import { useDispatch } from 'react-redux';

import { ThemedView } from '../base/ThemedView';

interface QuickAddFormProps {
    selectedMealType: MealType;
    selectedTime: Date;
    onSuccess?: () => void;
}

type FocusedInput = 'protein' | 'carbs' | 'fat' | 'calories' | 'description' | null;

export const QuickAddForm: React.FC<QuickAddFormProps> = ({ selectedMealType, selectedTime, onSuccess }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();

    const [protein, setProtein] = useState<string>('');
    const [carbs, setCarbs] = useState<string>('');
    const [fat, setFat] = useState<string>('');
    const [calories, setCalories] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');
    const [isCaloriesManuallySet, setIsCaloriesManuallySet] = useState(false);
    const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);

    const proteinInputRef = useRef<RNTextInput>(null);
    const carbsInputRef = useRef<RNTextInput>(null);
    const fatInputRef = useRef<RNTextInput>(null);
    const caloriesInputRef = useRef<RNTextInput>(null);
    const descriptionInputRef = useRef<RNTextInput>(null);

    // Auto-focus calories input when component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            caloriesInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Calculate calories (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    const calculateCalories = (): number => {
        const proteinNum = parseFloat(protein) || 0;
        const carbsNum = parseFloat(carbs) || 0;
        const fatNum = parseFloat(fat) || 0;

        return Math.round(proteinNum * 4 + carbsNum * 4 + fatNum * 9);
    };

    const calculatedCalories = calculateCalories();

    // Update calories input with calculated value unless user has manually set it
    useEffect(() => {
        if (!isCaloriesManuallySet) {
            // If all macros are empty, clear calories
            if (!protein && !carbs && !fat) {
                setCalories('');
            }
            // If any macros have values, calculate calories
            else if (protein || carbs || fat) {
                setCalories(calculatedCalories.toString());
            }
        }
    }, [protein, carbs, fat, calculatedCalories, isCaloriesManuallySet]);

    // Handle calories input change
    const handleCaloriesChange = (value: string) => {
        setCalories(value);

        // If calories field is completely cleared, reset manual flag
        if (value === '') {
            setIsCaloriesManuallySet(false);
        }
        // Otherwise, check if it's different from calculated value
        else {
            setIsCaloriesManuallySet(value !== calculatedCalories.toString());
        }
    };

    // Check if form is valid for submission
    const isFormValid = (): boolean => {
        const caloriesNum = parseFloat(calories);
        return !isNaN(caloriesNum) && caloriesNum > 0;
    };

    // Get border color based on focus state
    const getBorderColor = (inputName: FocusedInput): string => {
        if (focusedInput === inputName) {
            return themeColors.slateBlueLight;
        }
        return themeColors.backgroundSecondary;
    };

    const handleSubmit = async () => {
        if (!isFormValid()) {
            setError('Please enter valid calories value');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            // Format the date for API (YYYY-MM-DD)
            const dateString = selectedTime.toISOString().split('T')[0];

            // Format the time as HH:mm:ss in local time
            const timeString = selectedTime.toLocaleTimeString('en-GB', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            });

            const entryData = {
                Name: description || 'Quick Entry',
                EntryType: 'QUICK_MACRO' as const,
                Quantity: 1,
                UserInputValue: 1,
                UserInputUnit: 'serving',
                MealType: selectedMealType,
                Timestamp: timeString, // Now sends HH:mm:ss format
                QuickMacros: {
                    Calories: parseFloat(calories),
                    Protein: parseFloat(protein) || 0,
                    Carbs: parseFloat(carbs) || 0,
                    Fat: parseFloat(fat) || 0,
                },
            };

            await dispatch(
                addFoodEntryAsync({
                    date: dateString,
                    entryData,
                }),
            ).unwrap();

            // Success feedback
            trigger('notificationSuccess');

            // Clear form
            setProtein('');
            setCarbs('');
            setFat('');
            setCalories('');
            setDescription('');
            setIsCaloriesManuallySet(false);
            setFocusedInput(null);

            // Dismiss keyboard
            Keyboard.dismiss();

            // Call success callback if provided
            onSuccess?.();
        } catch (err) {
            console.error('Failed to log quick add entry:', err);
            setError('Failed to log entry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container}>
            {/* Scrollable Input Section */}
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.formContainer}>
                    {/* Error Message */}
                    {error ? (
                        <ThemedText type='bodySmall' style={[styles.errorText, { color: themeColors.red }]}>
                            {error}
                        </ThemedText>
                    ) : null}

                    {/* Calories Row */}
                    <View style={[styles.inputRow, { borderColor: getBorderColor('calories') }]}>
                        <ThemedText type='body' style={[styles.caloriesLabel, { color: themeColors.text }]}>
                            Calories
                        </ThemedText>
                        {/* Always render this space to prevent layout shift */}
                        <ThemedText type='bodySmall' style={[styles.calculatedCaloriesInline, { color: themeColors.subText }]}>
                            {calculatedCalories > 0 ? `Calculated: ${calculatedCalories} cal` : ''}
                        </ThemedText>
                        <RNTextInput
                            ref={caloriesInputRef}
                            style={[styles.inlineInput, { color: themeColors.text }]}
                            value={calories}
                            onChangeText={handleCaloriesChange}
                            placeholder='Required'
                            placeholderTextColor={themeColors.subText}
                            keyboardType='numeric'
                            editable={!isSubmitting}
                            onFocus={() => setFocusedInput('calories')}
                            onBlur={() => setFocusedInput(null)}
                            onSubmitEditing={() => descriptionInputRef.current?.focus()}
                        />
                    </View>

                    {/* Protein Row */}
                    <View style={[styles.inputRow, { borderColor: getBorderColor('protein') }]}>
                        <ThemedText type='body' style={[styles.label, { color: themeColors.text }]}>
                            Protein (g)
                        </ThemedText>
                        <RNTextInput
                            ref={proteinInputRef}
                            style={[styles.inlineInput, { color: themeColors.text }]}
                            value={protein}
                            onChangeText={setProtein}
                            placeholder='Optional'
                            placeholderTextColor={themeColors.subText}
                            keyboardType='numeric'
                            editable={!isSubmitting}
                            onFocus={() => setFocusedInput('protein')}
                            onBlur={() => setFocusedInput(null)}
                            onSubmitEditing={() => carbsInputRef.current?.focus()}
                        />
                    </View>

                    {/* Carbs Row */}
                    <View style={[styles.inputRow, { borderColor: getBorderColor('carbs') }]}>
                        <ThemedText type='body' style={[styles.label, { color: themeColors.text }]}>
                            Carbs (g)
                        </ThemedText>
                        <RNTextInput
                            ref={carbsInputRef}
                            style={[styles.inlineInput, { color: themeColors.text }]}
                            value={carbs}
                            onChangeText={setCarbs}
                            placeholder='Optional'
                            placeholderTextColor={themeColors.subText}
                            keyboardType='numeric'
                            editable={!isSubmitting}
                            onFocus={() => setFocusedInput('carbs')}
                            onBlur={() => setFocusedInput(null)}
                            onSubmitEditing={() => fatInputRef.current?.focus()}
                        />
                    </View>

                    {/* Fat Row */}
                    <View style={[styles.inputRow, { borderColor: getBorderColor('fat') }]}>
                        <ThemedText type='body' style={[styles.label, { color: themeColors.text }]}>
                            Fat (g)
                        </ThemedText>
                        <RNTextInput
                            ref={fatInputRef}
                            style={[styles.inlineInput, { color: themeColors.text }]}
                            value={fat}
                            onChangeText={setFat}
                            placeholder='Optional'
                            placeholderTextColor={themeColors.subText}
                            keyboardType='numeric'
                            editable={!isSubmitting}
                            onFocus={() => setFocusedInput('fat')}
                            onBlur={() => setFocusedInput(null)}
                            onSubmitEditing={() => caloriesInputRef.current?.focus()}
                        />
                    </View>

                    {/* Description Row */}
                    <View style={[styles.inputRow, { borderColor: getBorderColor('description') }]}>
                        <ThemedText type='body' style={[styles.label, { color: themeColors.text }]}>
                            Description
                        </ThemedText>
                        <RNTextInput
                            ref={descriptionInputRef}
                            style={[styles.inlineInput, { color: themeColors.text }]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder='Optional'
                            placeholderTextColor={themeColors.subText}
                            editable={!isSubmitting}
                            onFocus={() => setFocusedInput('description')}
                            onBlur={() => setFocusedInput(null)}
                            onSubmitEditing={handleSubmit}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Log Button */}
            <ThemedView
                style={[
                    styles.buttonContainer,
                    {
                        backgroundColor: 'transparent',
                    },
                ]}
            >
                <PrimaryButton
                    text='Log'
                    onPress={handleSubmit}
                    disabled={!isFormValid()}
                    loading={isSubmitting}
                    size='LG'
                    haptic='impactLight'
                    accessibilityLabel='Log macro entry'
                />
            </ThemedView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Spaces.LG,
    },
    formContainer: {
        paddingVertical: Spaces.MD,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: Spaces.MD,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        borderBottomWidth: 1,
    },
    label: {
        flex: 1,
    },
    caloriesLabel: {
        minWidth: 80, // Fixed width for "Calories" label to make room for calculated value
    },
    calculatedCaloriesInline: {
        flex: 1,
        minWidth: 80,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: Spaces.XS,
    },
    inlineInput: {
        minWidth: 100, // Ensure input has enough space
        textAlign: 'right',
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.MD,
    },
    buttonContainer: {
        marginHorizontal: Spaces.MD,
        marginBottom: Spaces.LG,
    },
});
