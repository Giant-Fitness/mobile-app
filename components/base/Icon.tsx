// components/base/Icon.tsx

import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

import { AntDesign, Entypo, Feather, FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);
const AnimatedMaterialCommunityIcons = Animated.createAnimatedComponent(MaterialCommunityIcons);
const AnimatedMaterialIcons = Animated.createAnimatedComponent(MaterialIcons);
const AnimatedEntypo = Animated.createAnimatedComponent(Entypo);
const AnimatedFeather = Animated.createAnimatedComponent(Feather);
const AnimatedAnt = Animated.createAnimatedComponent(AntDesign);
// Note: FontAwesome6 doesn't work well with Animated.createAnimatedComponent
// We'll handle it separately

type IconProps = {
    name: string;
    size?: number;
    color?: string | SharedValue<string>; // Accept a normal string or an animated color
    style?: StyleProp<TextStyle>;
};

export const Icon = React.forwardRef<any, IconProps>(({ name, size = Sizes.iconSizeDefault, color, style }, ref) => {
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

    // For FontAwesome6, we need to handle color differently since it doesn't work well with animated components
    const finalColor = typeof color === 'string' ? color : (color?.value ?? defaultColor);

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
            return <FontAwesome6 name='plate-wheat' size={moderateScale(size)} color={finalColor} style={style} ref={ref} />;
        case 'nutrition-inactive':
            return <FontAwesome6 name='plate-wheat' size={moderateScale(size)} color={finalColor} style={style} ref={ref} />;
        case 'plan-active':
            return <AnimatedMaterialCommunityIcons name='clipboard-check' {...commonProps} />;
        case 'plan-inactive':
            return <AnimatedMaterialCommunityIcons name='clipboard-check' {...commonProps} />;
        case 'progress-active':
            return <AnimatedEntypo name='bar-graph' {...commonProps} />;
        case 'progress-inactive':
            return <AnimatedEntypo name='bar-graph' {...commonProps} />;
        case 'lightning-active':
            return <AnimatedMaterialCommunityIcons name='lightning-bolt' {...commonProps} />;
        case 'lightning-inactive':
            return <AnimatedMaterialCommunityIcons name='lightning-bolt' {...commonProps} />;
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
            return <AnimatedIonicons name='warning' {...commonProps} />;
        case 'radio-button-on':
            return <AnimatedIonicons name='radio-button-on' {...commonProps} />;
        case 'radio-button-off':
            return <AnimatedIonicons name='radio-button-off' {...commonProps} />;
        case 'plus':
            return <AnimatedFeather name='plus' {...commonProps} />;
        case 'add':
            return <AnimatedIonicons name='add-circle-outline' {...commonProps} />;
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
        case 'check-outline':
            return <AnimatedMaterialCommunityIcons name='check-circle-outline' {...commonProps} />;
        case 'check-square':
            return <AnimatedAnt name='check' {...commonProps} />;
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
        case 'auto-graph':
            return <AnimatedMaterialIcons name='auto-graph' {...commonProps} />;
        case 'power-sleep':
            return <AnimatedMaterialCommunityIcons name='power-sleep' {...commonProps} />;
        case 'library':
            return <AnimatedMaterialIcons name='local-library' {...commonProps} />;
        case 'more-horizontal':
            return <AnimatedFeather name='more-horizontal' {...commonProps} />;
        case 'preview':
            return <AnimatedMaterialCommunityIcons name='view-dashboard-outline' {...commonProps} />;
        case 'magic-wand':
            return <FontAwesome6 name='wand-magic-sparkles' size={moderateScale(size)} color={finalColor} style={style} ref={ref} />;
        case 'trash':
            return <AnimatedFeather name='trash-2' {...commonProps} />;
        case 'exit':
            return <AnimatedIonicons name='exit-outline' {...commonProps} />;
        case 'trending-up':
            return <FontAwesome6 name='arrow-trend-up' size={moderateScale(size)} color={finalColor} style={style} ref={ref} />;
        case 'campaign':
            return <AnimatedMaterialIcons name='campaign' {...commonProps} />;
        case 'email':
            return <AnimatedMaterialCommunityIcons name='email-outline' {...commonProps} />;
        case 'lock':
            return <AnimatedMaterialCommunityIcons name='lock-outline' {...commonProps} />;
        case 'eye':
            return <AnimatedIonicons name='eye-outline' {...commonProps} />;
        case 'eye-off':
            return <AnimatedIonicons name='eye-off-outline' {...commonProps} />;
        case 'checkmark-sharp':
            return <AnimatedIonicons name='checkmark-sharp' {...commonProps} />;
        case 'pencil-ruler':
            return <AnimatedMaterialCommunityIcons name='pencil-ruler' {...commonProps} />;
        case 'swap':
            return <AnimatedMaterialIcons name='swap-horizontal-circle' {...commonProps} />;
        case 'open-outline':
            return <AnimatedIonicons name='open-outline' {...commonProps} />;
        case 'logo-instagram':
            return <AnimatedIonicons name='logo-instagram' {...commonProps} />;
        case 'logo-whatsapp':
            return <AnimatedIonicons name='logo-whatsapp' {...commonProps} />;
        case 'shield-checkmark':
            return <AnimatedMaterialIcons name='privacy-tip' {...commonProps} />;
        case 'file-text':
            return <AnimatedIonicons name='document-text-outline' {...commonProps} />;
        default:
            return <AnimatedIonicons name='alert-circle-outline' {...commonProps} />;
    }
});

Icon.displayName = 'Icon';
