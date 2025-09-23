// components/nutrition/MealSelector.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { IconButton } from '@/components/buttons/IconButton';
import { SelectionGroup } from '@/components/buttons/SelectionButton';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MealType } from '@/types';
import React, { useMemo } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

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

interface MealSelectorProps {
    selectedMealType: MealType;
    onMealTypeChange: (mealType: MealType) => void;
    /** Optional custom styling for the trigger button */
    triggerStyle?: any;
    /** Whether to enable haptic feedback */
    enableHaptics?: boolean;
    /** Display text type for the trigger */
    displayTextType?: 'title' | 'body' | 'buttonSmall';
    /** Callback to show the meal selector - controlled by parent */
    onShowMealSelector?: () => void;
}

// Export this function so parent components can use it for BottomSheet content
export const renderMealSelectorContent = (selectedMealType: MealType, onMealSelect: (mealType: string) => void, onClose: () => void, themeColors: any) => {
    const mealOptions = useMemo(() => {
        const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
        return mealTypes.map((mealType) => ({
            key: mealType,
            text: getMealDisplayName(mealType),
        }));
    }, []);

    return (
        <View style={styles.bottomSheetContainer}>
            <ThemedView style={[styles.bottomSheetHeader, { borderBottomColor: themeColors.systemBorderColor }]}>
                <IconButton onPress={onClose} iconName='close' iconSize={18} size={21} style={styles.headerButton} addBorder={false} />

                <ThemedText type='title'>Select Meal</ThemedText>

                <View style={styles.headerButton} />
            </ThemedView>

            <View style={styles.bottomSheetContent}>
                <SelectionGroup options={mealOptions} selectedKeys={[selectedMealType]} onSelect={onMealSelect} multiSelect={false} variant='radio' size='SM' />
            </View>
        </View>
    );
};

export const MealSelector: React.FC<MealSelectorProps> = ({
    selectedMealType,
    triggerStyle,
    enableHaptics = true,
    displayTextType = 'title',
    onShowMealSelector,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handleMealSelectorOpen = () => {
        if (enableHaptics) {
            trigger('selection');
        }

        // Dismiss keyboard first
        Keyboard.dismiss();

        if (onShowMealSelector) {
            // Small delay to allow keyboard to fully dismiss before showing bottom sheet
            setTimeout(() => {
                onShowMealSelector();
            }, 100);
        }
    };

    return (
        <TouchableOpacity style={[styles.trigger, triggerStyle]} onPress={handleMealSelectorOpen} activeOpacity={1}>
            <ThemedText type={displayTextType} style={[styles.triggerText, { color: themeColors.text }]}>
                {getMealDisplayName(selectedMealType)}
            </ThemedText>
            <Icon name='chevron-down' size={16} color={themeColors.text} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.XXS,
    },
    triggerText: {
        textAlign: 'center',
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
    headerButton: {
        minWidth: 60,
    },
    bottomSheetContent: {
        paddingBottom: Spaces.LG,
    },
});
