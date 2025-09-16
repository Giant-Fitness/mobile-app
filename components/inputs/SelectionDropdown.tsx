// components/inputs/SelectionDropdown.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

export interface DropdownOption<T = string> {
    value: T;
    label: string;
}

interface SelectionDropdownProps<T = string> {
    /** The currently selected option */
    selectedValue: T;
    /** Array of options to display */
    options: DropdownOption<T>[];
    /** Whether the dropdown is currently visible */
    isOpen: boolean;
    /** Callback when an option is selected */
    onSelect: (value: T) => void;
    /** Callback when dropdown should be closed */
    onClose: () => void;
    /** Callback when dropdown should be toggled */
    onToggle: () => void;
    /** Optional placeholder text when no option is selected */
    placeholder?: string;
    /** Optional custom styling for the trigger button */
    triggerStyle?: any;
    /** Optional custom styling for the dropdown container */
    dropdownStyle?: any;
    /** Whether to show checkmark for selected item */
    showCheckmark?: boolean;
    /** Whether to enable haptic feedback */
    enableHaptics?: boolean;
    /** Dropdown width - 'auto', 'full', or specific width */
    dropdownWidth?: 'auto' | 'full' | number;
    /** Horizontal alignment of dropdown relative to trigger */
    dropdownAlignment?: 'left' | 'center' | 'right';
    /** Additional horizontal padding for full-width dropdowns */
    dropdownHorizontalPadding?: number;
    /** Horizontal offset for dropdown positioning */
    dropdownOffset?: number;
}

export function SelectionDropdown<T = string>({
    selectedValue,
    options,
    isOpen,
    onSelect,
    onClose,
    onToggle,
    placeholder = 'Select an option',
    triggerStyle,
    dropdownStyle,
    showCheckmark = true,
    enableHaptics = true,
    dropdownWidth = 'auto',
    dropdownAlignment = 'center',
    dropdownHorizontalPadding = Spaces.XL,
    dropdownOffset = 0,
}: SelectionDropdownProps<T>) {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handleSelect = (value: T) => {
        if (enableHaptics) {
            trigger('selection');
        }
        onSelect(value);
    };

    const handleToggle = () => {
        if (enableHaptics) {
            trigger('selection');
        }
        onToggle();
    };

    const handleOutsidePress = () => {
        if (isOpen) {
            onClose();
        }
    };

    const selectedOption = options.find((option) => option.value === selectedValue);
    const displayText = selectedOption?.label || placeholder;

    const renderDropdown = () => {
        if (!isOpen) return null;

        // Calculate dropdown styles based on width and alignment props
        const getDropdownStyles = () => {
            const baseStyle = [styles.dropdown, { backgroundColor: themeColors.background }, dropdownStyle];

            if (dropdownWidth === 'full') {
                return [
                    ...baseStyle,
                    {
                        left: -dropdownHorizontalPadding + dropdownOffset,
                        right: -dropdownHorizontalPadding - dropdownOffset,
                    },
                ];
            } else if (typeof dropdownWidth === 'number') {
                // Specific width with alignment
                const alignmentStyles = (() => {
                    switch (dropdownAlignment) {
                        case 'left':
                            return { left: dropdownOffset };
                        case 'right':
                            return { right: dropdownOffset };
                        case 'center':
                        default:
                            return {
                                left: '50%',
                                marginLeft: -(dropdownWidth / 2) + dropdownOffset,
                            };
                    }
                })();

                return [
                    ...baseStyle,
                    {
                        width: dropdownWidth,
                        ...alignmentStyles,
                    },
                ];
            } else {
                // 'auto' width with alignment
                const alignmentStyles = (() => {
                    switch (dropdownAlignment) {
                        case 'left':
                            return {
                                left: dropdownOffset,
                                minWidth: 200,
                            };
                        case 'right':
                            return {
                                right: dropdownOffset,
                                minWidth: 200,
                            };
                        case 'center':
                        default:
                            return {
                                alignSelf: 'center',
                                minWidth: 200,
                                marginLeft: dropdownOffset,
                            };
                    }
                })();

                return [...baseStyle, alignmentStyles];
            }
        };

        return (
            <>
                {/* Invisible overlay to catch outside touches */}
                <TouchableWithoutFeedback onPress={handleOutsidePress}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>

                <View style={getDropdownStyles()}>
                    {options.map((option) => {
                        const isSelected = option.value === selectedValue;

                        return (
                            <TouchableOpacity
                                key={String(option.value)}
                                style={[
                                    styles.dropdownItem,
                                    isSelected && {
                                        backgroundColor: themeColors.backgroundSecondary,
                                    },
                                ]}
                                onPress={() => handleSelect(option.value)}
                                activeOpacity={0.7}
                            >
                                <ThemedText
                                    type='body'
                                    style={[
                                        styles.dropdownText,
                                        isSelected && {
                                            color: themeColors.iconSelected,
                                        },
                                    ]}
                                    numberOfLines={1}
                                >
                                    {option.label}
                                </ThemedText>

                                {showCheckmark && isSelected && <Icon name='check' size={16} color={themeColors.iconDefault} />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </>
        );
    };

    return (
        <View style={styles.container}>
            {/* Trigger Button */}
            <TouchableOpacity style={[styles.trigger, triggerStyle]} onPress={handleToggle} activeOpacity={1}>
                <ThemedText type='title' style={[styles.triggerText, { color: themeColors.text }]}>
                    {displayText}
                </ThemedText>
                <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={Sizes.iconSizeXS} color={themeColors.text} />
            </TouchableOpacity>

            {/* Dropdown */}
            {renderDropdown()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        zIndex: 10,
    },
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.XXS,
    },
    triggerText: {
        textAlign: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: -1000,
        right: -1000,
        bottom: -1000,
        zIndex: 15,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        borderRadius: Spaces.SM,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 20,
        marginTop: Spaces.SM,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: Spaces.SM,
    },
    dropdownText: {},
});
