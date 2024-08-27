// components/base/CustomBackButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export const CustomBackButton: React.FC = ({ style }) => {
    const navigation = useNavigation();
    const colorScheme = useColorScheme();
    const iconColor = Colors[colorScheme].tabIconDefault;

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={() => navigation.goBack()}>
            <Icon name='chevron-back' size={24} color={(style && style.color) || iconColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
});
