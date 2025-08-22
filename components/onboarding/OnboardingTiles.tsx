// components/onboarding/OnboardingTiles.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { LargeActionTile } from '@/components/home/LargeActionTile';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { debounce } from '@/utils/debounce';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

interface OnboardingTilesProps {
    isOnboardingComplete?: boolean;
}

export const OnboardingTiles: React.FC<OnboardingTilesProps> = ({ isOnboardingComplete }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    if (isOnboardingComplete) {
        return null; // No tiles needed
    }

    return (
        <View style={styles.tilesContainer}>
            <ThemedText type='titleLarge' style={styles.tilesTitle}>
                Complete Setup
            </ThemedText>

            <LargeActionTile
                title='Get started'
                description='Share your goals and lifestyle for personalized training and nutrition guidance'
                onPress={() => {
                    debounce(router, '/(app)/onboarding/biodata/step-1-gender');
                    trigger('soft');
                }}
                backgroundColor={themeColors.containerHighlight}
                image={require('@/assets/images/fist.png')}
                textColor={themeColors.highlightContainerText}
                height={220}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    tilesContainer: {},
    tilesTitle: {
        marginBottom: Spaces.MD,
        marginHorizontal: Spaces.LG,
    },
});
