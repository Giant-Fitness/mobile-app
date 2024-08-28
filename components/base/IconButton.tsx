// components/base/IconButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
            <Icon name={iconName} size={iconSize} color={iconColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 30, // Equal width and height to make it circular
        height: 30,
        borderRadius: 15, // Half of width/height to make it circular
    },
});
