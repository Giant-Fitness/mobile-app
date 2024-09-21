// components/alerts/HighlightedTip.tsx

import React from 'react';
import { StyleSheet, View, Platform, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

type HighlightedTipProps = {
    iconName: string;
    tipText: string;
    disableIcon?: boolean;
    textType?: string;
    containerStyle?: ViewStyle;
};

export const HighlightedTip: React.FC<HighlightedTipProps> = ({ iconName, tipText, disableIcon = false, textType = 'bodySmall', containerStyle }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.tipContainer, styles.shadow, { backgroundColor: themeColors.tipBackground }, containerStyle]}>
            {!disableIcon && <Icon name={iconName} size={Sizes.iconSizeSM} color={themeColors.tipIcon} style={styles.tipIcon} />}
            <ThemedText type={textType} style={[styles.tipText, { color: themeColors.tipText }]}>
                {tipText}
            </ThemedText>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
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
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.LG,
        marginHorizontal: Spaces.LG,
        borderRadius: Spaces.XL, // Must match the container's borderRadius
    },
    tipIcon: {
        marginRight: Spaces.SM,
    },
    tipText: {
        // Any additional text styling if needed
    },
});
