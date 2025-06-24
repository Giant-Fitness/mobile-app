// components/layout/Collapsible.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { PropsWithChildren, useState } from 'react';
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface CollapsibleProps extends PropsWithChildren {
    title: string;
    titleStyle?: StyleProp<TextStyle>;
    headingStyle?: StyleProp<ViewStyle>;
    isOpen?: boolean;
    activeOpacity?: number;
    iconStyle?: StyleProp<TextStyle>;
}

export function Collapsible({ children, title, titleStyle, headingStyle, isOpen: isOpenProp = false, activeOpacity = 0.8, iconStyle }: CollapsibleProps) {
    const [isOpen, setIsOpen] = useState(isOpenProp);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity style={[styles.heading, headingStyle]} onPress={() => setIsOpen(!isOpen)} activeOpacity={activeOpacity}>
                <ThemedText type='body' style={titleStyle}>
                    {title}
                </ThemedText>
                <Icon
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={Sizes.iconSizeSM}
                    color={themeColors.iconDefault}
                    style={[{ paddingTop: Spaces.XXS }, iconStyle]}
                />
            </TouchableOpacity>
            {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spaces.MD,
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.LG,
        alignItems: 'center',
    },
    content: {
        marginTop: Spaces.SM,
    },
});
