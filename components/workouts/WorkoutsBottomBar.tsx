// components/workouts/WorkoutsBottomBar.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/icons/Icon';

type WorkoutsBottomBarProps = {
    onSortPress: () => void;
    onFilterPress: () => void;
};

export const WorkoutsBottomBar: React.FC<WorkoutsBottomBarProps> = ({ onSortPress, onFilterPress }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.container, { borderColor: themeColors.systemBorderColor }]}>
            <TouchableOpacity style={styles.button} onPress={onFilterPress}>
                <View style={styles.iconAndText}>
                    <Icon name='filter' style={[styles.icon, { marginRight: 4 }]} color={themeColors.iconDefault} size={15} />
                    <ThemedText type='buttonSmall' style={[styles.text, { color: themeColors.iconDefault }]}>
                        Filter
                    </ThemedText>
                </View>
            </TouchableOpacity>
            <View style={[styles.divider, { backgroundColor: themeColors.iconDefault }]} />
            <TouchableOpacity style={styles.button} onPress={onSortPress}>
                <View style={styles.iconAndText}>
                    <Icon name='sort' style={[styles.icon, { marginRight: 4 }]} color={themeColors.iconDefault} size={16} />
                    <ThemedText type='buttonSmall' style={[styles.text, { color: themeColors.iconDefault }]}>
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
