// app/(app)/nutrition/edit-meal-item.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { IconButton } from '@/components/buttons/IconButton';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { CircularProgress } from '@/components/charts/CircularProgress';
import { MealSelector, renderMealSelectorContent } from '@/components/nutrition/MealSelector';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch, RootState } from '@/store/store';
import { deleteFoodEntryAsync, updateFoodEntryAsync } from '@/store/user/thunks';
import { FoodEntry, MealType, UpdateFoodEntryParams, UserNutritionGoal } from '@/types';
import { addAlpha } from '@/utils/colorUtils';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, TextInput as RNTextInput, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import DateTimePicker from '@react-native-community/datetimepicker';
import { trigger } from 'react-native-haptic-feedback';
import { useDispatch, useSelector } from 'react-redux';

const formatTimeForDisplay = (date: Date): string => {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${ampm}`;
};

interface ImpactProgressRingProps {
    label: string;
    current: number;
    color: string;
    backgroundColor: string;
}

const ImpactProgressRing: React.FC<ImpactProgressRingProps> = ({ label, current, color, backgroundColor }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={styles.progressRingContainer}>
            <CircularProgress
                current={current}
                goal={100} // Always out of 100% for impact
                color={color}
                backgroundColor={backgroundColor}
                size={70}
                strokeWidth={6}
                arcAngle={360}
                showContent={true}
            >
                <ThemedText type='caption' style={[styles.percentageText, { color: themeColors.text }]}>
                    {current}%
                </ThemedText>
            </CircularProgress>
            <ThemedText type='bodySmall' style={[styles.progressRingLabel, { color: themeColors.subText }]}>
                {label}
            </ThemedText>
        </View>
    );
};

type FocusedInput = 'name' | 'calories' | 'protein' | 'carbs' | 'fat' | 'time' | null;

/**
 * Helper function to find the applicable nutrition goal for a given date
 * @param goals - Array of all nutrition goals sorted by EffectiveDate desc
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns The applicable goal or undefined
 */
const findApplicableGoal = (goals: UserNutritionGoal[] | undefined, dateString: string): UserNutritionGoal | undefined => {
    if (!goals || goals.length === 0) return undefined;

    // Sort goals by EffectiveDate in descending order
    const sortedGoals = [...goals].sort((a, b) => b.EffectiveDate.localeCompare(a.EffectiveDate));

    // Find the first goal where EffectiveDate <= dateString
    const applicableGoal = sortedGoals.find((goal) => goal.EffectiveDate <= dateString);

    // If no applicable goal found, fall back to active goal
    if (!applicableGoal) {
        return sortedGoals.find((goal) => goal.IsActive);
    }

    return applicableGoal;
};

export default function EditMealItemScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    // Get params using expo-router (params are strings; parse serialized FoodEntry)
    const params = useLocalSearchParams<{ food?: string }>();
    const food = useMemo(() => {
        try {
            return params.food ? (JSON.parse(params.food) as FoodEntry) : undefined;
        } catch {
            return undefined;
        }
    }, [params.food]);

    // Get all nutrition goals from Redux state
    const allNutritionGoals = useSelector((state: RootState) => state.user.userNutritionGoalHistory);

    // Get the date string from the food entry
    const date = food?.dateString ?? '';

    // Find the applicable nutrition goal for this date
    const applicableNutritionGoal = useMemo(() => {
        return findApplicableGoal(allNutritionGoals, date);
    }, [allNutritionGoals, date]);

    // Memoize initial time calculation
    const initialTime = useMemo(() => {
        if (food?.Timestamp) {
            const [hours, minutes, seconds] = food.Timestamp.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'));
            return date;
        }
        return new Date();
    }, [food?.Timestamp]);

    // State
    const [selectedMealType, setSelectedMealType] = useState<MealType>(food?.mealType || 'BREAKFAST');
    const [selectedTime, setSelectedTime] = useState(initialTime);
    const [tempSelectedTime, setTempSelectedTime] = useState(initialTime);
    const [showTimeSelector, setShowTimeSelector] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);
    const [showMealSelector, setShowMealSelector] = useState(false);

    // Initialize form state
    const [formData, setFormData] = useState({
        name: food?.Name ?? '',
        calories: food?.QuickMacros.Calories ?? 0,
        protein: food?.QuickMacros.Protein ?? 0,
        carbs: food?.QuickMacros.Carbs ?? 0,
        fat: food?.QuickMacros.Fat ?? 0,
    });

    // Input refs
    const nameInputRef = useRef<RNTextInput>(null);
    const caloriesInputRef = useRef<RNTextInput>(null);
    const proteinInputRef = useRef<RNTextInput>(null);
    const carbsInputRef = useRef<RNTextInput>(null);
    const fatInputRef = useRef<RNTextInput>(null);

    // Memoize calculated calories
    const calculatedCalories = useMemo((): number => {
        const proteinNum = formData.protein || 0;
        const carbsNum = formData.carbs || 0;
        const fatNum = formData.fat || 0;

        return Math.round(proteinNum * 4 + carbsNum * 4 + fatNum * 9);
    }, [formData.protein, formData.carbs, formData.fat]);

    // Memoize border color function
    const getBorderColor = useCallback(
        (inputName: FocusedInput): string => {
            return focusedInput === inputName ? themeColors.slateBlueLight : themeColors.backgroundSecondary;
        },
        [focusedInput, themeColors.slateBlueLight, themeColors.backgroundSecondary],
    );

    // Memoize impact percentages - now using the applicable goal for the date
    const impactPercentages = useMemo(() => {
        if (!applicableNutritionGoal) {
            return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        }

        return {
            calories: Math.round((formData.calories / applicableNutritionGoal.GoalCalories) * 100),
            protein: Math.round((formData.protein / applicableNutritionGoal.GoalMacros.Protein) * 100),
            carbs: Math.round((formData.carbs / applicableNutritionGoal.GoalMacros.Carbs) * 100),
            fat: Math.round((formData.fat / applicableNutritionGoal.GoalMacros.Fat) * 100),
        };
    }, [formData, applicableNutritionGoal]);

    // Memoize original values for comparison
    const originalValues = useMemo(() => {
        if (!food) return null;

        return {
            name: food.Name ?? '',
            calories: food.QuickMacros.Calories ?? 0,
            protein: food.QuickMacros.Protein ?? 0,
            carbs: food.QuickMacros.Carbs ?? 0,
            fat: food.QuickMacros.Fat ?? 0,
            mealType: food.mealType || 'BREAKFAST',
            timestamp: food.Timestamp || '00:00:00', // Store original HH:mm:ss string
        };
    }, [food]);

    // Helper function to convert Date to HH:mm:ss format
    const formatTimeToTimestamp = useCallback((date: Date): string => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }, []);

    // Memoize whether there are any changes
    const hasChanges = useMemo(() => {
        if (!originalValues) return false;

        const currentTimestamp = formatTimeToTimestamp(selectedTime);

        return (
            formData.name !== originalValues.name ||
            formData.calories !== originalValues.calories ||
            formData.protein !== originalValues.protein ||
            formData.carbs !== originalValues.carbs ||
            formData.fat !== originalValues.fat ||
            selectedMealType !== originalValues.mealType ||
            currentTimestamp !== originalValues.timestamp
        );
    }, [formData, selectedMealType, selectedTime, originalValues, formatTimeToTimestamp]);

    // If food entry not found, show error
    if (!food) {
        return (
            <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
                <View style={styles.errorContainer}>
                    <ThemedText type='title'>Food Entry Not Found</ThemedText>
                    <ThemedText type='body' style={styles.errorText}>
                        The food entry you&apos;re trying to edit could not be found.
                    </ThemedText>
                    <PrimaryButton text='Go Back' onPress={() => router.back()} style={styles.errorButton} />
                </View>
            </ThemedView>
        );
    }

    // Handlers
    const handleBack = useCallback(() => {
        trigger('selection');
        router.back();
    }, [router]);

    const handleDelete = useCallback(() => {
        trigger('impactMedium');
        setIsUpdating(true);
        const entryKey = food.entryKey;
        if (!entryKey) {
            setIsUpdating(false);
            Alert.alert('Error', 'Missing entry key for this food entry.');
            return;
        }
        const mealTypeForDelete: MealType = (food as any).mealType ?? (food as any).MealType ?? 'BREAKFAST';

        dispatch(deleteFoodEntryAsync({ date, mealType: mealTypeForDelete, entryKey }))
            .unwrap()
            .then(() => {
                console.log('Food entry deleted successfully');
                router.back();
            })
            .catch((error) => {
                console.error('Failed to delete food entry:', error);
                Alert.alert('Error', 'Failed to delete food entry. Please try again.');
            })
            .finally(() => {
                setIsUpdating(false);
            });
    }, [dispatch, date, food, router]);

    const handleUpdate = useCallback(async () => {
        trigger('impactLight');
        setIsUpdating(true);

        try {
            // Get the entry key - this should come from the food prop
            const entryKey = food?.entryKey;
            if (!entryKey) {
                Alert.alert('Error', 'Missing entry key for this food entry.');
                return;
            }

            // Get the original meal type for the API path
            const originalMealType: MealType = food?.mealType || (food as any)?.MealType || 'BREAKFAST';

            // Convert selectedTime to HH:mm:ss format
            const timestamp = formatTimeToTimestamp(selectedTime);

            // Prepare the update data according to your API structure
            const updateData: UpdateFoodEntryParams & { updatedMealType?: MealType } = {
                Name: formData.name,
                Timestamp: timestamp,
                Quantity: formData.calories > 0 ? 1 : 0, // Use 1 for quick macros
                UserInputValue: formData.calories > 0 ? 1 : 0, // Use 1 for quick macros
                UserInputUnit: food?.UserInputUnit || '1 serving', // Keep existing unit or default
                QuickMacros: {
                    Calories: formData.calories,
                    Protein: formData.protein,
                    Carbs: formData.carbs,
                    Fat: formData.fat,
                },
            };

            // Add updatedMealType if the meal type has changed
            if (selectedMealType !== originalMealType) {
                updateData.UpdatedMealType = selectedMealType;
            }

            // Dispatch the update using the ORIGINAL meal type in the API call
            // (since that's where the entry currently exists)
            await dispatch(
                updateFoodEntryAsync({
                    date,
                    mealType: originalMealType, // Use original meal type for the API path
                    entryKey,
                    updates: updateData,
                }),
            ).unwrap();

            console.log('Food entry updated successfully');

            // Navigate back to food diary
            router.back();
        } catch (error) {
            console.error('Failed to update food entry:', error);
            Alert.alert('Error', 'Failed to update food entry. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    }, [dispatch, date, food, formData, selectedTime, selectedMealType, formatTimeToTimestamp, router]);

    const updateFormField = useCallback((field: keyof typeof formData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    // Handle calories input change
    const handleCaloriesChange = useCallback(
        (value: string) => {
            const num = parseFloat(value) || 0;
            if (num >= 0) {
                updateFormField('calories', num);
            }
        },
        [updateFormField],
    );

    // Time picker handlers
    const handleTimeSelect = useCallback(() => {
        trigger('selection');
        setTempSelectedTime(new Date(selectedTime));

        // Dismiss keyboard first
        Keyboard.dismiss();

        // Small delay to allow keyboard to fully dismiss before showing bottom sheet
        setTimeout(() => {
            setShowTimeSelector(true);
        }, 100);

        setFocusedInput('time');
    }, [selectedTime]);

    const handleDateTimeChange = useCallback((event: any, date?: Date) => {
        if (date) {
            setTempSelectedTime(date);
        }
    }, []);

    const handleTimeSelectorClose = useCallback(() => {
        setShowTimeSelector(false);
        setTempSelectedTime(new Date(selectedTime));
        setFocusedInput(null);
    }, [selectedTime]);

    const handleTimeSelectorDone = useCallback(() => {
        trigger('selection');
        setSelectedTime(new Date(tempSelectedTime));
        setShowTimeSelector(false);
        setFocusedInput(null);
    }, [tempSelectedTime]);

    const handleMealSelect = (mealType: string) => {
        handleMealTypeChange(mealType as MealType);
        setShowMealSelector(false);
    };

    // Meal type handler
    const handleMealTypeChange = useCallback((mealType: MealType) => {
        setSelectedMealType(mealType);
    }, []);

    const handleMealSelectorClose = () => {
        setShowMealSelector(false);
    };

    // Memoize time selector content to avoid recreation
    const timeSelectorContent = useMemo(
        () => (
            <View style={styles.bottomSheetContainer}>
                <ThemedView style={[styles.bottomSheetHeader, { borderBottomColor: themeColors.systemBorderColor }]}>
                    <IconButton onPress={handleTimeSelectorClose} iconName='close' iconSize={18} size={21} style={styles.headerButton} addBorder={false} />

                    <ThemedText type='title'>Select Time</ThemedText>

                    <View style={styles.headerButton} />
                </ThemedView>

                <View style={styles.bottomSheetContent}>
                    <DateTimePicker
                        value={tempSelectedTime}
                        mode='time'
                        display='spinner'
                        onChange={handleDateTimeChange}
                        style={styles.dateTimePicker}
                        themeVariant={colorScheme}
                        textColor={themeColors.text}
                    />

                    <View style={styles.bottomSheetActions}>
                        <TouchableOpacity
                            style={[styles.bottomSheetButton, { backgroundColor: themeColors.surfaceDark }]}
                            onPress={handleTimeSelectorDone}
                            activeOpacity={1}
                        >
                            <ThemedText type='button' style={{ color: themeColors.text }}>
                                Done
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ),
        [themeColors, tempSelectedTime, handleTimeSelectorClose, handleDateTimeChange, handleTimeSelectorDone, colorScheme],
    );

    return (
        <View style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: themeColors.backgroundSecondary }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={1}>
                        <Icon name='close-no-outline' color={themeColors.text} />
                    </TouchableOpacity>

                    <View style={styles.centerSection}>
                        <ThemedText type='title'>Edit Entry</ThemedText>
                    </View>

                    <TouchableOpacity style={styles.headerActionButton} onPress={handleDelete} activeOpacity={1} disabled={isUpdating}>
                        <Icon name='delete' size={Sizes.iconSizeSM} color={themeColors.iconSelected} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content with KeyboardAvoidingView */}
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={[styles.scrollView, { backgroundColor: themeColors.background, borderTopRightRadius: Spaces.SM, borderTopLeftRadius: Spaces.SM }]}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: 100 }, // Add padding to prevent content from being hidden behind button
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                >
                    {/* Form Section */}
                    <View style={[styles.section, { backgroundColor: themeColors.background }]}>
                        <View style={styles.formContainer}>
                            {/* Description Row */}
                            <View style={[styles.inputRow, { borderColor: getBorderColor('name') }]}>
                                <ThemedText type='body' style={[styles.label, { color: themeColors.text }]}>
                                    Description
                                </ThemedText>
                                <RNTextInput
                                    ref={nameInputRef}
                                    style={[styles.inlineInput, { color: themeColors.text }]}
                                    value={formData.name}
                                    onChangeText={(text) => updateFormField('name', text)}
                                    placeholder='Enter food name'
                                    placeholderTextColor={themeColors.subText}
                                    editable={!isUpdating}
                                    onFocus={() => setFocusedInput('name')}
                                    onBlur={() => setFocusedInput(null)}
                                />
                            </View>

                            {/* Meal Type Row */}
                            <View style={[styles.inputRow, { borderColor: themeColors.backgroundSecondary }]}>
                                <ThemedText type='body' style={[styles.label, { color: themeColors.text }]}>
                                    Meal Type
                                </ThemedText>
                                <View style={styles.dropdownContainer}>
                                    <MealSelector
                                        selectedMealType={selectedMealType}
                                        onMealTypeChange={handleMealTypeChange}
                                        onShowMealSelector={() => setShowMealSelector(true)}
                                        displayTextType='bodySmall'
                                        chevronSize={14}
                                    />
                                </View>
                            </View>

                            {/* Time Row */}
                            <View style={[styles.inputRow, { borderColor: getBorderColor('time') }]}>
                                <ThemedText type='body' style={[styles.label, { color: themeColors.text }]}>
                                    Time
                                </ThemedText>
                                <View style={styles.dropdownContainer}>
                                    <TouchableOpacity style={styles.timeSelectButton} onPress={handleTimeSelect} activeOpacity={1}>
                                        <ThemedText type='bodySmall' style={[styles.timeDisplayText, { color: themeColors.text }]}>
                                            {formatTimeForDisplay(selectedTime)}
                                        </ThemedText>
                                        <Icon name='chevron-down' size={14} color={themeColors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>

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
                                    value={formData.calories.toString()}
                                    onChangeText={handleCaloriesChange}
                                    keyboardType='numeric'
                                    placeholder='0'
                                    placeholderTextColor={themeColors.subText}
                                    editable={!isUpdating}
                                    onFocus={() => setFocusedInput('calories')}
                                    onBlur={() => setFocusedInput(null)}
                                    onSubmitEditing={() => proteinInputRef.current?.focus()}
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
                                    value={formData.protein.toString()}
                                    onChangeText={(text) => {
                                        const num = parseFloat(text) || 0;
                                        if (num >= 0) updateFormField('protein', num);
                                    }}
                                    keyboardType='numeric'
                                    placeholder='0'
                                    placeholderTextColor={themeColors.subText}
                                    editable={!isUpdating}
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
                                    value={formData.carbs.toString()}
                                    onChangeText={(text) => {
                                        const num = parseFloat(text) || 0;
                                        if (num >= 0) updateFormField('carbs', num);
                                    }}
                                    keyboardType='numeric'
                                    placeholder='0'
                                    placeholderTextColor={themeColors.subText}
                                    editable={!isUpdating}
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
                                    value={formData.fat.toString()}
                                    onChangeText={(text) => {
                                        const num = parseFloat(text) || 0;
                                        if (num >= 0) updateFormField('fat', num);
                                    }}
                                    keyboardType='numeric'
                                    placeholder='0'
                                    placeholderTextColor={themeColors.subText}
                                    editable={!isUpdating}
                                    onFocus={() => setFocusedInput('fat')}
                                    onBlur={() => setFocusedInput(null)}
                                    onSubmitEditing={handleUpdate}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Impact on Targets Section */}
                    {applicableNutritionGoal && (
                        <View style={[styles.section, { backgroundColor: themeColors.background }]}>
                            <ThemedText type='title' style={styles.sectionTitle}>
                                Impact on Daily Goals
                            </ThemedText>
                            <View style={styles.progressRingsContainer}>
                                <ImpactProgressRing
                                    label='Calories'
                                    current={impactPercentages.calories}
                                    color={themeColors.slateBlue}
                                    backgroundColor={themeColors.slateBlueTransparent}
                                />
                                <ImpactProgressRing
                                    label='Protein'
                                    current={impactPercentages.protein}
                                    color={themeColors.protein}
                                    backgroundColor={addAlpha(themeColors.protein, 0.1)}
                                />
                                <ImpactProgressRing
                                    label='Carbs'
                                    current={impactPercentages.carbs}
                                    color={themeColors.carbs}
                                    backgroundColor={addAlpha(themeColors.carbs, 0.1)}
                                />
                                <ImpactProgressRing
                                    label='Fat'
                                    current={impactPercentages.fat}
                                    color={themeColors.fat}
                                    backgroundColor={addAlpha(themeColors.fat, 0.1)}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Update Button - Absolutely positioned */}
                <View
                    style={[
                        styles.updateButtonContainer,
                        {
                            backgroundColor: themeColors.background,
                            paddingHorizontal: Spaces.MD,
                            paddingBottom: Spaces.XL,
                        },
                    ]}
                >
                    <PrimaryButton
                        text={isUpdating ? 'Updating...' : 'Update'}
                        onPress={handleUpdate}
                        disabled={isUpdating || !hasChanges}
                        size='LG'
                        style={[
                            styles.updateButton,
                            {
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 8,
                                elevation: 8,
                            },
                        ]}
                    />
                </View>
            </KeyboardAvoidingView>

            {/* Time Selector BottomSheet */}
            <BottomSheet visible={showTimeSelector} onClose={handleTimeSelectorClose}>
                {timeSelectorContent}
            </BottomSheet>

            <BottomSheet visible={showMealSelector} onClose={handleMealSelectorClose} animationType='slide'>
                {renderMealSelectorContent(selectedMealType, handleMealSelect, handleMealSelectorClose, themeColors)}
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
    },
    errorText: {
        textAlign: 'center',
        marginVertical: Spaces.MD,
    },
    errorButton: {
        marginTop: Spaces.MD,
    },
    header: {
        paddingTop: Platform.select({
            ios: 44 + Spaces.MD,
            android: 24 + Spaces.MD,
        }),
        paddingBottom: Spaces.MD,
    },
    headerButton: {
        minWidth: 60,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.MD,
    },
    backButton: {
        padding: Spaces.XS,
        alignItems: 'flex-start',
        width: 70,
    },
    headerActionButton: {
        padding: Spaces.XS,
        alignItems: 'flex-end',
        width: 70,
        justifyContent: 'center',
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: Spaces.MD,
    },
    section: {
        marginBottom: Spaces.XL,
        paddingHorizontal: Spaces.MD,
    },
    sectionTitle: {
        marginBottom: Spaces.SM,
    },
    progressRingsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    progressRingContainer: {
        alignItems: 'center',
        flex: 1,
    },
    percentageText: {
        fontWeight: 'bold',
    },
    progressRingLabel: {
        marginTop: Spaces.XS,
        textAlign: 'center',
    },
    formContainer: {},
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
        minWidth: 80,
    },
    calculatedCaloriesInline: {
        flex: 1,
        minWidth: 80,
        textAlign: 'center',
        fontStyle: 'italic',
        paddingHorizontal: Spaces.XS,
    },
    inlineInput: {
        minWidth: 100,
        textAlign: 'right',
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.MD,
    },
    dropdownContainer: {
        minWidth: 100,
        alignItems: 'flex-end',
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.MD,
    },
    mealSelectorTrigger: {
        backgroundColor: 'transparent',
        padding: 0,
        minHeight: 'auto',
    },
    timeSelectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.XS,
        paddingVertical: 2,
    },
    timeDisplayText: {
        fontWeight: '500',
    },
    updateButtonContainer: {},
    updateButton: {
        width: '100%',
    },
    bottomSheetContainer: {
        padding: Spaces.SM,
    },
    bottomSheetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Spaces.MD,
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingBottom: Spaces.MD,
        marginBottom: Spaces.MD,
    },
    bottomSheetContent: {
        paddingBottom: Spaces.LG,
    },
    dateTimePicker: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    bottomSheetActions: {
        marginTop: Spaces.MD,
    },
    bottomSheetButton: {
        paddingVertical: Spaces.SM + Spaces.XS,
        paddingHorizontal: Spaces.MD,
        borderRadius: Spaces.SM,
        alignItems: 'center',
    },
});
