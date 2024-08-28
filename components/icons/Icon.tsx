// components/icons/Icon.tsx

import React from 'react';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, Entypo, SimpleLineIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { StyleProp, TextStyle } from 'react-native';

type IconProps = {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>; // Optional style prop
};

export const Icon: React.FC<IconProps> = ({ name, size = 18, color, style }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const iconColor = color || themeColors.subText; // Use provided color or default to theme color

    const commonProps = {
        size,
        color: iconColor,
        style, // Apply the optional style prop
    };

    switch (name) {
        case 'stopwatch':
            return <Ionicons name='stopwatch-outline' {...commonProps} />;
        case 'dumbbell':
            return <MaterialCommunityIcons name='dumbbell' {...commonProps} />;
        case 'yoga':
            return <MaterialCommunityIcons name='yoga' {...commonProps} />;
        case 'level-beginner':
            return <MaterialCommunityIcons name='chevron-up' {...commonProps} />;
        case 'level-intermediate':
            return <MaterialCommunityIcons name='chevron-double-up' {...commonProps} />;
        case 'level-advanced':
            return <MaterialCommunityIcons name='chevron-triple-up' {...commonProps} />;
        case 'chevron-forward':
            return <Ionicons name='chevron-forward-outline' {...commonProps} />;
        case 'chevron-back':
            return <Ionicons name='chevron-back' {...commonProps} />;
        case 'person':
            return <Ionicons name='person-circle' {...commonProps} />;
        case 'home':
            return <MaterialIcons name='home' {...commonProps} />;
        case 'nutrition':
            return <Entypo name='leaf' {...commonProps} />;
        case 'progress':
            return <Ionicons name='stats-chart' {...commonProps} />;
        case 'exercise':
            return <MaterialIcons name='sports-martial-arts' {...commonProps} />;
        case 'filter':
            return <Ionicons name='options' {...commonProps} />;
        case 'sort':
            return <Ionicons name='swap-vertical' {...commonProps} />;
        case 'notebook':
            return <MaterialCommunityIcons name='notebook' {...commonProps} />;
        default:
            return <Ionicons name='alert-circle-outline' s {...commonProps} />;
    }
};
