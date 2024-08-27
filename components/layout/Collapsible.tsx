// components/layout/Collapsible.tsx

import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity style={styles.heading} onPress={() => setIsOpen(!isOpen)} activeOpacity={0.8}>
                <ThemedText type='body'>{title}</ThemedText>
                <Ionicons name={isOpen ? 'chevron-down' : 'chevron-forward-outline'} size={16} color={themeColors.iconDefault} />
            </TouchableOpacity>
            {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 6,
        paddingBottom: 16,
        paddingTop: 16,
        paddingLeft: 24,
        paddingRight: 24,
    },
    content: {
        marginTop: 6,
    },
});
