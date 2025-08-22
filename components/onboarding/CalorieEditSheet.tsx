// components/onboarding/CalorieEditSheet.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { IconButton } from '@/components/buttons/IconButton';
import { TextButton } from '@/components/buttons/TextButton';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { addAlpha } from '@/utils/colorUtils';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface CalorieEditSheetProps {
    visible: boolean;
    onClose: () => void;
    currentCalories: number;
    calculatedTDEE: number;
    onSave: (newCalories: number, isOverride: boolean) => void;
}

// Custom hook to manage persistent keyboard
const usePersistentKeyboard = (visible: boolean) => {
    const inputRef = useRef<TextInput>(null);
    const keyboardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (visible) {
            // Small delay to ensure the sheet is fully mounted
            const focusTimeout = setTimeout(() => {
                inputRef.current?.focus();
            }, 150);

            // Listen for keyboard dismissal and re-focus
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                if (visible) {
                    keyboardTimeoutRef.current = setTimeout(() => {
                        inputRef.current?.focus();
                    }, 100);
                }
            });

            return () => {
                clearTimeout(focusTimeout);
                if (keyboardTimeoutRef.current) {
                    clearTimeout(keyboardTimeoutRef.current);
                }
                keyboardDidHideListener.remove();
            };
        } else {
            // Clear timeouts when sheet closes
            if (keyboardTimeoutRef.current) {
                clearTimeout(keyboardTimeoutRef.current);
            }
        }
    }, [visible]);

    return inputRef;
};

export const CalorieEditSheet: React.FC<CalorieEditSheetProps> = ({ visible, onClose, currentCalories, calculatedTDEE, onSave }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [inputValue, setInputValue] = useState(currentCalories.toString());
    const [isValid, setIsValid] = useState(true);
    const [showError, setShowError] = useState(false);
    const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const inputRef = usePersistentKeyboard(visible);

    useEffect(() => {
        if (visible) {
            setInputValue(currentCalories.toString());
            setIsValid(true);
            setShowError(false);
        }
    }, [visible, currentCalories]);

    const validateInput = (value: string) => {
        const numValue = parseInt(value);
        return !isNaN(numValue) && numValue >= 800 && numValue <= 12000;
    };

    const handleInputChange = (value: string) => {
        // Only allow numbers
        const numericValue = value.replace(/[^0-9]/g, '');
        setInputValue(numericValue);

        const valid = validateInput(numericValue);
        setIsValid(valid);

        // Clear existing timeout
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }

        // Hide error immediately when user starts typing
        setShowError(false);

        // Show error after delay if input is invalid and not empty
        if (!valid && numericValue.trim() !== '') {
            errorTimeoutRef.current = setTimeout(() => {
                setShowError(true);
            }, 800); // Give user time to finish typing
        }
    };

    const canSave = () => {
        return isValid && inputValue.trim() !== '';
    };

    const handleSave = () => {
        if (!validateInput(inputValue)) {
            setShowError(true);
            return;
        }

        const newCalories = parseInt(inputValue);
        const isOverride = newCalories !== calculatedTDEE;
        onSave(newCalories, isOverride);
        onClose();
    };

    const handleReset = () => {
        setInputValue(calculatedTDEE.toString());
        setIsValid(true);
        setShowError(false);
        // Clear timeout when resetting
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
        // Refocus after reset
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    };

    const handleClose = () => {
        // Clear timeout when closing
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
        }
        // Blur input before closing to dismiss keyboard
        inputRef.current?.blur();
        onClose();
    };

    const renderHeader = () => {
        const isDifferentFromCalculated = parseInt(inputValue) !== calculatedTDEE && inputValue.trim() !== '';

        return (
            <ThemedView style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
                <IconButton onPress={handleClose} iconName='close' iconSize={18} size={21} style={styles.headerButton} addBorder={false} />

                <ThemedText type='title'>Edit Daily Calories</ThemedText>

                {/* Always render the button container with consistent dimensions */}
                <View style={styles.headerButton}>
                    {isDifferentFromCalculated ? (
                        <TouchableOpacity onPress={handleReset} style={styles.resetTextButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <ThemedText type='overline' style={styles.resetTextLabel}>
                                Reset
                            </ThemedText>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </ThemedView>
        );
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose} style={styles.bottomSheetStyle} disableBackdropPress={true}>
            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                {renderHeader()}

                <ScrollView
                    style={styles.scrollContainer}
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps='always'
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={false}
                >
                    <ThemedText type='bodySmall' style={styles.description}>
                        Adjust your daily calorie needs if you have more specific knowledge about your metabolism.
                    </ThemedText>

                    {/* Input Section */}
                    <View style={styles.inputSection}>
                        <View
                            style={[
                                styles.inputContainer,
                                {
                                    borderColor: isValid ? addAlpha(themeColors.text, 0.2) : addAlpha(themeColors.red, 0.6),
                                    backgroundColor: addAlpha(themeColors.text, 0.05),
                                },
                            ]}
                        >
                            <TextInput
                                ref={inputRef}
                                style={[styles.input, { color: themeColors.text }]}
                                value={inputValue}
                                onChangeText={handleInputChange}
                                keyboardType='numeric'
                                placeholder='2000'
                                placeholderTextColor={addAlpha(themeColors.text, 0.5)}
                                selectionColor={themeColors.primary}
                                returnKeyType='done'
                                onSubmitEditing={handleSave}
                                autoFocus={false} // Let the hook handle focusing
                            />
                            <ThemedText type='bodyXSmall' style={[styles.inputSuffix, { color: addAlpha(themeColors.text, 0.7) }]}>
                                calories
                            </ThemedText>
                        </View>

                        {/* Reserved space for error message to prevent layout shift */}
                        <View style={styles.errorContainer}>
                            {showError && (
                                <ThemedText type='caption' style={[{ color: themeColors.red }]}>
                                    Enter a value between 800-12,000 calories
                                </ThemedText>
                            )}
                        </View>
                    </View>

                    {/* Quick Actions - Save Button */}
                    <View style={styles.quickActions}>
                        <TextButton text='Update Calories' onPress={handleSave} disabled={!canSave()} size='LG' style={styles.updateButton} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    bottomSheetStyle: {
        paddingHorizontal: 0,
        height: Sizes.bottomInputSheet, // Fixed height that leaves room for keyboard
    },
    keyboardContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.SM,
        paddingRight: Spaces.MD,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerButton: {
        minWidth: 50, // Increased to accommodate "Reset" text
        minHeight: 30, // Consistent height
        alignItems: 'center',
        justifyContent: 'center', // Center content vertically
    },
    resetTextButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    resetTextLabel: {
        fontSize: 13,
        fontWeight: '600',
    },
    scrollContainer: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.LG,
    },
    description: {
        marginBottom: Spaces.MD,
    },
    inputSection: {
        marginBottom: Spaces.MD,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: Spaces.SM,
        padding: Spaces.SM + Spaces.XS,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
    inputSuffix: {
        marginLeft: Spaces.SM,
    },
    errorContainer: {
        height: 18, // Fixed height to prevent layout shift
        marginTop: Spaces.XS,
        justifyContent: 'center',
    },
    quickActions: {
        alignItems: 'center',
    },
    updateButton: {
        width: '100%',
    },
});
