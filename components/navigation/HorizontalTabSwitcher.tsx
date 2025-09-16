// components/navigation/HorizontalTabSwitcher.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

export interface TabOption<T = string> {
    id: T;
    label: string;
    icon?: string;
}

interface HorizontalTabSwitcherProps<T = string> {
    tabs: TabOption<T>[];
    activeTab: T;
    onTabChange: (tabId: T) => void;
    style?: any;
    tabStyle?: any;
    activeTabBorderColor?: string;
    inactiveTabBorderColor?: string;
    showIcons?: boolean;
    minTabWidth?: number;
    enableHapticFeedback?: boolean;
}

export function HorizontalTabSwitcher<T = string>({
    tabs,
    activeTab,
    onTabChange,
    style,
    tabStyle,
    activeTabBorderColor,
    inactiveTabBorderColor,
    showIcons = true,
    minTabWidth = 100,
    enableHapticFeedback = true,
}: HorizontalTabSwitcherProps<T>) {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollViewRef = useRef<ScrollView>(null);

    // Default colors if not provided
    const activeBorderColor = activeTabBorderColor || themeColors.slateBlue;
    const inactiveBorderColor = inactiveTabBorderColor || themeColors.slateBlueTransparent;

    // Auto-scroll to active tab when it changes
    useEffect(() => {
        const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
        if (activeIndex !== -1 && scrollViewRef.current) {
            // Calculate the x position to center the active tab
            const tabWidth = minTabWidth;
            const scrollToX = Math.max(0, activeIndex * tabWidth - 200 / 2 + tabWidth / 2);

            scrollViewRef.current.scrollTo({
                x: scrollToX,
                animated: true,
            });
        }
    }, [activeTab, minTabWidth, tabs]);

    const handleTabPress = (tabId: T) => {
        if (enableHapticFeedback) {
            trigger('selection');
        }
        onTabChange(tabId);
    };

    // Determine if scrolling is needed
    const needsScrolling = tabs.length * minTabWidth > 350; // Approximate screen width minus padding

    const renderTab = (tab: TabOption<T>) => {
        const isActive = activeTab === tab.id;

        return (
            <TouchableOpacity
                key={String(tab.id)}
                style={[
                    styles.tab,
                    {
                        borderBottomColor: isActive ? activeBorderColor : inactiveBorderColor,
                        minWidth: needsScrolling ? minTabWidth : undefined,
                        flex: needsScrolling ? 0 : 1,
                    },
                    tabStyle,
                ]}
                onPress={() => handleTabPress(tab.id)}
                activeOpacity={1}
            >
                {showIcons && tab.icon && <Icon name={tab.icon} size={Sizes.iconSizeXS} color={themeColors.iconDefault} />}
                <ThemedText type='bodySmall' style={[styles.tabText, { color: themeColors.text }]} numberOfLines={1}>
                    {tab.label}
                </ThemedText>
            </TouchableOpacity>
        );
    };

    if (needsScrolling) {
        return (
            <ThemedView style={[styles.scrollableContainer, style]}>
                <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>
                    {tabs.map(renderTab)}
                </ScrollView>
            </ThemedView>
        );
    }

    // Non-scrollable version for few tabs
    return <ThemedView style={[styles.container, style]}>{tabs.map(renderTab)}</ThemedView>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderTopRightRadius: Spaces.SM,
        borderTopLeftRadius: Spaces.SM,
    },
    scrollableContainer: {
        borderTopRightRadius: Spaces.SM,
        borderTopLeftRadius: Spaces.SM,
    },
    scrollContent: {
        flexDirection: 'row',
        paddingHorizontal: Spaces.SM,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.SM,
        paddingHorizontal: Spaces.SM,
        gap: Spaces.XS,
        borderBottomWidth: 3,
    },
    tabText: {
        textAlign: 'center',
    },
});
