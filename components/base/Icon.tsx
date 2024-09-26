// components/base/Icon.tsx

import React from 'react';
import { Ionicons, MaterialCommunityIcons, MaterialIcons, Entypo, Feather, AntDesign, FontAwesome6 } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { StyleProp, TextStyle } from 'react-native';
import { moderateScale } from '@/utils/scaling';
import { Sizes } from '@/constants/Sizes';
import Animated, { useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
const AnimatedMaterialCommunityIcons = Animated.createAnimatedComponent(MaterialCommunityIcons);
const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
const AnimatedEntypo = Animated.createAnimatedComponent(Entypo);
const AnimatedFeather = Animated.createAnimatedComponent(Feather);
const AnimatedAnt = Animated.createAnimatedComponent(AntDesign);
const AnimatedFontAwesome = Animated.createAnimatedComponent(FontAwesome6);

type IconProps = {
    name: string;
    size?: number;
    color?: string | Animated.SharedValue<string>; // Accept a normal string or an animated color
    style?: StyleProp<TextStyle>;
};

export const Icon = React.forwardRef<any, IconProps>(({ name, size = Sizes.iconSizeDefault, color, style }, ref) => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors
    const defaultColor = themeColors.white;

    // Derived value for color if it's animated
    const derivedColor = useDerivedValue(() => {
        const finalColor = typeof color === 'string' ? color : color?.value ?? defaultColor;
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
            return <AnimatedIonicons name='stopwatch' {...commonProps} />;
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
        case 'chevron-up':
            return <AnimatedIonicons name='chevron-up' {...commonProps} />;
        case 'chevron-down':
            return <AnimatedIonicons name='chevron-down' {...commonProps} />;
        case 'person':
            return <AnimatedIonicons name='person-circle' {...commonProps} />;
        case 'home-active':
            return <AnimatedMaterialCommunityIcons name='home-variant' {...commonProps} />;
        case 'home-inactive':
            return <AnimatedMaterialCommunityIcons name='home-variant' {...commonProps} />;
        case 'nutrition-active':
            return <AnimatedFontAwesome name='plate-wheat' {...commonProps} />;
        case 'nutrition-inactive':
            return <AnimatedFontAwesome name='plate-wheat' {...commonProps} />;
        case 'progress-active':
            return <AnimatedIonicons name='stats-chart' {...commonProps} />;
        case 'progress-inactive':
            return <AnimatedIonicons name='stats-chart' {...commonProps} />;
        case 'exercise-active':
            return <AnimatedMaterialIcons name='sports-martial-arts' {...commonProps} />;
        case 'exercise-inactive':
            return <AnimatedMaterialIcons name='directions-run' {...commonProps} />;
        case 'filter':
            return <AnimatedIonicons name='options' {...commonProps} />;
        case 'sort':
            return <AnimatedIonicons name='swap-vertical' {...commonProps} />;
        case 'notebook':
            return <AnimatedMaterialCommunityIcons name='notebook' {...commonProps} />;
        case 'close':
            return <AnimatedIonicons name='close-circle-outline' {...commonProps} />;
        case 'info':
            return <AnimatedIonicons name='information-circle-outline' {...commonProps} />;
        case 'warning':
            return <AnimatedIonicons name='hand-left-outline' {...commonProps} />;
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
        case 'sleep':
            return <AnimatedMaterialCommunityIcons name='sleep' {...commonProps} />;
        case 'play':
            return <AnimatedAnt name='play' {...commonProps} />;
        case 'kettlebell':
            return <AnimatedMaterialCommunityIcons name='kettlebell' {...commonProps} />;
        case 'hourglass':
            return <AnimatedMaterialIcons name='hourglass-bottom' {...commonProps} />;
        case 'counter':
            return <AnimatedMaterialCommunityIcons name='counter' {...commonProps} />;
        case 'repeat':
            return <AnimatedMaterialCommunityIcons name='redo-variant' {...commonProps} />;
        case 'check':
            return <AnimatedMaterialCommunityIcons name='check-circle' {...commonProps} />;
        case 'list':
            return <AnimatedIonicons name='list-circle' {...commonProps} />;
        case 'star':
            return <AnimatedIonicons name='star' {...commonProps} />;
        case 'calculator':
            return <AnimatedAnt name='calculator' {...commonProps} />;
        case 'people':
            return <AnimatedMaterialIcons name='groups-3' {...commonProps} />;
        case 'target':
            return <AnimatedFeather name='target' {...commonProps} />;
        case 'calendar':
            return <AnimatedIonicons name='calendar' {...commonProps} />;
        default:
            return <AnimatedIonicons name='alert-circle-outline' {...commonProps} />;
    }
});

Icon.displayName = 'Icon';
