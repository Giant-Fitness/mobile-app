// components/base/BulletedList.tsx

import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { spacing } from '@/utils/spacing';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon';
import { moderateScale } from '@/utils/scaling';

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
                    <Icon name='check' size={moderateScale(12)} style={[styles.bulletPoint, { color: themeColors.text }]} />
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
        marginRight: spacing.sm + spacing.xs,
        marginTop: spacing.xs + spacing.xxs,
    },
    bulletText: {
        flex: 1,
    },
});
