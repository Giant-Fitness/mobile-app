// app/(app)/onboarding/_layout.tsx

import React from 'react';

import { Stack } from 'expo-router';

import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export default function OnboardingLayout() {
    // Define screen options at the Stack level
    const screenOptions: NativeStackNavigationOptions = {
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
    };

    return <Stack screenOptions={screenOptions} />;
}
