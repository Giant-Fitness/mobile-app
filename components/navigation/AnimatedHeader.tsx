// components/navigation/AnimatedHeader.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { IconButton } from '@/components/buttons/IconButton';
import { BackButton } from '@/components/navigation/BackButton';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import Animated, { interpolate, interpolateColor, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

type ActionButtonProps = {
    icon: string;
    iconSize?: number;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
};

type DateNavigationProps = {
    selectedDate: Date;
    onDatePress: () => void;
    onPreviousDay: () => void;
    onNextDay: () => void;
    formatDate?: (date: Date) => string;
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
    disableBackButtonAnimation?: boolean;
    disableBackButton?: boolean;
    actionButton?: ActionButtonProps;
    titleFadeIn?: boolean;
    dateNavigation?: DateNavigationProps;
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
    disableBackButton = false,
    onMenuPress,
    actionButton,
    titleFadeIn = false,
    dateNavigation,
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

    // animated style for title opacity when titleFadeIn is enabled
    const animatedTitleStyle = useAnimatedStyle(() => {
        if (!titleFadeIn) {
            return { opacity: 1 }; // Normal behavior
        }
        const opacity = interpolate(scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [0, 1], 'clamp');
        return { opacity };
    });

    // Default date formatter
    const defaultFormatDate = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    const formatDate = dateNavigation?.formatDate || defaultFormatDate;

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            {/* Content Container */}
            <View style={dateNavigation ? styles.dateNavigationContainer : styles.contentContainer}>
                {dateNavigation ? (
                    // Calendar mode - tight layout with chevrons close to date
                    <View style={styles.calendarContent}>
                        <TouchableOpacity onPress={dateNavigation.onPreviousDay} style={styles.chevronButton} activeOpacity={1}>
                            <Icon name='chevron-back' color={animatedIconColor} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={dateNavigation.onDatePress} style={styles.dateButton} activeOpacity={1}>
                            <Animated.View style={[styles.dateButtonContent, animatedTitleStyle]}>
                                <ThemedText type='title' style={[styles.title, { color: themeColors.text }]}>
                                    {formatDate(dateNavigation.selectedDate)}
                                </ThemedText>
                                <Icon name='caret-down' size={Sizes.iconSizeXS} color={animatedIconColor} style={styles.dropdownIcon} />
                            </Animated.View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={dateNavigation.onNextDay} style={styles.chevronButton} activeOpacity={1}>
                            <Icon name='chevron-forward' color={animatedIconColor} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Left Section */}
                        <View style={styles.leftSection}>
                            {!disableBackButton && <BackButton animatedColor={animatedIconColor} onBackPress={onBackPress} />}
                        </View>

                        {/* Center Section */}
                        <View style={styles.centerSection}>
                            {title && (
                                <Animated.View style={animatedTitleStyle}>
                                    <ThemedText type='title' style={[styles.title, { color: themeColors.text }]}>
                                        {title}
                                    </ThemedText>
                                </Animated.View>
                            )}
                        </View>

                        {/* Right Section */}
                        <View style={styles.rightSection}>
                            {actionButton ? (
                                <TouchableOpacity onPress={actionButton.onPress} disabled={actionButton.isLoading || actionButton.disabled} activeOpacity={0.7}>
                                    {actionButton.isLoading ? (
                                        <ActivityIndicator color={themeColors.text} size='small' />
                                    ) : (
                                        <Icon
                                            name={actionButton.icon}
                                            size={actionButton.iconSize || 22}
                                            color={animatedIconColor}
                                            style={{ opacity: actionButton.disabled ? 0.2 : 1 }}
                                        />
                                    )}
                                </TouchableOpacity>
                            ) : (
                                onMenuPress && (
                                    <IconButton
                                        onPress={onMenuPress}
                                        iconName={menuIcon}
                                        iconSize={22}
                                        size={25}
                                        backgroundColor='transparent'
                                        iconColor={animatedIconColor}
                                        addBorder={false}
                                        haptic='impactMedium'
                                    />
                                )
                            )}
                        </View>
                    </>
                )}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: Sizes.headerHeight,
        zIndex: 10,
        ...Platform.select({
            ios: {
                paddingTop: 44,
            },
            android: {
                paddingTop: 24,
            },
        }),
    },
    contentContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: Sizes.headerHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.MD,
        // Apply the same top positioning as the collapsed title to align icons with text
        ...Platform.select({
            ios: {
                top: Spaces.LG, // iOS-specific top positioning
            },
            android: {
                top: Spaces.SM + Spaces.XS, // android-specific top positioning
            },
        }),
    },
    dateNavigationContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: Sizes.headerHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.MD,
        ...Platform.select({
            ios: {
                top: Spaces.LG,
            },
            android: {
                top: Spaces.SM + Spaces.XS,
            },
        }),
    },
    calendarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftSection: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    centerSection: {
        flex: 2, // Give more space to center for longer titles
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightSection: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: Spaces.SM,
    },
    title: {
        textAlign: 'center',
    },
    chevronButton: {
        padding: Spaces.SM,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateButton: {
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.MD,
    },
    dateButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownIcon: {
        marginLeft: Spaces.XS,
        opacity: 1,
    },
});

export default AnimatedHeader;
