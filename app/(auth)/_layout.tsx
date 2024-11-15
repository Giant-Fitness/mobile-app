// app/(auth)/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

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
