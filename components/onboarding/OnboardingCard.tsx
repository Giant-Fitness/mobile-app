// components/onboarding/OnboardingCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { lightenColor } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

interface OnboardingCardProps {
    isOnboardingComplete?: boolean;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({ isOnboardingComplete }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handlePress = () => {
        debounce(router, '/(app)/onboarding/biodata/step-1-gender');
        trigger('selection');
    };

    if (isOnboardingComplete) {
        return null;
    }

    const backgroundColor = themeColors.containerHighlight;
    const textColor = themeColors.highlightContainerText;
    const descriptionColor = lightenColor(themeColors.subTextSecondary, 0.1);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={handlePress}
                style={[
                    styles.menuItem,
                    {
                        backgroundColor,
                        borderColor: textColor,
                        borderWidth: StyleSheet.hairlineWidth,
                    },
                ]}
                activeOpacity={1}
            >
                <View style={styles.menuContentWrapper}>
                    <View style={styles.menuContent}>
                        <View style={styles.titleContainer}>
                            <ThemedText type='title' style={[styles.menuTitle, { color: textColor }]}>
                                Get Started
                            </ThemedText>
                            <Icon name='chevron-forward' color={textColor} size={18} style={styles.chevron} />
                        </View>
                        <ThemedText type='overline' style={[styles.menuDescription, { color: descriptionColor }]}>
                            Share your goals and lifestyle for personalized training and nutrition guidance
                        </ThemedText>
                    </View>
                    <Image
                        source={require('@/assets/images/wand.png')}
                        style={[
                            styles.menuBackgroundImage,
                            {
                                opacity: 0.12,
                                tintColor: textColor,
                            },
                        ]}
                        resizeMode='contain'
                    />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spaces.SM,
    },
    menuItem: {
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    menuContentWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuContent: {
        padding: Spaces.LG,
        flex: 1,
        zIndex: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: Spaces.XS,
    },
    menuTitle: {
        marginBottom: 0,
    },
    chevron: {
        marginLeft: Spaces.XS,
    },
    menuDescription: {
        lineHeight: 21,
        fontSize: 13,
        maxWidth: '90%',
    },
    menuBackgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.SM,
        width: 200,
        height: '60%',
    },
});
