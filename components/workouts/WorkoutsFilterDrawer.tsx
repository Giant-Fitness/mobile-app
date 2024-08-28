// components/workouts/WorkoutsFilterDrawer.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BottomDrawer } from '@/components/layout/BottomDrawer';
import { FilterChip } from '@/components/base/FilterChip';
import { ThemedText } from '@/components/base/ThemedText';
import { TextButton } from '@/components/base/TextButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/icons/Icon';

const filterAttributes = {
    level: ['Beginner', 'Intermediate', 'Advanced'],
    equipment: ['None', 'Dumbbells', 'Kettlebells'],
    focus: ['Strength', 'Endurance', 'Mobility'],
};

interface WorkoutsFilterDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    workouts: Array<any>;
}

export const WorkoutsFilterDrawer: React.FC<WorkoutsFilterDrawerProps> = ({ visible, onClose, onApply, workouts }) => {
    const [appliedFilters, setAppliedFilters] = useState<any>({});
    const [temporaryFilters, setTemporaryFilters] = useState<any>({});
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    useEffect(() => {
        if (visible) {
            setTemporaryFilters(appliedFilters);
        }
    }, [visible, appliedFilters]);

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
        setAppliedFilters(temporaryFilters);
        onApply(temporaryFilters);
        onClose();
    };

    const handleClose = () => {
        setTemporaryFilters(appliedFilters);
        onClose();
    };

    const filteredWorkoutsCount = useMemo(() => {
        if (Object.keys(temporaryFilters).length === 0) {
            return workouts.length;
        }

        return workouts.filter((workout) => {
            const { level, equipment, focus } = temporaryFilters;

            const matchesLevel = !level || level.includes(workout.level);
            const matchesEquipment = !equipment || equipment.includes(workout.equipment);
            const matchesFocus = !focus || focus.includes(workout.focus);

            return matchesLevel && matchesEquipment && matchesFocus;
        }).length;
    }, [temporaryFilters, workouts]);

    // Helper function to calculate chip width based on count
    const calculateChipWidth = (count: number) => {
        if (count === 2) return '49%'; // Two items per row, nearly 50% each
        if (count === 3) return '32%'; // Three items per row, nearly 1/3 each
        return '32%'; // Default to 1/3 for uneven numbers
    };

    // Function to split the chips into rows of up to 3 chips each
    const splitIntoRows = (items: string[]) => {
        const rows = [];
        for (let i = 0; i < items.length; i += 3) {
            rows.push(items.slice(i, i + 3));
        }
        return rows;
    };

    return (
        <BottomDrawer visible={visible} onClose={handleClose}>
            <View style={styles.header}>
                <ThemedText type='titleXLarge'>Filters</ThemedText>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.8}>
                    <Icon name='close' size={26} color={themeColors.subText} />
                </TouchableOpacity>
            </View>

            <View style={styles.countContainer}>
                <ThemedText type='overline' style={{ color: themeColors.subText }}>
                    {filteredWorkoutsCount} {filteredWorkoutsCount === 1 ? 'workout' : 'workouts'} found
                </ThemedText>
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
        marginTop: 24,
    },
    countContainer: {
        marginBottom: 16,
    },
    filterScroll: {
        paddingVertical: 16,
    },
    closeButton: {
        padding: 8,
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        marginBottom: 10,
        fontWeight: 'bold',
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
