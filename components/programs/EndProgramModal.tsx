// components/programs/EndProgramModal.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CenteredModal } from '@/components/overlays/CenteredModal';
import { ThemedText } from '@/components/base/ThemedText';
import { TextButton } from '@/components/buttons/TextButton';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

type EndProgramModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    programId: string;
};

export const EndProgramModal: React.FC<EndProgramModalProps> = ({ visible, onClose, onConfirm, programId }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handleConfirm = () => {
        onConfirm();
        try {
            router.push({
                pathname: '/(app)/programs/program-abandon-feedback',
                params: { programId },
            });
        } catch (error) {
            console.error('Navigation error:', error);
        }
    };

    return (
        <CenteredModal visible={visible} onClose={onClose}>
            <View style={styles.container}>
                <View style={[styles.warningIconContainer, { backgroundColor: themeColors.redTransparent }]}>
                    <Icon name='warning' color={themeColors.red} size={24} />
                </View>
                <ThemedText type='title' style={styles.title}>
                    End Program
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.message}>
                    You&apos;re about to finish the program early. Are you sure you want to continue?
                </ThemedText>
                <View style={styles.buttonContainer}>
                    <TextButton
                        text='Yes, End'
                        onPress={handleConfirm}
                        style={[styles.button, { backgroundColor: themeColors.background, borderWidth: 1, borderColor: themeColors.redTransparent }]}
                        textType='bodyXSmall'
                        textStyle={[styles.buttonTextStyle, { color: themeColors.red }]}
                    />
                    <PrimaryButton text='No, Go Back' onPress={onClose} style={styles.button} textType='bodyXSmall' textStyle={styles.buttonTextStyle} />
                </View>
            </View>
        </CenteredModal>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '100%',
    },
    warningIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spaces.MD,
    },
    title: {
        marginBottom: Spaces.SM,
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
        marginBottom: Spaces.LG,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: Spaces.MD,
    },
    button: {
        flex: 1,
        marginHorizontal: Spaces.XS,
        paddingVertical: Spaces.MD,
    },
    buttonTextStyle: {
        fontSize: Sizes.fontSizeSmall,
        textAlign: 'center',
    },
});
