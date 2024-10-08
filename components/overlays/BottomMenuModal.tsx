// components/overlays/BottomMenuModal.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { ThemedView } from '@/components/base/ThemedView';

type MenuOption = {
    label: string;
    onPress: () => void;
    icon?: string; // Optional icon name
};

type BottomMenuModalProps = {
    isVisible: boolean;
    onClose: () => void;
    options: MenuOption[];
    containerStyle?: ViewStyle;
    menuStyle?: ViewStyle;
};

export const BottomMenuModal: React.FC<BottomMenuModalProps> = ({ isVisible, onClose, options, containerStyle, menuStyle }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <BottomSheet visible={isVisible} onClose={onClose} style={[styles.bottomSheetContainer, containerStyle]}>
            <ThemedView style={[styles.menuContainer, menuStyle]}>
                {options.map((option, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.option}
                        onPress={() => {
                            option.onPress();
                            onClose();
                        }}
                        activeOpacity={1}
                    >
                        <View style={styles.optionContent}>
                            {option.icon && <Icon name={option.icon} color={themeColors.iconDefault} style={styles.optionIcon} />}
                            <ThemedText type='overline' style={styles.optionText}>
                                {option.label}
                            </ThemedText>
                        </View>
                    </TouchableOpacity>
                ))}
            </ThemedView>
            <ThemedView style={[styles.cancelContainer]}>
                <TouchableOpacity style={[styles.option, styles.cancelOption]} onPress={onClose} activeOpacity={1}>
                    <ThemedText type='button' style={[styles.cancelText, { color: themeColors.text }]}>
                        Cancel
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    bottomSheetContainer: {
        backgroundColor: 'transparent',
    },
    menuContainer: {
        marginBottom: Spaces.MD,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
    },
    cancelContainer: {
        marginBottom: Spaces.XL,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
    },
    option: {
        paddingVertical: Spaces.MD,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.LG,
    },
    optionIcon: {
        marginRight: Spaces.SM,
    },
    optionText: {
        textAlign: 'left',
    },
    cancelOption: {
        borderBottomWidth: 0,
    },
    cancelText: {
        textAlign: 'center',
    },
});

export default BottomMenuModal;
