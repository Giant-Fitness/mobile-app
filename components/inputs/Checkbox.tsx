// components/inputs/Checkbox.tsx

import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

interface CheckboxProps {
    label: string;
    checked: boolean;
    onToggle: () => void;
    style?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onToggle, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onToggle} activeOpacity={0.7}>
            <View style={[styles.checkbox, { borderColor: themeColors.text }, checked && { backgroundColor: themeColors.text }]}>
                {checked && <Icon name='check-square' size={Sizes.iconSizeSM} color={themeColors.background} />}
            </View>
            <ThemedText style={styles.label}>{label}</ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spaces.XS,
    },
    checkbox: {
        width: Sizes.iconSizeDefault,
        height: Sizes.iconSizeDefault,
        borderWidth: 1,
        borderRadius: Spaces.XS,
        marginRight: Spaces.MD,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        flex: 1,
    },
});
