// components/nutrition/SwipeableFoodLogContent.tsx

import { FoodLogContent } from '@/components/nutrition/FoodLogContent';
import React from 'react';
import { StyleSheet } from 'react-native';

interface SwipeableFoodLogContentProps {
    selectedDate: Date;
    style?: any;
}

export const SwipeableFoodLogContent: React.FC<SwipeableFoodLogContentProps> = ({ selectedDate, style }) => {
    return <FoodLogContent selectedDate={selectedDate} style={[styles.container, style]} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
