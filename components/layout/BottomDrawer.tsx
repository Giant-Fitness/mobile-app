// components/layout/BottomDrawer.tsx

import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface BottomDrawerProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({ visible, onClose, children }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <Modal animationType='fade' transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                {/* BlurView with a semi-transparent background to blur the content underneath */}
                <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
                    <BlurView intensity={50} style={styles.blur} tint='systemUltraThinMaterial' experimentalBlurMethod='dimezisBlurView' />
                </TouchableOpacity>
                {/* Drawer slides up independently from the overlay */}
                <ThemedView style={[styles.drawer, { backgroundColor: themeColors.background }]}>{children}</ThemedView>
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
        flex: 1, // Ensures the blur view covers the entire overlay
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    drawer: {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        paddingHorizontal: 24,
        maxHeight: '90%',
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
});
