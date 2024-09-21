// components/overlays/CenteredModal.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Modal } from '@/components/overlays/Modal'; // Importing the reusable Modal

interface CenteredModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
}

export const CenteredModal: React.FC<CenteredModalProps> = ({ visible, onClose, children, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <Modal visible={visible} onClose={onClose} overlay={false}>
            {' '}
            {/* Reusing the new Modal */}
            <View style={styles.container}>
                <TouchableOpacity style={styles.overlay} onPress={onClose} activeOpacity={1}>
                    <BlurView intensity={50} style={styles.blur} tint='systemUltraThinMaterial' experimentalBlurMethod='dimezisBlurView' />
                </TouchableOpacity>
                <ThemedView style={[styles.modal, { backgroundColor: themeColors.background }, style]}>{children}</ThemedView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    blur: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    modal: {
        borderRadius: Spaces.SM,
        padding: Spaces.LG,
        maxWidth: '80%',
        width: '80%',
        maxHeight: '60%',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
