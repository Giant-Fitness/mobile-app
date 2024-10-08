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

const MenuItem = ({ icon, text, onPress, color, chevronColor, leftIconColor, backgroundColor }) => (
    <TouchableOpacity style={styles.menuItem} activeOpacity={1} onPress={onPress}>
        <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor }]}>
                <Icon name={icon} size={Sizes.iconSizeMD} color={leftIconColor} />
            </View>
            <ThemedText type='overline' style={[styles.menuText, { color }]}>
                {text}
            </ThemedText>
        </View>
        <Icon name='chevron-forward' size={Sizes.iconSizeSM} color={chevronColor} style={styles.menuChevron} />
    </TouchableOpacity>
);

export default function InactiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();

    const navigateTo = (route, params = {}) => {
        navigation.navigate(route, params);
    };

    const menuItems = [{ icon: 'library', text: 'Browse Library', onPress: () => navigateTo('programs/browse-programs') }];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ThemedView style={[styles.infoContainer, { backgroundColor: themeColors.tipBackground }, { marginTop: Spaces.XL }]}>
                <ThemedText type='bodySmall' style={[styles.infoText, { color: themeColors.tipText }]}>
                    Structured for Success: Our Training Plans turn goals into achievements!
                </ThemedText>
            </ThemedView>
            <View style={styles.menuWrapper}>
                {menuItems.map((item, index) => (
                    <ThemedView key={index} style={[styles.menuContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <MenuItem
                            {...item}
                            color={themeColors.text}
                            chevronColor={themeColors.iconDefault}
                            leftIconColor={themeColors.tipText}
                            backgroundColor={`${themeColors.tipBackground}`}
                        />
                    </ThemedView>
                ))}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    menuItem: {
        paddingVertical: Spaces.LG,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: Spaces.SM,
    },
    menuChevron: {
        marginLeft: Spaces.SM,
    },
    menuContainer: {
        marginHorizontal: Spaces.LG,
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.MD,
        borderRadius: Spaces.MD,
    },
    iconBox: {
        width: Spaces.XXL,
        height: Spaces.XXL,
        borderRadius: Spaces.SM,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spaces.MD,
    },
    infoContainer: {
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.XL,
        marginHorizontal: Spaces.LG,
        borderRadius: Spaces.MD,
    },
    infoText: {
        textAlign: 'center',
    },
});
