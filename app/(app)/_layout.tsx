// app/(app)/_layout.tsx

import { Stack } from 'expo-router';

import 'react-native-reanimated';

import React from 'react';

export default function AppLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'default',
                gestureEnabled: true,
            }}
        >
            <Stack.Screen
                name='(tabs)'
                options={{
                    headerShown: false,
                    animation: 'fade',
                    gestureEnabled: false,
                }}
            />
            <Stack.Screen
                name='onboarding'
                options={{
                    animation: 'default',
                }}
            />
            <Stack.Screen
                name='initialization'
                options={{
                    gestureEnabled: false,
                    animation: 'none',
                    presentation: 'transparentModal',
                }}
            />
            <Stack.Screen
                name='programs'
                options={{
                    gestureEnabled: true,
                    animation: 'default',
                }}
            />
        </Stack>
    );
}
