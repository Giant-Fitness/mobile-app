// app/(app)/settings/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
    // Define screen options at the Stack level
    const screenOptions = {
        headerShown: false,
    };

    return <Stack screenOptions={screenOptions} />;
}
