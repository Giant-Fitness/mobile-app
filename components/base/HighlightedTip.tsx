// components/base/HighlightedTip.tsx

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/icons/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

type HighlightedTipProps = {
    iconName: string;
    tipText: string;
};

export const HighlightedTip: React.FC<HighlightedTipProps> = ({ iconName, tipText }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.container, styles.shadow]}>
            <ThemedView style={[styles.tipContainer, { backgroundColor: themeColors.tipBackground }]}>
                <Icon name={iconName} size={moderateScale(14)} color={themeColors.tipIcon} style={styles.tipIcon} />
                <ThemedText type='bodySmall' style={[styles.tipText, { color: themeColors.tipText }]}>
                    {tipText}
                </ThemedText>
            </ThemedView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: spacing.xl,
        marginHorizontal: spacing.lg,
        backgroundColor: Platform.OS === 'android' ? Colors.light.tipBackground : 'transparent', // Important for Android shadows
    },
    shadow: {
        // iOS Shadow
        shadowColor: 'rgba(0,80,0,0.25)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        // Android Shadow
        elevation: 5,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: spacing.xl, // Must match the container's borderRadius
        // Ensure no shadow properties here
    },
    tipIcon: {
        marginRight: spacing.sm,
    },
    tipText: {
        // Any additional text styling if needed
    },
});
