// components/overlays/Modal.tsx

import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { AccessibilityProps, Modal as RNModal, StyleProp, StyleSheet, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';

type ModalProps = {
    visible: boolean;
    onClose: () => void; // Function to close the modal
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    overlay?: boolean; // Optional overlay click to close
    accessibilityLabel?: string; // Accessibility label for screen readers
};

export const Modal: React.FC<ModalProps & AccessibilityProps> = ({
    visible,
    onClose,
    children,
    style,
    overlay = true,
    accessibilityLabel = 'Modal', // Default accessibility label
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <RNModal visible={visible} animationType='fade' transparent={true} onRequestClose={onClose} accessibilityLabel={accessibilityLabel}>
            <TouchableWithoutFeedback onPress={overlay ? onClose : undefined}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <View style={[styles.modalContainer, { backgroundColor: themeColors.background }, style]}>{children}</View>
        </RNModal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background for overlay
    },
    modalContainer: {
        marginHorizontal: Spaces.LG,
        marginVertical: Spaces.XL,
        borderRadius: Spaces.MD,
        padding: Spaces.MD,
        shadowOpacity: 0.8,
        shadowRadius: Spaces.SM,
        elevation: 5, // Shadow for Android
    },
});
