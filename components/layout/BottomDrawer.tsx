// components/layout/BottomDrawer.tsx

import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { spacing } from '@/utils/spacing';

interface BottomDrawerProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({ visible, onClose, children, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <Modal animationType='fade' transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
                    <BlurView intensity={50} style={styles.blur} tint='systemUltraThinMaterial' experimentalBlurMethod='dimezisBlurView' />
                </TouchableOpacity>
                <ThemedView style={[styles.drawer, { backgroundColor: themeColors.background }, style]}>{children}</ThemedView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    blur: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    drawer: {
        borderTopLeftRadius: spacing.sm,
        borderTopRightRadius: spacing.sm,
        paddingHorizontal: spacing.lg,
        maxHeight: '90%',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
});
