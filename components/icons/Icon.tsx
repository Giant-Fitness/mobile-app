// components/icons/Icon.tsx

import React from 'react';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, Entypo, Feather } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { StyleProp, TextStyle } from 'react-native';
import { moderateScale } from '@/utils/scaling';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
const AnimatedMaterialCommunityIcons = Animated.createAnimatedComponent(MaterialCommunityIcons);
const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
const AnimatedEntypo = Animated.createAnimatedComponent(Entypo);
const AnimatedFeather = Animated.createAnimatedComponent(Feather);

type IconProps = {
    name: string;
    size?: number;
    color?: string | Animated.SharedValue<string>; // Accept a normal string or an animated color
    style?: StyleProp<TextStyle>;
};

export const Icon = React.forwardRef<any, IconProps>(({ name, size = 18, color, style }, ref) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors
    const defaultColor = themeColors.white;

    // Derived value for color if it's animated
    const derivedColor = useDerivedValue(() => {
        const finalColor = typeof color === 'string' ? color : (color?.value ?? defaultColor);
        return finalColor;
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            color: derivedColor.value,
        };
    });

    // Set common props for all icons
    const commonProps = {
        size: moderateScale(size),
        style: [animatedStyle, style],
        ref,
    };

    // Render the appropriate icon
    switch (name) {
        case 'stopwatch':
            return <AnimatedIonicons name='stopwatch-outline' {...commonProps} />;
        case 'dumbbell':
            return <AnimatedMaterialCommunityIcons name='dumbbell' {...commonProps} />;
        case 'yoga':
            return <AnimatedMaterialCommunityIcons name='yoga' {...commonProps} />;
        case 'level-beginner':
            return <AnimatedMaterialCommunityIcons name='chevron-up' {...commonProps} />;
        case 'level-intermediate':
            return <AnimatedMaterialCommunityIcons name='chevron-double-up' {...commonProps} />;
        case 'level-advanced':
            return <AnimatedMaterialCommunityIcons name='chevron-triple-up' {...commonProps} />;
        case 'chevron-forward':
            return <AnimatedIonicons name='chevron-forward-outline' {...commonProps} />;
        case 'chevron-back':
            return <AnimatedIonicons name='chevron-back' {...commonProps} />;
        case 'person':
            return <AnimatedIonicons name='person-circle' {...commonProps} />;
        case 'home':
            return <AnimatedMaterialIcons name='home' {...commonProps} />;
        case 'nutrition':
            return <AnimatedEntypo name='leaf' {...commonProps} />;
        case 'progress':
            return <AnimatedIonicons name='stats-chart' {...commonProps} />;
        case 'exercise':
            return <AnimatedMaterialIcons name='sports-martial-arts' {...commonProps} />;
        case 'filter':
            return <AnimatedIonicons name='options' {...commonProps} />;
        case 'sort':
            return <AnimatedIonicons name='swap-vertical' {...commonProps} />;
        case 'notebook':
            return <AnimatedMaterialCommunityIcons name='notebook' {...commonProps} />;
        case 'close':
            return <AnimatedIonicons name='close-circle-outline' {...commonProps} />;
        case 'radio-button-on':
            return <AnimatedIonicons name='radio-button-on' {...commonProps} />;
        case 'radio-button-off':
            return <AnimatedIonicons name='radio-button-off' {...commonProps} />;
        case 'plus':
            return <AnimatedFeather name='plus' {...commonProps} />;
        case 'bed':
            return <AnimatedMaterialCommunityIcons name='bed-outline' {...commonProps} />;
        case 'bulb':
            return <AnimatedMaterialIcons name='lightbulb-outline' {...commonProps} />;
        default:
            return <AnimatedIonicons name='alert-circle-outline' {...commonProps} />;
    }
});

Icon.displayName = 'Icon';
