// components/inputs/RadioPill.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { lightenColor } from '@/utils/colorUtils';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type RadioPillProps = {
    selected: boolean;
    onPress: () => void;
    text: string;
};

export const RadioPill = ({ selected, onPress, text }: RadioPillProps) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[styles.radioPill, selected && styles.radioPillSelected, { backgroundColor: themeColors.background }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.radioCircle, { borderColor: lightenColor(themeColors.iconSelected, 0.2) }]}>
                {selected && <View style={[styles.radioInnerCircle, { backgroundColor: lightenColor(themeColors.iconSelected, 0.2) }]} />}
            </View>
            <ThemedText type='body' style={styles.radioPillText}>
                {text}
            </ThemedText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    radioPill: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        marginHorizontal: Spaces.XS,
        borderRadius: Spaces.SM,
        backgroundColor: 'transparent',
    },
    radioPillSelected: {},
    radioCircle: {
        width: 16,
        height: 16,
        borderRadius: 10,
        borderWidth: 2,
        marginRight: Spaces.SM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInnerCircle: {
        width: 8,
        height: 8,
        borderRadius: 5,
    },
    radioPillText: {},
});
