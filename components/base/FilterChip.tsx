// components/base/FilterChip.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

interface FilterChipProps {
    label: string;
    selected: boolean;
    onToggle: () => void;
    style?: ViewStyle; // Accept additional style as a prop
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onToggle, style }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const chipStyle = [
        styles.chip,
        {
            backgroundColor: selected ? themeColors.buttonPrimary : themeColors.background,
            borderColor: selected ? themeColors.buttonPrimary : themeColors.systemBorderColor,
        },
        style,
    ];

    const textStyle = {
        color: selected ? themeColors.background : themeColors.subText,
    };

    return (
        <TouchableOpacity style={chipStyle} onPress={onToggle} activeOpacity={0.8}>
            <ThemedText type='bodyXSmall' style={textStyle}>
                {label}
            </ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingVertical: spacing.sm,
        borderWidth: moderateScale(0.8),
        borderRadius: spacing.xxs,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
