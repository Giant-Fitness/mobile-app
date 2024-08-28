// components/base/FilterChip.tsx

import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';

interface FilterChipProps {
    label: string;
    selected: boolean;
    onToggle: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onToggle }) => {
    return (
        <TouchableOpacity style={[styles.chip, selected && styles.chipSelected]} onPress={onToggle}>
            <ThemedText style={styles.chipText}>{label}</ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 20,
        margin: 5,
    },
    chipSelected: {
        backgroundColor: '#ddd',
    },
    chipText: {
        fontSize: 14,
    },
});
