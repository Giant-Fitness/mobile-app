// app/(app)/programs/_layout.tsx

import { Stack } from 'expo-router';
import React from 'react';

export default function ProgramsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen
                name='program-end-splash'
                options={{
                    gestureEnabled: false,
                    headerShown: false,
                    animation: 'none',
                    fullScreenGestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='program-start-splash'
                options={{
                    gestureEnabled: false,
                    headerShown: false,
                    animation: 'none',
                    fullScreenGestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='program-abandon-feedback'
                options={{
                    gestureEnabled: false,
                    headerShown: false,
                    animation: 'none',
                    fullScreenGestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='program-complete-feedback'
                options={{
                    gestureEnabled: false,
                    headerShown: false,
                    animation: 'none',
                    fullScreenGestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='program-complete'
                options={{
                    gestureEnabled: false,
                    headerShown: false,
                    animation: 'none',
                    fullScreenGestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='program-recommender-wizard'
                options={{
                    gestureEnabled: false,
                    headerShown: false,
                    animation: 'none',
                    fullScreenGestureEnabled: false,
                }}
            />
        </Stack>
    );
}
