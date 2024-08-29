// components/layout/FiltersDrawer.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BottomDrawer } from '@/components/layout/BottomDrawer';
import { FilterChip } from '@/components/base/FilterChip';
import { ThemedText } from '@/components/base/ThemedText';
import { TextButton } from '@/components/base/TextButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon';

interface FiltersDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    filterAttributes: Record<string, string[]>; // Attributes for filters (e.g., level, equipment)
    initialFilters?: Record<string, string[]>; // Initial state for the filters
    title: string; // Title of the drawer
    calculateFilteredCount: (filters: Record<string, string[]>) => number; // Function to calculate the count of filtered items
    itemLabel?: string; // Optional label for items (e.g., 'workout' instead of 'item')
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
    visible,
    onClose,
    onApply,
    filterAttributes,
    initialFilters = {},
    title,
    calculateFilteredCount,
    itemLabel = 'item', // Default label is 'item'
}) => {
    const [temporaryFilters, setTemporaryFilters] = useState<any>(initialFilters);
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        if (visible) {
            setTemporaryFilters(initialFilters);
        }
    }, [visible, initialFilters]);

    const toggleFilter = (category: string, value: string) => {
        setTemporaryFilters((prev: any) => {
            const newFilters = { ...prev };
            if (!newFilters[category]) {
                newFilters[category] = [];
            }
            if (newFilters[category].includes(value)) {
                newFilters[category] = newFilters[category].filter((item: string) => item !== value);
            } else {
                newFilters[category].push(value);
            }

            if (newFilters[category].length === 0) {
                delete newFilters[category];
            }

            return newFilters;
        });
    };

    const handleApply = () => {
        onApply(temporaryFilters);
        onClose();
    };

    const handleReset = () => {
        setTemporaryFilters({});
    };

    const hasFilters = Object.keys(temporaryFilters).length > 0;

    const filteredCount = calculateFilteredCount(temporaryFilters); // Use the provided function to calculate filtered count

    const calculateChipWidth = (count: number) => {
        if (count === 2) return '49%';
        if (count === 3) return '32%';
        return '32%';
    };

    const splitIntoRows = (items: string[]) => {
        const rows = [];
        for (let i = 0; i < items.length; i += 3) {
            rows.push(items.slice(i, i + 3));
        }
        return rows;
    };

    return (
        <BottomDrawer visible={visible} onClose={onClose}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={handleReset}
                    style={styles.resetButton}
                    activeOpacity={hasFilters ? 0.5 : 1} // No opacity change when inactive
                    disabled={!hasFilters} // Disable the button when no filters are active
                    hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
                >
                    <ThemedText
                        type='overline'
                        style={{
                            color: hasFilters ? themeColors.subText : themeColors.systemBorderColor,
                            fontSize: 13,
                        }}
                    >
                        Reset
                    </ThemedText>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <ThemedText type='title'>{title}</ThemedText>
                    <ThemedText type='overline' style={{ color: themeColors.subText, fontSize: 12 }}>
                        {filteredCount} {filteredCount === 1 ? itemLabel : `${itemLabel}s`} found
                    </ThemedText>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                    <Icon name='close' size={22} color={themeColors.subText} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterScroll}>
                {Object.keys(filterAttributes).map((category) => {
                    const chips = filterAttributes[category];
                    const rows = splitIntoRows(chips);

                    return (
                        <View key={category} style={styles.categoryContainer}>
                            <ThemedText type='bodyMedium' style={styles.categoryTitle}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                            </ThemedText>
                            {rows.map((row, rowIndex) => (
                                <View
                                    key={rowIndex}
                                    style={[
                                        styles.chipContainer,
                                        {
                                            justifyContent: row.length === 3 || row.length === 2 ? 'space-between' : 'flex-start',
                                        },
                                    ]}
                                >
                                    {row.map((value) => (
                                        <FilterChip
                                            key={value}
                                            label={value}
                                            selected={temporaryFilters[category]?.includes(value)}
                                            onToggle={() => toggleFilter(category, value)}
                                            style={{
                                                ...styles.chip,
                                                flexBasis: calculateChipWidth(row.length),
                                                maxWidth: calculateChipWidth(row.length),
                                            }}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                    );
                })}
            </ScrollView>

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
        marginTop: 12,
        paddingHorizontal: 64,
        paddingBottom: 12,
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    filterScroll: {
        paddingVertical: 16,
    },
    resetButton: {
        position: 'absolute',
        left: 0,
        top: 12,
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: 12,
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        marginBottom: 10,
        fontWeight: 'bold',
        fontSize: 14,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
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
