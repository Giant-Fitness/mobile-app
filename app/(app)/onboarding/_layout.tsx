// app/(app)/onboarding/_layout.tsx

import React from 'react';

import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                gestureEnabled: false,
                headerShown: false,
            }}
        />
    );
}
