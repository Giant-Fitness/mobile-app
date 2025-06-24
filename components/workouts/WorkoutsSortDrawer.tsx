// components/workouts/WorkoutsSortDrawer.tsx

import { SortDrawer } from '@/components/overlays/SortDrawer';
import React from 'react';

interface WorkoutsSortDrawerProps {
    visible: boolean;
    onClose: () => void;
    onApply: (sortOption: { type: string; order: string }) => void;
    initialSort?: { type: string; order: string };
}

const workoutSortOptions = [
    { type: 'Length', orders: ['Shortest', 'Longest'] },
    { type: 'Name', orders: ['A to Z', 'Z to A'] },
];

export const WorkoutsSortDrawer: React.FC<WorkoutsSortDrawerProps> = ({ visible, onClose, onApply, initialSort }) => {
    return <SortDrawer visible={visible} onClose={onClose} onApply={onApply} initialSort={initialSort} sortOptions={workoutSortOptions} title='Sort' />;
};
