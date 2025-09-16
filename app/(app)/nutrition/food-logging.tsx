// app/(app)/nutrition/food-logging.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { IconButton } from '@/components/buttons/IconButton';
import { DropdownOption, SelectionDropdown } from '@/components/inputs/SelectionDropdown';
import { HorizontalTabSwitcher, TabOption } from '@/components/navigation/HorizontalTabSwitcher';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MealType } from '@/types';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import DateTimePicker from '@react-native-community/datetimepicker';
import { trigger } from 'react-native-haptic-feedback';

type LoggingMode = 'search' | 'quick-add' | 'barcode';

// Helper function to determine meal type based on current time
const getMealTypeFromTime = (): MealType => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour <= 10) {
        return 'BREAKFAST'; // 5:00 AM - 10:59 AM
    } else if (hour >= 11 && hour <= 15) {
        return 'LUNCH'; // 11:00 AM - 3:59 PM
    } else if (hour >= 18 && hour <= 21) {
        return 'DINNER'; // 6:00 PM - 9:59 PM
    } else {
        return 'SNACK';
    }
};

// Helper function to check if a date is today
const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};

// Helper function to format time for display (floored to hour)
const formatTimeForDisplay = (date: Date): string => {
    const hour = date.getHours();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
};

// Helper function to format date for display (day and month only)
const formatDateForDisplay = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
    };
    return date.toLocaleDateString('en-GB', options);
};

// Helper function to get meal display name
const getMealDisplayName = (mealType: MealType): string => {
    switch (mealType) {
        case 'BREAKFAST':
            return 'Breakfast';
        case 'LUNCH':
            return 'Lunch';
        case 'DINNER':
            return 'Dinner';
        case 'SNACK':
            return 'Snack';
        default:
            return mealType;
    }
};

// Helper function to validate and convert mode parameter to LoggingMode
const getValidLoggingMode = (mode: string | undefined): LoggingMode => {
    if (mode === 'search' || mode === 'quick-add' || mode === 'barcode') {
        return mode as LoggingMode;
    }
    return 'search'; // Default fallback
};

// Create meal options for the dropdown
const createMealOptions = (): DropdownOption<MealType>[] => {
    const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
    return mealTypes.map((mealType) => ({
        value: mealType,
        label: getMealDisplayName(mealType),
    }));
};

// Create logging mode tabs
const createLoggingModeTabs = (): TabOption<LoggingMode>[] => [
    { id: 'search', label: 'Search', icon: 'saved-search' },
    { id: 'quick-add', label: 'Quick Add', icon: 'add-chart' },
    { id: 'barcode', label: 'Barcode', icon: 'barcode' },
    // You can easily add more modes here:
    // { id: 'recent', label: 'Recent', icon: 'history' },
    // { id: 'favorites', label: 'Favorites', icon: 'favorite' },
    // { id: 'recipe', label: 'Recipe', icon: 'restaurant' },
];

