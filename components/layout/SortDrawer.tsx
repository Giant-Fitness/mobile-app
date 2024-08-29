import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomDrawer } from '@/components/layout/BottomDrawer';
import { ThemedText } from '@/components/base/ThemedText';
import { TextButton } from '@/components/base/TextButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon';

interface SortOption {
    type: string;
    orders: string[];
}

interface SortDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (sortOption: { type: string; order: string }) => void;
    initialSort?: { type: string; order: string };
    sortOptions: SortOption[]; // Array of sort options
    title: string; // Title of the drawer
}

export const SortDrawer: React.FC<SortDrawerProps> = ({ visible, onClose, onApply, initialSort = { type: '', order: '' }, sortOptions, title }) => {
    const [selectedSort, setSelectedSort] = useState<{ type: string; order: string }>(initialSort);
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const handleApply = () => {
        onApply(selectedSort);
        onClose();
    };

    const handleOptionSelect = (type: string, order: string) => {
        setSelectedSort({ type, order });
    };

    // Reset selected sort when the drawer is closed without applying
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
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                    <Icon name='close' size={21} color={themeColors.subText} />
                </TouchableOpacity>
            </View>

            <View style={styles.optionContainer}>
                {sortOptions.map(({ type, orders }) => (
                    <View key={type} style={styles.section}>
                        <ThemedText type='bodyMedium' style={styles.sectionTitle}>
                            {type}
                        </ThemedText>
                        <View style={[styles.options, { backgroundColor: themeColors.container }]}>
                            {orders.map((order) => (
                                <TouchableOpacity key={order} style={styles.optionButton} onPress={() => handleOptionSelect(type, order)} activeOpacity={1}>
                                    <ThemedText type='bodySmall' style={{ color: themeColors.subText, flex: 1 }}>
                                        {order}
                                    </ThemedText>
                                    <Icon
                                        name={selectedSort.type === type && selectedSort.order === order ? 'radio-button-on' : 'radio-button-off'}
                                        size={18}
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
        marginTop: 24,
        paddingHorizontal: 64,
        paddingBottom: 24,
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        right: 24,
        top: 4,
    },
    optionContainer: {
        paddingVertical: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        marginBottom: 8,
        fontWeight: 'bold',
        fontSize: 14,
        paddingHorizontal: 24,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingLeft: 36,
        paddingRight: 26,
        borderRadius: 4,
        marginVertical: 4,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    applyButton: {
        paddingVertical: 16,
        width: '90%',
    },
});
