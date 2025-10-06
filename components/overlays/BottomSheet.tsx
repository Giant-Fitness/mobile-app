// components/overlays/BottomSheet.tsx

import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Keyboard,
    Modal,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';

import { BlurView } from 'expo-blur';

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    disableBackdropPress?: boolean;
    keyboardAvoidingBehavior?: 'none' | 'padding' | 'position';
    animationType?: 'none' | 'slide' | 'fade';
    useScrollView?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export const BottomSheet: React.FC<BottomSheetProps> = ({
    visible,
    onClose,
    children,
    style,
    disableBackdropPress = false,
    keyboardAvoidingBehavior = 'position',
    animationType = 'slide',
    useScrollView = false,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    // Animation for blur fade
    const blurOpacity = useRef(new Animated.Value(0)).current;
    // Animation for modal position
    const translateY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (keyboardAvoidingBehavior === 'none') return;

        const keyboardWillShowListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (e) => {
            setKeyboardHeight(e.endCoordinates.height);
            setIsKeyboardVisible(true);

            if (keyboardAvoidingBehavior === 'position') {
                // Animate modal up to sit above keyboard
                Animated.timing(translateY, {
                    toValue: -e.endCoordinates.height,
                    duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
                    useNativeDriver: true,
                }).start();
            }
        });

        const keyboardWillHideListener = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', (e) => {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);

            if (keyboardAvoidingBehavior === 'position') {
                // Animate modal back to original position
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: Platform.OS === 'ios' ? e.duration || 250 : 250,
                    useNativeDriver: true,
                }).start();
            }
        });

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, [keyboardAvoidingBehavior, translateY]);

    // Handle blur animation when visibility changes
    useEffect(() => {
        if (visible) {
            Animated.timing(blurOpacity, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(blurOpacity, {
                toValue: 0,
                duration: 50,
                useNativeDriver: true,
            }).start();

            // Reset position when modal closes
            translateY.setValue(0);
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
        }
    }, [visible, blurOpacity, translateY]);

    const handleBackdropPress = () => {
        if (!disableBackdropPress) {
            // Dismiss keyboard first if it's visible
            if (isKeyboardVisible) {
                Keyboard.dismiss();
                return;
            }
            onClose();
        }
    };

    const handleModalPress = () => {
        // Dismiss keyboard when tapping anywhere in the modal content
        if (isKeyboardVisible) {
            Keyboard.dismiss();
        }
    };

    // Dynamic styles based on keyboard avoiding behavior
    const getDrawerStyle = () => {
        const baseStyle = [styles.drawer, { backgroundColor: themeColors.background }, style];

        if (keyboardAvoidingBehavior === 'padding' && keyboardHeight > 0) {
            return [
                ...baseStyle,
                {
                    maxHeight: screenHeight - keyboardHeight - 100, // Leave some breathing room
                },
            ];
        }

        return baseStyle;
    };

    const getModalContentStyle = () => {
        if (keyboardAvoidingBehavior === 'position') {
            return [
                styles.modalContent,
                {
                    transform: [{ translateY }],
                },
            ];
        }

        return styles.modalContent;
    };

    const renderContent = () => {
        if (useScrollView) {
            return (
                <ScrollView
                    contentContainerStyle={styles.container}
                    keyboardShouldPersistTaps='handled'
                    scrollEnabled={false}
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableOpacity style={styles.spacer} onPress={handleBackdropPress} activeOpacity={1} />

                    <TouchableWithoutFeedback onPress={handleModalPress}>
                        <ThemedView style={getDrawerStyle()}>{children}</ThemedView>
                    </TouchableWithoutFeedback>
                </ScrollView>
            );
        }

        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.spacer} onPress={handleBackdropPress} activeOpacity={1} />

                <TouchableWithoutFeedback onPress={handleModalPress}>
                    <ThemedView style={getDrawerStyle()}>{children}</ThemedView>
                </TouchableWithoutFeedback>
            </View>
        );
    };

    return (
        <View style={styles.wrapper}>
            {/* Blur Layer - Always present but animated opacity */}
            {visible && (
                <Animated.View style={[styles.blurContainer, { opacity: blurOpacity }]}>
                    <TouchableOpacity style={styles.overlay} onPress={handleBackdropPress} activeOpacity={1}>
                        <BlurView intensity={50} style={styles.blur} tint='systemUltraThinMaterial' experimentalBlurMethod='dimezisBlurView' />
                    </TouchableOpacity>
                </Animated.View>
            )}

            {/* Modal with Drawer - Uses built-in slide animation */}
            <Modal animationType={animationType} transparent={true} visible={visible} onRequestClose={onClose}>
                <Animated.View style={getModalContentStyle()}>{renderContent()}</Animated.View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        zIndex: 1000,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    blurContainer: {
        ...StyleSheet.absoluteFillObject,
        pointerEvents: 'auto',
    },
    overlay: {
        flex: 1,
    },
    blur: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    spacer: {
        flex: 1,
    },
    drawer: {
        borderTopLeftRadius: Spaces.SM,
        borderTopRightRadius: Spaces.SM,
        paddingHorizontal: Spaces.LG,
        maxHeight: '80%',
        width: '100%',
    },
});
