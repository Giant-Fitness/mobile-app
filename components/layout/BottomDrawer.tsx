// components/layout/BottomDrawer.tsx

import React from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';

interface BottomDrawerProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({ visible, onClose, children }) => {
    return (
        <Modal animationType='slide' transparent={true} visible={visible} onRequestClose={onClose}>
            <ThemedView style={styles.overlay}>
                <TouchableOpacity style={styles.background} onPress={onClose} />
                <ThemedView style={styles.drawer}>{children}</ThemedView>
            </ThemedView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    background: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    drawer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
});
