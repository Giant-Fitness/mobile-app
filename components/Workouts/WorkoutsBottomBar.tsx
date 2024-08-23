// components/WorkoutsBottomBar.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

type WorkoutsBottomBarProps = {
    onSortPress: () => void;
    onFilterPress: () => void;
    sortIcon: ComponentProps<typeof TabBarIcon>['name'];
    filterIcon: ComponentProps<typeof TabBarIcon>['name'];
};

export const WorkoutsBottomBar: React.FC<BottomBarProps> = ({ onSortPress, onFilterPress, sortIcon, filterIcon }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={onFilterPress}>
                <TabBarIcon name={filterIcon} style={{ color: themeColors.tabIconDefault }} size={20} />
                <Text style={[styles.buttonText, { color: themeColors.tabIconDefault }]}>Filter</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: themeColors.tabIconDefault }]} />
            <TouchableOpacity style={styles.button} onPress={onSortPress}>
                <TabBarIcon name={sortIcon} style={{ color: themeColors.tabIconDefault }} size={18} />
                <ThemedText type='default' style={[styles.buttonText, { color: themeColors.tabIconDefault }]}>
                    Sort
                </ThemedText>
            </TouchableOpacity>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        marginLeft: 8,
    },
    divider: {
        width: 1,
        height: '50%', // Smaller height for the divider
        alignSelf: 'center', // Center the divider vertically
        marginHorizontal: 10, // Space between buttons and divider
    },
});
