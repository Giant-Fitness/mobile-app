// components/overlays/AutoDismissSuccessModal.tsx

import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Modal } from '@/components/overlays/Modal';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useColorScheme } from '@/hooks/useColorScheme';

interface AutoDismissSuccessModalProps {
    visible: boolean;
    onDismiss: () => void;
    title?: string;
    message: string;
    duration?: number; // Duration in milliseconds
    showTitle?: boolean;
}

export const AutoDismissSuccessModal: React.FC<AutoDismissSuccessModalProps> = ({
    visible,
    onDismiss,
    title = 'Success!',
    message,
    duration = 800,
    showTitle = true,
}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme];

    const handleDismiss = useCallback(() => {
        if (visible) {
            onDismiss();
        }
    }, [visible, onDismiss]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        if (visible) {
            timeoutId = setTimeout(handleDismiss, duration);
        }
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [visible, duration, handleDismiss]);

    return (
        <Modal visible={visible} onClose={onDismiss} overlay={false} style={styles.modal} accessibilityLabel='Success notification'>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.animationContainer}>
                    <LottieView source={require('@/assets/animations/check.json')} autoPlay loop={false} style={styles.animation} />
                </ThemedView>

                {showTitle && (
                    <ThemedText type='title' style={[styles.title, { color: themeColors.text }]}>
                        {title}
                    </ThemedText>
                )}

                <ThemedText style={[styles.message, { color: themeColors.textSecondary }]}>{message}</ThemedText>
            </ThemedView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        position: 'absolute',
        top: '25%', // Center vertically near the top half
        left: Spaces.LG,
        right: Spaces.LG,
        margin: 0,
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
        width: '100%',
        padding: Spaces.LG,
        borderRadius: Spaces.SM,
    },
    animationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spaces.XS,
    },
    animation: {
        height: Sizes.imageXSHeight,
        width: Sizes.imageXSHeight,
    },
    title: {
        marginBottom: Spaces.MD,
        textAlign: 'center',
    },
    message: {
        marginBottom: Spaces.MD,
        textAlign: 'center',
    },
});
