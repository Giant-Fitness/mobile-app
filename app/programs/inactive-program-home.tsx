// app/programs/inactive-program-home.tsx

import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

export default function InactiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();

    const navigateToBrowsePrograms = () => {
        navigation.navigate('programs/browse-programs');
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ThemedView>
                <TouchableOpacity style={styles.menuItem} activeOpacity={1} onPress={navigateToBrowsePrograms}>
                    <ThemedText type='body' style={[{ color: themeColors.text }]}>
                        Browse Programs
                    </ThemedText>
                    <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={themeColors.iconDefault} />
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    menuItem: {
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.LG,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
