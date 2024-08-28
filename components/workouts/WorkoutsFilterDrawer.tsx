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

    const handleReset = () => {
        setTemporaryFilters({});
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
        <BottomDrawer visible={visible} onClose={handleClose}>
            {/* Header with centered title and count, reset button on the top left */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleReset} style={styles.resetButton} activeOpacity={0.1} hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}>
                    <ThemedText type='overline' style={{ color: themeColors.subText, fontSize: 12 }}>
                        Reset
                    </ThemedText>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <ThemedText type='title'>Filters</ThemedText>
                    <ThemedText type='overline' style={{ color: themeColors.subText, fontSize: 12 }}>
                        {filteredWorkoutsCount} {filteredWorkoutsCount === 1 ? 'workout' : 'workouts'} found
                    </ThemedText>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton} activeOpacity={0.8} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                    <Icon name='close' size={26} color={themeColors.subText} />
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
        flex: 1, // Center the title and count
    },
    countContainer: {
        marginBottom: 16,
    },
    filterScroll: {
        paddingVertical: 16,
    },
    resetButton: {
        position: 'absolute',
        left: 0,
        padding: 8, // Increase padding to extend touch area
    },
    closeButton: {
        position: 'absolute',
        right: 0,
        padding: 8, // Increase padding to extend touch area
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
