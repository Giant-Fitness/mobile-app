// components/navigation/SectionProgressHeader.tsx

import { BackButton } from '@/components/navigation/BackButton';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

type SectionProgressHeaderProps = {
    scrollY?: Animated.SharedValue<number>;
    sectionName: string;
    currentStep?: number;
    totalSteps?: number;
    onBackPress?: () => void;
    headerInterpolationStart?: number;
    headerInterpolationEnd?: number;
    disableColorChange?: boolean;
    headerBackground?: string;
    backButtonColor?: string;
};

export const SectionProgressHeader: React.FC<SectionProgressHeaderProps> = ({
    scrollY,
    sectionName,
    currentStep,
    totalSteps,
    onBackPress,
    headerInterpolationStart = 100,
    headerInterpolationEnd = 170,
    disableColorChange = false,
    headerBackground = 'transparent',
    backButtonColor,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Determine if we should show progress bar
    const showProgress = currentStep !== undefined && totalSteps !== undefined && totalSteps > 0;
    const progressPercentage = showProgress ? (currentStep / totalSteps) * 100 : 0;

    // Adjust header height based on whether progress bar is shown
    const headerHeight = showProgress ? Sizes.headerHeight + Spaces.XL : Sizes.headerHeight + Spaces.MD;

    const animatedHeaderStyle = useAnimatedStyle(() => {
        if (disableColorChange || !scrollY) {
            return {
                backgroundColor: headerBackground || 'transparent',
                height: headerHeight,
            };
        }
        const backgroundColor = interpolateColor(
            scrollY.value,
            [headerInterpolationStart, headerInterpolationEnd],
            [themeColors.transparent, themeColors.background],
        );
        return {
            backgroundColor,
            height: headerHeight,
        };
    });

    const animatedIconColor = useDerivedValue(() => {
        if (disableColorChange || !scrollY) {
            return backButtonColor || themeColors.text;
        }
        return interpolateColor(scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [themeColors.white, themeColors.text]);
    });

    const animatedTextColor = useDerivedValue(() => {
        if (disableColorChange || !scrollY) {
            return themeColors.text;
        }
        return interpolateColor(scrollY.value, [headerInterpolationStart, headerInterpolationEnd], [themeColors.white, themeColors.text]);
    });

    const animatedTextStyle = useAnimatedStyle(() => ({
        color: animatedTextColor.value,
    }));

    return (
        <Animated.View style={[styles.headerContainer, animatedHeaderStyle]}>
            <BackButton style={styles.backButton} animatedColor={animatedIconColor} onBackPress={onBackPress} />

            <Animated.Text style={[styles.sectionName, animatedTextStyle]}>{sectionName}</Animated.Text>

            {showProgress && (
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBackground, { backgroundColor: themeColors.systemBorderColor }]}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: themeColors.buttonPrimary,
                                    width: `${progressPercentage}%`,
                                },
                            ]}
                        />
                    </View>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        position: 'absolute',
        top: Spaces.SM,
        left: 0,
        right: 0,
        flexDirection: 'column',
        paddingHorizontal: Spaces.MD,
        zIndex: 10,
    },
    backButton: {
        position: 'absolute',
        ...Platform.select({
            ios: {
                top: Spaces.XXL + Spaces.XS,
            },
            android: {
                top: Spaces.XXL,
            },
        }),
        left: Spaces.MD,
        zIndex: 10,
        padding: Spaces.SM,
    },
    sectionName: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        ...Platform.select({
            ios: {
                top: Spaces.XXL + Spaces.SM,
            },
            android: {
                top: Spaces.XXL,
            },
        }),
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        gap: Spaces.SM,
        ...Platform.select({
            ios: {
                top: Spaces.XXL + Spaces.LG,
            },
            android: {
                top: Spaces.XXL + Spaces.SM,
            },
        }),
    },
    progressBackground: {
        flex: 1,
        height: Spaces.XS,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 14,
        fontWeight: '500',
        minWidth: 60,
        textAlign: 'right',
    },
});

export default SectionProgressHeader;
