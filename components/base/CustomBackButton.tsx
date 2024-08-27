// components/base/CustomBackButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

type CustomBackButtonProps = {
    style?: ViewStyle;
    iconColor?: string;
};

export const CustomBackButton: React.FC<CustomBackButtonProps> = ({ style, iconColor }) => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const defaultIconColor = themeColors.iconDefault;

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.goBack()}>
            <Icon name='chevron-back' size={24} color={iconColor || defaultIconColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
});
