// app/(auth)/_layout.tsx

import React from 'react';

import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'none', // or 'none' if you prefer no animation for auth screens
            }}
        >
            <Stack.Screen
                name='login'
                options={
                    {
                        // Specific options for login if needed
                    }
                }
            />
        </Stack>
    );
}
