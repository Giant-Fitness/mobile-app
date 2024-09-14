// components/workouts/WorkoutsBottomBar.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/icons/Icon';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

type WorkoutsBottomBarProps = {
    onSortPress: () => void;
    onFilterPress: () => void;
    appliedFilterCount?: number;
};

export const WorkoutsBottomBar: React.FC<WorkoutsBottomBarProps> = ({ onSortPress, onFilterPress, appliedFilterCount = 0 }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    return (
        <ThemedView style={[styles.container, { borderColor: themeColors.systemBorderColor }]}>
            <TouchableOpacity style={styles.button} onPress={onFilterPress}>
                <View style={styles.iconAndText}>
                    <Icon name='filter' style={[styles.icon, { marginRight: spacing.xs }]} color={themeColors.text} size={moderateScale(15)} />
                    <ThemedText type='buttonSmall' style={[styles.text, { color: themeColors.text }]}>
                        Filter
                    </ThemedText>
                    {appliedFilterCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: themeColors.text }]}>
                            <ThemedText type='buttonSmall' style={[styles.badgeText, { color: themeColors.background }]}>
                                {appliedFilterCount}
                            </ThemedText>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: themeColors.text }]} />
            <TouchableOpacity style={styles.button} onPress={onSortPress}>
                <View style={styles.iconAndText}>
                    <Icon name='sort' style={[styles.icon, { marginRight: spacing.xs }]} color={themeColors.text} size={moderateScale(16)} />
                    <ThemedText type='buttonSmall' style={[styles.text, { color: themeColors.text }]}>
                        Sort
                    </ThemedText>
                </View>
            </TouchableOpacity>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: Platform.select({
            ios: spacing.sm, // Adjusted for scaling
            android: spacing.md, // Adjusted for scaling
        }),
        paddingHorizontal: spacing.md,
        paddingBottom: Platform.select({
            ios: spacing.xl, // Adjusted for scaling
            android: spacing.lg, // Adjusted for scaling
        }),
        borderTopWidth: scale(0.3),
        height: Platform.select({
            ios: verticalScale(80), // Adjusted for scaling
            android: verticalScale(60), // Adjusted for scaling
        }),
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
    },
    button: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconAndText: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    icon: {
        alignSelf: 'center',
    },
    text: {
        marginLeft: spacing.xs,
    },
    badge: {
        position: 'absolute',
        top: verticalScale(-6),
        right: scale(-14),
        minWidth: spacing.md,
        height: spacing.md,
        borderRadius: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
    },
    badgeText: {
        fontSize: spacing.sm,
        lineHeight: verticalScale(12),
    },
    divider: {
        width: scale(0.5),
        height: '40%',
        alignSelf: 'center',
    },
});
