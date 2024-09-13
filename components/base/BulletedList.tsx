// components/base/BulletedList.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { spacing, moderateScale } from '@/utils/spacing';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon'; // Assuming you have an Icon component or use a library like react-native-vector-icons

type BulletedListProps = {
    items: string[];
};

export const BulletedList: React.FC<BulletedListProps> = ({ items }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView>
            {items.map((item, index) => (
                <ThemedView key={index} style={[styles.bulletItem]}>
                    {/*, { backgroundColor: themeColors.container }]}>*/}
                    <ThemedText style={[styles.bulletPoint, { color: themeColors.subText }]}>{'\u2022'}</ThemedText>
                    <ThemedText type='body' style={[styles.bulletText, { color: themeColors.text }]}>
                        {item}
                    </ThemedText>
                </ThemedView>
            ))}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingBottom: spacing.md,
        borderRadius: spacing.xs,
    },
    bulletPoint: {
        marginRight: spacing.md,
    },
    bulletText: {
        flex: 1,
    },
});
