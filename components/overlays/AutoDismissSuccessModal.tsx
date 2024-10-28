// components/overlays/AutoDismissSuccessModal.tsx

import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { CenteredModal } from '@/components/overlays/CenteredModal';
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
    message?: string;
    duration?: number; // Duration in milliseconds
    showTitle?: boolean;
    showMessage?: boolean;
}

export const AutoDismissSuccessModal: React.FC<AutoDismissSuccessModalProps> = ({
    visible,
    onDismiss,
    title = 'Success!',
    message = 'Success!',
    duration = 800,
    showTitle = true,
    showMessage = true,
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
        <CenteredModal visible={visible} onClose={onDismiss} overlay={false} style={styles.modal} accessibilityLabel='Success notification'>
            <ThemedView style={styles.container}>
                <ThemedView style={styles.animationContainer}>
                    <LottieView source={require('@/assets/animations/check.json')} autoPlay loop={false} style={styles.animation} />
                </ThemedView>

                {showTitle && (
                    <ThemedText type='title' style={[styles.title, { color: themeColors.text }]}>
                        {title}
                    </ThemedText>
                )}

                {showMessage && <ThemedText style={[styles.message, { color: themeColors.textSecondary }]}>{message}</ThemedText>}
            </ThemedView>
        </CenteredModal>
    );
};

const styles = StyleSheet.create({
    modal: {
        position: 'absolute',
        margin: 0,
        alignItems: 'center',
        borderRadius: Spaces.SM,
    },
    container: {
        alignItems: 'center',
        width: '100%',
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
