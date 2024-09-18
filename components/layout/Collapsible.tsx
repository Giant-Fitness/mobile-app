// components/layout/Collapsible.tsx

import React, { PropsWithChildren, useState } from 'react';
import { Icon } from '@/components/icons/Icon';
import { StyleSheet, TouchableOpacity, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

interface CollapsibleProps extends PropsWithChildren {
    title: string;
    titleStyle?: TextStyle;
    headingStyle?: ViewStyle;
    isOpen?: boolean;
    activeOpacity?: number;
    iconStyle?: ViewStyle;
}

export function Collapsible({
    children,
    title,
    titleStyle,
    headingStyle,
    isOpen: isOpenProp = false,
    activeOpacity = 0.8,
    iconColor,
    iconStyle,
}: CollapsibleProps) {
    const [isOpen, setIsOpen] = useState(isOpenProp);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity style={[styles.heading, headingStyle]} onPress={() => setIsOpen(!isOpen)} activeOpacity={activeOpacity}>
                <ThemedText type='body' style={titleStyle}>
                    {title}
                </ThemedText>
                <Icon
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={moderateScale(16)}
                    color={themeColors.iconDefault}
                    style={[{ paddingTop: spacing.xxs }, iconStyle]}
                />
            </TouchableOpacity>
            {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
    },
    content: {
        marginTop: spacing.sm,
    },
});
