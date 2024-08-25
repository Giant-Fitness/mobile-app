// components/workouts/WorkoutsBottomBar.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
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

export const WorkoutsBottomBar: React.FC<WorkoutsBottomBarProps> = ({ onSortPress, onFilterPress, sortIcon, filterIcon }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.container, { borderColor: themeColors.containerBorderColor }]}>
            <TouchableOpacity style={styles.button} onPress={onFilterPress}>
                <View style={styles.iconAndText}>
                    <TabBarIcon name={filterIcon} style={[styles.icon, { color: themeColors.tabIconDefault, marginRight: 4 }]} size={15} />
                    <ThemedText type='buttonSmall' style={[styles.text, { color: themeColors.tabIconDefault }]}>
                        Filter
                    </ThemedText>
                </View>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: themeColors.tabIconDefault }]} />
            <TouchableOpacity style={styles.button} onPress={onSortPress}>
                <View style={styles.iconAndText}>
                    <TabBarIcon name={sortIcon} style={[styles.icon, { color: themeColors.tabIconDefault, marginRight: 4 }]} size={16} />
                    <ThemedText type='buttonSmall' style={[styles.text, { color: themeColors.tabIconDefault }]}>
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
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 40,
        borderTopWidth: 0.3,
        height: 90,
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
    },
    icon: {
        alignSelf: 'center',
        marginTop: -2,
    },
    text: {
        marginLeft: 4,
    },
    divider: {
        width: 0.5,
        height: '40%',
        alignSelf: 'center',
    },
});
