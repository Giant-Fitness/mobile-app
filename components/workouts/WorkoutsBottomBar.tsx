// components/workouts/WorkoutsBottomBar.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/icons/Icon';

type WorkoutsBottomBarProps = {
    onSortPress: () => void;
    onFilterPress: () => void;
    appliedFilterCount?: number;
};

export const WorkoutsBottomBar: React.FC<WorkoutsBottomBarProps> = ({ onSortPress, onFilterPress, appliedFilterCount = 0 }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.container, { borderColor: themeColors.systemBorderColor }]}>
            <TouchableOpacity style={styles.button} onPress={onFilterPress}>
                <View style={styles.iconAndText}>
                    <Icon name='filter' style={[styles.icon, { marginRight: 4 }]} color={themeColors.text} size={15} />
                    <ThemedText type='buttonSmall' style={[styles.text, { color: themeColors.text }]}>
                        Filter
                    </ThemedText>
                    {appliedFilterCount > 0 && (
                        <View style={[styles.badge, { backgroundColor: themeColors.subText }]}>
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
                    <Icon name='sort' style={[styles.icon, { marginRight: 4 }]} color={themeColors.text} size={16} />
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
            ios: 10, // Height for iOS
            android: 20, // Height for Android
        }),
        paddingHorizontal: 20,
        paddingBottom: Platform.select({
            ios: 40, // Height for iOS
            android: 25, // Height for Android
        }),
        borderTopWidth: 0.3,
        height: Platform.select({
            ios: 90, // Height for iOS
            android: 70, // Height for Android
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
        position: 'relative', // Allows positioning of the badge
    },
    icon: {
        alignSelf: 'center',
        marginTop: -2,
    },
    text: {
        marginLeft: 4,
    },
    badge: {
        position: 'absolute',
        top: -6, // Position above the "Filter" text
        right: -14, // Position to the right of the "Filter" text
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 8,
        lineHeight: 12,
    },
    divider: {
        width: 0.5,
        height: '40%',
        alignSelf: 'center',
    },
});
