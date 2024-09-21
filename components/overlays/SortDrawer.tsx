// components/overlays/SortDrawer.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { ThemedText } from '@/components/base/ThemedText';
import { TextButton } from '@/components/buttons/TextButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/base/Icon';
import { scale, moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';

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
        <BottomSheet visible={visible} onClose={onClose} style={{ paddingHorizontal: 0 }}>
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
                <TextButton text='Apply' style={[styles.applyButton]} onPress={handleApply} size={'LG'} />
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spaces.LG,
        paddingBottom: Spaces.LG,
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        right: Spaces.LG,
        top: Spaces.XS,
    },
    optionContainer: {
        paddingBottom: Spaces.MD,
    },
    section: {
        marginBottom: Spaces.LG,
    },
    sectionTitle: {
        marginBottom: Spaces.SM,
        fontWeight: 'bold',
        fontSize: moderateScale(14),
        paddingHorizontal: Spaces.XL,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        paddingLeft: Spaces.XL,
        paddingRight: Spaces.LG,
        borderRadius: Spaces.XS,
        marginVertical: Spaces.XS,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spaces.XL,
        paddingHorizontal: '10%',
    },
    applyButton: {
        width: '80%',
    },
});
