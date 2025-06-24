// components/base/FilterChip.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface FilterChipProps {
    label: string;
    selected: boolean;
    onToggle: () => void;
    style?: ViewStyle; // Accept additional style as a prop
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onToggle, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

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
        paddingVertical: Spaces.SM,
        borderWidth: moderateScale(0.8),
        borderRadius: Spaces.XXS,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
