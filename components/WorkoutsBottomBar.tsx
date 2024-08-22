// components/WorkoutsBottomBar.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { TabBarIcon } from './navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from './ThemedView';

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
                <TabBarIcon name={filterIcon} style={{ color: themeColors.icon }} size={20} />
                <Text style={[styles.buttonText, { color: themeColors.icon }]}>Filter</Text>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: themeColors.icon }]} />
            <TouchableOpacity style={styles.button} onPress={onSortPress}>
                <TabBarIcon name={sortIcon} style={{ color: themeColors.icon }} size={20} />
                <Text style={[styles.buttonText, { color: themeColors.icon }]}>Sort</Text>
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
        borderTopWidth: 1,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        marginLeft: 8,
        fontSize: 16,
    },
    divider: {
        width: 1,
        height: '60%', // Smaller height for the divider
        alignSelf: 'center', // Center the divider vertically
        marginHorizontal: 10, // Space between buttons and divider
    },
});