export default function FoodLoggingScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const router = useRouter();
    const params = useLocalSearchParams<{
        mode?: string;
        mealType?: string;
        date?: string;
    }>();

    // Get the initial logging mode from parameters or default to 'search'
    const initialLoggingMode = getValidLoggingMode(params.mode);

    // Helper function to get initial meal type
    const getInitialMealType = (): MealType => {
        if (params.mealType && ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'].includes(params.mealType)) {
            return params.mealType as MealType;
        }
        return getMealTypeFromTime();
    };

    // Helper function to get initial date/time
    const getInitialDateTime = (): Date => {
        if (params.date) {
            try {
                const parsedDate = new Date(params.date);
                // If we have a specific date but it's just the date part,
                // combine it with a reasonable time for the meal
                if (params.mealType) {
                    const mealType = params.mealType as MealType;
                    const hour = getMealTypeDefaultHour(mealType);
                    parsedDate.setHours(hour, 0, 0, 0);
                }
                return parsedDate;
            } catch (error) {
                console.error('Failed to parse date parameter:', params.date, error);
            }
        }
        return new Date();
    };

    // Helper function to get default hour for meal types
    const getMealTypeDefaultHour = (mealType: MealType): number => {
        const currentHour = new Date().getHours();

        switch (mealType) {
            case 'BREAKFAST':
                // Valid range: 5:00 AM - 10:59 AM
                if (currentHour >= 5 && currentHour <= 10) {
                    return currentHour;
                }
                return 8; // Default breakfast time

            case 'LUNCH':
                // Valid range: 11:00 AM - 3:59 PM
                if (currentHour >= 11 && currentHour <= 15) {
                    return currentHour;
                }
                return 13; // Default lunch time

            case 'DINNER':
                // Valid range: 6:00 PM - 9:59 PM
                if (currentHour >= 18 && currentHour <= 21) {
                    return currentHour;
                }
                return 19; // Default dinner time (7 PM)

            case 'SNACK':
                // Snacks can be at any time, so always use current hour
                return currentHour;

            default:
                return currentHour;
        }
    };

    const [selectedMealType, setSelectedMealType] = useState<MealType>(getInitialMealType());
    const [selectedTime, setSelectedTime] = useState<Date>(getInitialDateTime());
    const [tempSelectedTime, setTempSelectedTime] = useState<Date>(getInitialDateTime()); // Temporary state for picker
    const [showMealDropdown, setShowMealDropdown] = useState(false);
    const [showTimeSelector, setShowTimeSelector] = useState(false);
    const [activeLoggingMode, setActiveLoggingMode] = useState<LoggingMode>(initialLoggingMode);

    const mealOptions = createMealOptions();
    const loggingModeTabs = createLoggingModeTabs();

    const handleBack = () => {
        trigger('selection');
        router.back();
    };

    const handleMealSelect = (mealType: MealType) => {
        setSelectedMealType(mealType);
        setShowMealDropdown(false);
    };

    const handleMealDropdownToggle = () => {
        setShowMealDropdown(!showMealDropdown);
    };

    const handleMealDropdownClose = () => {
        setShowMealDropdown(false);
    };

    const handleTimeSelect = () => {
        trigger('selection');
        // Initialize temp time with current selected time
        setTempSelectedTime(new Date(selectedTime));
        setShowTimeSelector(true);
    };

    const handleDateTimeChange = (event: any, date?: Date) => {
        // Only update the temporary state, not the actual selectedTime
        if (date) {
            setTempSelectedTime(date);
        }
    };

    const handleTimeSelectorClose = () => {
        setShowTimeSelector(false);
        // Reset temp time to original selected time when closing without saving
        setTempSelectedTime(new Date(selectedTime));
    };

    const handleTimeSelectorDone = () => {
        trigger('selection');
        // Apply the temporary time to the actual selected time
        setSelectedTime(new Date(tempSelectedTime));
        setShowTimeSelector(false);
    };

    const handleLoggingModeChange = (mode: LoggingMode) => {
        setActiveLoggingMode(mode);
    };

    const renderTimeSelectorContent = () => (
        <View style={styles.bottomSheetContainer}>
            <ThemedView style={[styles.bottomSheetHeader, { borderBottomColor: themeColors.systemBorderColor }]}>
                <IconButton onPress={handleTimeSelectorClose} iconName='close' iconSize={18} size={21} style={styles.headerButton} addBorder={false} />

                <ThemedText type='title'>Select Date & Time</ThemedText>

                <View style={styles.headerRight} />
            </ThemedView>

            <View style={styles.bottomSheetContent}>
                <DateTimePicker
                    value={tempSelectedTime} // Use temporary state for the picker
                    mode='datetime'
                    display={'spinner'}
                    onChange={handleDateTimeChange}
                    style={styles.dateTimePicker}
                    themeVariant={colorScheme}
                    textColor={themeColors.text}
                    locale='en-GB'
                    minimumDate={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                    maximumDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                />

                <View style={styles.bottomSheetActions}>
                    <TouchableOpacity
                        style={[styles.bottomSheetButton, { backgroundColor: themeColors.surfaceDark }]}
                        onPress={handleTimeSelectorDone}
                        activeOpacity={0.8}
                    >
                        <ThemedText type='button' style={{ color: themeColors.text }}>
                            Done
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderLoggingContent = () => {
        switch (activeLoggingMode) {
            case 'search':
                return (
                    <View style={styles.placeholderContainer}>
                        <Icon name='saved-search' size={48} color={themeColors.iconDefault} />
                        <ThemedText type='title' style={[styles.placeholderTitle, { color: themeColors.text }]}>
                            Search Foods
                        </ThemedText>
                        <ThemedText type='body' style={[styles.placeholderDescription, { color: themeColors.subText }]}>
                            Search our comprehensive food database to log your meals
                        </ThemedText>
                    </View>
                );
            case 'quick-add':
                return (
                    <View style={styles.placeholderContainer}>
                        <Icon name='add-chart' size={48} color={themeColors.iconDefault} />
                        <ThemedText type='title' style={[styles.placeholderTitle, { color: themeColors.text }]}>
                            Quick Add
                        </ThemedText>
                        <ThemedText type='body' style={[styles.placeholderDescription, { color: themeColors.subText }]}>
                            Quickly log calories and macros without selecting specific foods
                        </ThemedText>
                    </View>
                );
            case 'barcode':
                return (
                    <View style={styles.placeholderContainer}>
                        <Icon name='barcode' size={48} color={themeColors.iconDefault} />
                        <ThemedText type='title' style={[styles.placeholderTitle, { color: themeColors.text }]}>
                            Scan Barcode
                        </ThemedText>
                        <ThemedText type='body' style={[styles.placeholderDescription, { color: themeColors.subText }]}>
                            Scan product barcodes to quickly add foods to your log
                        </ThemedText>
                    </View>
                );
            default:
                return null;
        }
    };

    const renderTimeSelector = () => {
        const showToday = isToday(selectedTime);

        return (
            <TouchableOpacity style={[styles.timeSelector, { backgroundColor: themeColors.surfaceDark }]} onPress={handleTimeSelect} activeOpacity={1}>
                <View style={styles.timeSelectorContent}>
                    <ThemedText type='buttonSmall' style={[styles.timeText, { color: themeColors.text }]}>
                        {formatTimeForDisplay(selectedTime)}
                    </ThemedText>
                    {!showToday && (
                        <ThemedText type='caption' style={[styles.dateText, { color: themeColors.subText }]}>
                            {formatDateForDisplay(selectedTime)}
                        </ThemedText>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            {/* Fixed Header */}
            <View style={[styles.header, { backgroundColor: themeColors.backgroundSecondary }]}>
                <View style={styles.headerContent}>
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={1}>
                        <Icon name='close-no-outline' color={themeColors.text} />
                    </TouchableOpacity>

                    {/* Meal Selector */}
                    <View style={styles.centerSection}>
                        <SelectionDropdown<MealType>
                            selectedValue={selectedMealType}
                            options={mealOptions}
                            isOpen={showMealDropdown}
                            onSelect={handleMealSelect}
                            onClose={handleMealDropdownClose}
                            onToggle={handleMealDropdownToggle}
                            placeholder='Select Meal'
                        />
                    </View>

                    {/* Time Selector */}
                    {renderTimeSelector()}
                </View>

                {/* Logging Mode Tabs - Now using the new HorizontalTabSwitcher */}
                <HorizontalTabSwitcher
                    tabs={loggingModeTabs}
                    activeTab={activeLoggingMode}
                    onTabChange={handleLoggingModeChange}
                    showIcons={true}
                    enableHapticFeedback={true}
                />
            </View>

            {/* Time Selector BottomSheet */}
            <BottomSheet visible={showTimeSelector} onClose={handleTimeSelectorClose}>
                {renderTimeSelectorContent()}
            </BottomSheet>

            {/* Content Area */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderLoggingContent()}
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: Platform.select({
            ios: 44 + Spaces.MD,
            android: 24 + Spaces.MD,
        }),
        zIndex: 10,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.SM,
    },
    backButton: {
        padding: Spaces.XS,
        alignItems: 'flex-start',
        width: 70,
    },
    centerSection: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    timeSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.SM,
        borderRadius: Spaces.MD,
        minWidth: 80,
    },
    timeSelectorContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeText: {
        textAlign: 'center',
    },
    dateText: {
        marginTop: -Spaces.XS,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: Spaces.MD,
    },
    placeholderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spaces.XXL,
    },
    placeholderTitle: {
        marginTop: Spaces.MD,
        marginBottom: Spaces.SM,
        textAlign: 'center',
    },
    placeholderDescription: {
        textAlign: 'center',
        paddingHorizontal: Spaces.LG,
    },
    // Bottom Sheet specific styles
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
    headerButton: {
        minWidth: 60,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 60,
        justifyContent: 'flex-end',
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
