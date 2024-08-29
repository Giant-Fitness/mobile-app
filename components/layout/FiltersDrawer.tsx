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
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';

interface FiltersDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    filterAttributes: Record<string, string[]>;
    initialFilters?: Record<string, string[]>;
    calculateFilteredCount: (filters: Record<string, string[]>) => number;
    itemLabel?: string;
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
    visible,
    onClose,
    onApply,
    filterAttributes,
    initialFilters = {},
    calculateFilteredCount,
    itemLabel = 'item',
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
    const filteredCount = calculateFilteredCount(temporaryFilters);

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
                    activeOpacity={hasFilters ? 0.5 : 1}
                    disabled={!hasFilters}
                    hitSlop={{ top: scale(30), bottom: scale(30), left: scale(30), right: scale(30) }}
                >
                    <ThemedText
                        type='overline'
                        style={{
                            color: hasFilters ? themeColors.subText : themeColors.systemBorderColor,
                            fontSize: moderateScale(13),
                        }}
                    >
                        Reset
                    </ThemedText>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <ThemedText type='title'>Filters</ThemedText>
                    <ThemedText type='overline' style={{ color: themeColors.subText, fontSize: moderateScale(12) }}>
                        {filteredCount} {filteredCount === 1 ? itemLabel : `${itemLabel}s`} found
                    </ThemedText>
                </View>
                <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                    activeOpacity={0.8}
                    hitSlop={{ top: scale(20), bottom: scale(20), left: scale(20), right: scale(20) }}
                >
                    <Icon name='close' size={moderateScale(22)} color={themeColors.subText} />
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
        marginTop: spacing.md,
        paddingHorizontal: spacing.xxxl,
        paddingBottom: spacing.sm,
    },
    titleContainer: {
        alignItems: 'center',
        flex: 1,
    },
    filterScroll: {
        paddingVertical: spacing.md,
    },
    resetButton: {
        position: 'absolute',
        left: 0,
        top: verticalScale(12),
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        top: verticalScale(12),
    },
    categoryContainer: {
        marginBottom: spacing.lg,
    },
    categoryTitle: {
        marginBottom: spacing.sm,
        fontWeight: 'bold',
        fontSize: moderateScale(14),
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        marginVertical: spacing.xs,
    },
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    applyButton: {
        paddingVertical: spacing.md,
        width: '90%',
    },
});
