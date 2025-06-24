// components/inputs/RadioGroup.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

type Option = {
    id: string;
    label: string;
};

type RadioGroupProps = {
    options: Option[];
    selected: string | undefined;
    onSelect: (value: string) => void;
    style?: ViewStyle;
};

export function RadioGroup({ options, selected, onSelect, style }: RadioGroupProps) {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.container, style]}>
            {options.map((option) => (
                <TouchableOpacity key={option.id} onPress={() => onSelect(option.id)} style={styles.optionButton} activeOpacity={1}>
                    <Icon name={selected === option.id ? 'radio-button-on' : 'radio-button-off'} size={moderateScale(16)} color={themeColors.subText} />
                    <ThemedText type='body' style={{ color: themeColors.text, flex: 1, marginLeft: Spaces.SM }}>
                        {option.label}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        marginVertical: Spaces.XXS,
    },
});
