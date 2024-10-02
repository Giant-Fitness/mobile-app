// components/overlays/CenteredModal.tsx

import React from 'react';
import { StyleSheet, View, ViewStyle, Dimensions, Modal as RNModal } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';

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
        <RNModal visible={visible} transparent={true} animationType='fade' onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={50} style={StyleSheet.absoluteFill} tint={'dark'} />
                <ThemedView style={[styles.modal, { backgroundColor: themeColors.background }, styles.shadow, style]}>{children}</ThemedView>
            </View>
        </RNModal>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        borderRadius: Spaces.MD,
        padding: Spaces.LG,
        width: Math.min(width * 0.9, 400),
        maxHeight: height * 0.8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    shadow: {
        shadowColor: 'rgba(0,0,0,0.2)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
    },
});
