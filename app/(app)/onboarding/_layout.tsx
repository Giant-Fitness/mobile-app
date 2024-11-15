// app/(app)/onboarding/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

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
