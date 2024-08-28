// components/workouts/WorkoutsFilterDrawer.tsx

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BottomDrawer } from '@/components/layout/BottomDrawer';
import { FilterChip } from '@/components/base/FilterChip';
import { ThemedText } from '@/components/base/ThemedText';

const filterAttributes = {
    level: ['Beginner', 'Intermediate', 'Advanced'],
    equipment: ['No Equipment', 'Dumbbells', 'Kettlebells'],
    focus: ['Strength', 'Endurance', 'Mobility'],
};

interface WorkoutsFilterDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
}

export const WorkoutsFilterDrawer: React.FC<WorkoutsFilterDrawerProps> = ({ visible, onClose, onApply }) => {
    const [selectedFilters, setSelectedFilters] = useState<any>({});

    const toggleFilter = (category: string, value: string) => {
        setSelectedFilters((prev: any) => {
            const newFilters = { ...prev };
            if (!newFilters[category]) {
                newFilters[category] = [];
            }
            if (newFilters[category].includes(value)) {
                newFilters[category] = newFilters[category].filter((item: string) => item !== value);
            } else {
                newFilters[category].push(value);
            }
            return newFilters;
        });
    };

    const handleApply = () => {
        onApply(selectedFilters);
        onClose();
    };

    return (
        <BottomDrawer visible={visible} onClose={onClose}>
            <ScrollView>
                {Object.keys(filterAttributes).map((category) => (
                    <View key={category} style={styles.categoryContainer}>
                        <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
                        <View style={styles.chipContainer}>
                            {filterAttributes[category].map((value) => (
                                <FilterChip
                                    key={value}
                                    label={value}
                                    selected={selectedFilters[category]?.includes(value)}
                                    onToggle={() => toggleFilter(category, value)}
                                />
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                <ThemedText style={styles.applyButtonText}>Apply</ThemedText>
            </TouchableOpacity>
        </BottomDrawer>
    );
};

const styles = StyleSheet.create({
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
    applyButton: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
