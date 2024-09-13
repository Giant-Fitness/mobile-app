// components/base/HighlightedTip.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
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
        <ThemedView style={[styles.tipContainer, { backgroundColor: themeColors.tipBackground }]}>
            <Icon name={iconName} size={moderateScale(14)} color={themeColors.tipIcon} style={styles.tipIcon} />
            <ThemedText type='bodySmall' style={[styles.tipText, { color: themeColors.tipText }]}>
                {tipText}
            </ThemedText>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: spacing.xl,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        // Elevation for Android
        elevation: 2,
        marginHorizontal: spacing.lg,
        alignSelf: 'flex-start',
    },
    tipIcon: {
        marginRight: spacing.sm,
        marginTop: spacing.xs,
    },
    tipText: {},
});
