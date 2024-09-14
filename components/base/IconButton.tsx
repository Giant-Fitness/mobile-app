// components/base/IconButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { moderateScale } from '@/utils/scaling';

type IconButtonProps = {
    onPress: () => void;
    iconName: string;
    iconSize?: number;
    iconColor?: string;
    style?: StyleProp<ViewStyle>;
};

export const IconButton: React.FC<IconButtonProps> = ({ onPress, iconName, iconSize = 16, iconColor, style }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity style={[styles.button, { backgroundColor: themeColors.primary }, style]} onPress={onPress}>
            <Icon name={iconName} size={moderateScale(iconSize)} color={iconColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: moderateScale(30),
        height: moderateScale(30),
        borderRadius: moderateScale(15),
    },
});
