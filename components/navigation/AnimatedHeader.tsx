// components/navigation/AnimatedHeader.tsx

import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor, useDerivedValue } from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { BackButton } from '@/components/navigation/BackButton';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';

type ActionButtonProps = {
    icon: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
};

type AnimatedHeaderProps = {
    scrollY: Animated.SharedValue<number>;
    onBackPress?: () => void;
    headerInterpolationStart?: number;
    headerInterpolationEnd?: number;
    disableColorChange?: boolean;
    title?: string;
    backButtonColor?: string;
    headerBackground?: string;
    menuIcon?: string;
    onMenuPress?: () => void;
    disableBackButtonAnimation?: boolean; // New prop
    actionButton?: ActionButtonProps;
};

export const AnimatedHeader: React.FC<AnimatedHeaderProps> = ({
    scrollY,
    onBackPress,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 170,
    disableColorChange = false,
    title,
    backButtonColor,
    headerBackground = 'transparent',
    menuIcon = 'more-horizontal',
    disableBackButtonAnimation = false,
    onMenuPress,
    actionButton,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const animatedHeaderStyle = useAnimatedStyle(() => {
        if (disableColorChange) {
            return { backgroundColor: headerBackground || 'transparent' };
        }
        const backgroundColor = interpolateColor(
            scrollY.value,
            [headerInterpolationStart, headerInterpolationEnd],
            [themeColors.transparent, themeColors.background],
        );
        return { backgroundColor };
    });

    const animatedIconColor = useDerivedValue(() => {
        if (disableColorChange || disableBackButtonAnimation) {
            return backButtonColor || themeColors.text;
        }
        return interpolateColor(scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [themeColors.white, themeColors.text]);
    });

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <BackButton style={styles.backButton} animatedColor={animatedIconColor} onBackPress={onBackPress} />
            {title && (
                <ThemedText type='title' style={[styles.title, { color: themeColors.text }]}>
                    {title}
                </ThemedText>
            )}
            {actionButton ? (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={actionButton.onPress}
                    disabled={actionButton.isLoading || actionButton.disabled}
                    activeOpacity={1}
                >
                    {actionButton.isLoading ? (
                        <ActivityIndicator color={themeColors.text} size='small' />
                    ) : (
                        <Icon name={actionButton.icon} size={22} color={animatedIconColor} style={{ opacity: actionButton.disabled ? 0.2 : 1 }} />
                    )}
                </TouchableOpacity>
            ) : (
                onMenuPress && (
                    <TouchableOpacity style={styles.menuButton} onPress={onMenuPress} activeOpacity={1}>
                        <Icon name={menuIcon} size={22} color={animatedIconColor} />
                    </TouchableOpacity>
                )
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                height: Sizes.headerHeight,
            },
            android: {
                height: Sizes.headerHeight,
            },
        }),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.MD,
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        ...Platform.select({
            ios: {
                top: Spaces.XXL + Spaces.SM, // iOS-specific top positioning
            },
            android: {
                top: Spaces.XXL, // android-specific top positioning
            },
        }),
        left: Spaces.MD,
        zIndex: 10,
        padding: Spaces.SM, // Add padding to increase hitbox
    },
    title: {
        ...Platform.select({
            ios: {
                top: Spaces.LG, // iOS-specific top positioning
            },
            android: {
                top: Spaces.SM + Spaces.XS, // android-specific top positioning
            },
        }),
    },
    menuButton: {
        position: 'absolute',
        ...Platform.select({
            ios: {
                top: Spaces.XXL + Spaces.SM, // iOS-specific top positioning
            },
            android: {
                top: Spaces.XL + Spaces.SM + Spaces.XS, // android-specific top positioning
            },
        }),
        right: Spaces.LG,
        zIndex: 10,
        padding: Spaces.SM,
    },
    actionButton: {
        position: 'absolute',
        ...Platform.select({
            ios: {
                top: Spaces.XXL + Spaces.SM, // iOS-specific top positioning
            },
            android: {
                top: Spaces.XXL, // android-specific top positioning
            },
        }),
        right: Spaces.LG,
        zIndex: 10,
        padding: Spaces.SM,
    },
});

export default AnimatedHeader;
