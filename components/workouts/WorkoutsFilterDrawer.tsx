// components/workouts/WorkoutsFilterDrawer.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { FiltersDrawer } from '@/components/layout/FiltersDrawer';

const workoutFilterAttributes = {
    level: ['Beginner', 'Intermediate', 'Advanced'],
    equipment: ['None', 'Dumbbells', 'Kettlebells'],
    focus: ['Strength', 'Endurance', 'Mobility'],
};

interface WorkoutsFilterDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    workouts: Array<any>;
    initialFilters?: Record<string, string[]>; // Accept initial filters as an optional prop
}

export const WorkoutsFilterDrawer: React.FC<WorkoutsFilterDrawerProps> = ({ visible, onClose, onApply, workouts, initialFilters = {} }) => {
    const [appliedFilters, setAppliedFilters] = useState<any>({});

    // Sync with initial filters if they change
    useEffect(() => {
        setAppliedFilters(initialFilters);
    }, [initialFilters]);

    const handleApply = (filters: any) => {
        setAppliedFilters(filters);
        onApply(filters);
    };

    // Filtering function specific to workouts
    const calculateFilteredCount = (filters: Record<string, string[]>) => {
        if (Object.keys(filters).length === 0) {
            return workouts.length;
        }

        return workouts.filter((workout) => {
            const { level, equipment, focus } = filters;

            const matchesLevel = !level || level.includes(workout.level);
            const matchesEquipment = !equipment || equipment.includes(workout.equipment);
            const matchesFocus = !focus || focus.includes(workout.focus);

            return matchesLevel && matchesEquipment && matchesFocus;
        }).length;
    };

    return (
        <FiltersDrawer
            visible={visible}
            onClose={onClose}
            onApply={handleApply}
            filterAttributes={workoutFilterAttributes}
            initialFilters={appliedFilters}
            calculateFilteredCount={calculateFilteredCount} // Pass the filtering function
            itemLabel='workout'
        />
    );
};
