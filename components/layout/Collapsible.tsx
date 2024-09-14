// components/layout/Collapsible.tsx

import React, { PropsWithChildren, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity style={styles.heading} onPress={() => setIsOpen(!isOpen)} activeOpacity={0.8}>
                <ThemedText type='body'>{title}</ThemedText>
                <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={moderateScale(16)}
                    color={themeColors.iconDefault}
                    style={{ paddingTop: spacing.xxs }}
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
        paddingBottom: spacing.sm,
        paddingTop: spacing.sm,
        paddingLeft: spacing.lg,
        paddingRight: spacing.lg,
        gap: spacing.xs,
    },
    content: {
        marginTop: spacing.sm,
    },
});
