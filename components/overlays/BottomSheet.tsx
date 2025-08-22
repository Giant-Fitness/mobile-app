// components/overlays/BottomSheet.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { Dimensions, Keyboard, Modal, Platform, StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { BlurView } from 'expo-blur';

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disableBackdropPress?: boolean;
    adjustForKeyboard?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onClose, children, style, disableBackdropPress = false, adjustForKeyboard = false }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if (!adjustForKeyboard) return;

        const keyboardWillShowListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) =>
            setKeyboardHeight(e.endCoordinates.height),
        );

        const keyboardWillHideListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardHeight(0));

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, [adjustForKeyboard]);

    const handleBackdropPress = () => {
        if (!disableBackdropPress) {
            onClose();
        }
    };

    const dynamicStyle = adjustForKeyboard
        ? {
              maxHeight: screenHeight - keyboardHeight - 50, // 50px for safe area
              marginBottom: keyboardHeight,
          }
        : {};

    return (
        <Modal animationType='fade' transparent={true} visible={visible} onRequestClose={onClose}>
            <View style={styles.container}>
                <TouchableOpacity style={styles.overlay} onPress={handleBackdropPress} activeOpacity={1}>
                    <BlurView intensity={50} style={styles.blur} tint='systemUltraThinMaterial' experimentalBlurMethod='dimezisBlurView' />
                </TouchableOpacity>
                <ThemedView style={[styles.drawer, { backgroundColor: themeColors.background }, dynamicStyle, style]}>{children}</ThemedView>
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
        borderTopLeftRadius: Spaces.SM,
        borderTopRightRadius: Spaces.SM,
        paddingHorizontal: Spaces.LG,
        maxHeight: '80%',
        width: '100%',
    },
});
