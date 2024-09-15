// components/layout/SortDrawer.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomDrawer } from '@/components/layout/BottomDrawer';
import { ThemedText } from '@/components/base/ThemedText';
import { TextButton } from '@/components/base/TextButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon';
import { scale, moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

interface SortOption {
    type: string;
    orders: string[];
}

interface SortDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (sortOption: { type: string; order: string }) => void;
    initialSort?: { type: string; order: string };
    sortOptions: SortOption[];
    title: string;
}

export const SortDrawer: React.FC<SortDrawerProps> = ({ visible, onClose, onApply, initialSort = { type: '', order: '' }, sortOptions, title }) => {
    const [selectedSort, setSelectedSort] = useState<{ type: string; order: string }>(initialSort);
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const handleApply = () => {
        onApply(selectedSort);
        onClose();
    };

    const handleOptionSelect = (type: string, order: string) => {
        setSelectedSort({ type, order });
    };

    useEffect(() => {
        if (!visible) {
            setSelectedSort(initialSort);
        }
    }, [visible, initialSort]);

    return (
        <BottomDrawer visible={visible} onClose={onClose} style={{ paddingHorizontal: 0 }}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <ThemedText type='title'>{title}</ThemedText>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    activeOpacity={0.8}
                    hitSlop={{ top: scale(20), bottom: scale(20), left: scale(20), right: scale(20) }}
                >
                    <Icon name='close' size={moderateScale(21)} color={themeColors.subText} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionContainer}>
                {sortOptions.map(({ type, orders }) => (
                    <View key={type} style={styles.section}>
                        <ThemedText type='bodyMedium' style={styles.sectionTitle}>
                            {type}
                        </ThemedText>
                        <View style={[{ backgroundColor: themeColors.container }]}>
                            {orders.map((order) => (
                                <TouchableOpacity key={order} style={styles.optionButton} onPress={() => handleOptionSelect(type, order)} activeOpacity={1}>
                                    <ThemedText type='bodySmall' style={{ color: themeColors.subText, flex: 1 }}>
                                        {order}
                                    </ThemedText>
                                    <Icon
                                        name={selectedSort.type === type && selectedSort.order === order ? 'radio-button-on' : 'radio-button-off'}
                                        size={moderateScale(18)}
                                        color={themeColors.subText}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.buttonContainer}>
                <TextButton
                    text='Apply'
                    textType='bodyMedium'
                    style={[styles.applyButton, { backgroundColor: themeColors.buttonPrimary }]}
                    onPress={handleApply}
                />
            </View>
        </BottomDrawer>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingBottom: spacing.lg,
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        right: spacing.lg,
        top: spacing.xs,
    },
    optionContainer: {
        paddingBottom: spacing.md,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        marginBottom: spacing.sm,
        fontWeight: 'bold',
        fontSize: moderateScale(14),
        paddingHorizontal: spacing.xl,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        paddingLeft: spacing.xl,
        paddingRight: spacing.lg,
        borderRadius: spacing.xs,
        marginVertical: spacing.xs,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    applyButton: {
        paddingVertical: spacing.md,
        width: '90%',
    },
});
