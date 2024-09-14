// components/base/CustomBackButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

type CustomBackButtonProps = {
    style?: ViewStyle;
    iconColor?: string;
};

export const CustomBackButton: React.FC<CustomBackButtonProps> = ({ style, iconColor }) => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const defaultIconColor = themeColors.text;

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.goBack()}>
            <Icon name='chevron-back' size={moderateScale(22)} color={iconColor || defaultIconColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
    },
});
