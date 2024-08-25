// components/icons/LevelIcon.tsx

import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

type LevelIconProps = {
    level: string;
    size?: number; // Optional prop to allow size customization
    color?: string; // Optional prop to allow color customization
};

export const LevelIcon: React.FC<LevelIconProps> = ({ level, size = 18, color }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const iconColor = color || themeColors.text; // Use provided color or default to theme color

    switch (level.toLowerCase()) {
        case 'beginner':
            return <MaterialCommunityIcons name='chevron-up' size={size} color={iconColor} />;
        case 'intermediate':
            return <MaterialCommunityIcons name='chevron-double-up' size={size} color={iconColor} />;
        case 'advanced':
            return <MaterialCommunityIcons name='chevron-triple-up' size={size} color={iconColor} />;
        default:
            return null; // No icon for undefined levels
    }
};
