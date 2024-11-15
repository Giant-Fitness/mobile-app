// app/(app)/_layout.tsx

import { Stack } from 'expo-router';
import 'react-native-reanimated';
import React from 'react';

export default function AppLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen
                name='(tabs)'
                options={{
                    headerShown: false,
                    animation: 'none',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='onboarding'
                options={{
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='initialization'
                options={{
                    gestureEnabled: false,
                    animation: 'none',
                }}
            />
            <Stack.Screen
                name='programs'
                options={{
                    gestureEnabled: true,
                    animation: 'none',
                }}
            />
        </Stack>
    );
}
