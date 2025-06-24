// app/(app)/settings/_layout.tsx

import React from 'react';

import { Stack } from 'expo-router';

export default function SettingsLayout() {
    // Define screen options at the Stack level
    const screenOptions = {
        headerShown: false,
    };

    return <Stack screenOptions={screenOptions} />;
}
