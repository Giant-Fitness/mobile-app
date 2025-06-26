// app/_layout.tsx

import { useEffect, useRef } from 'react';

import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import 'react-native-reanimated';

import { POSTHOG_CONFIG } from '@/config/posthog';
import { useColorScheme } from '@/hooks/useColorScheme';
import { resetStore } from '@/store/actions';
import { store } from '@/store/store';
import React from 'react';
import { AppState, StatusBar } from 'react-native';

import { useGlobalSearchParams, useLocalSearchParams, usePathname } from 'expo-router';

import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { Provider, useDispatch } from 'react-redux';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set splash animation options - much shorter now
SplashScreen.setOptions({
    duration: 200, // Reduced from 400ms
    fade: true,
});

// Define allowed route parameters for tracking
const ALLOWED_ROUTE_PARAMS: { [key: string]: string[] } = {
    '/workouts/workout-details': ['workoutId', 'source'],
    '/workouts/all-workouts': ['source'],
    '/programs/program-day': ['programId', 'dayId', 'source'],
    '/programs/program-overview': ['programId', 'source'],
    '/programs/exercise-details': ['exerciseId'],
};

function AppStateHandler() {
    const dispatch = useDispatch();
    const appStateRef = useRef(AppState.currentState);
    const lastActiveTimestamp = useRef(Date.now());

    useEffect(() => {
        const INACTIVITY_TIMEOUT = 45 * 60 * 1000; // 45 minutes

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                const timeAway = Date.now() - lastActiveTimestamp.current;

                if (timeAway > INACTIVITY_TIMEOUT) {
                    dispatch(resetStore());
                    router.replace('/');
                }
            }

            if (nextAppState.match(/inactive|background/)) {
                lastActiveTimestamp.current = Date.now();
            }

            appStateRef.current = nextAppState;
        });

        return () => subscription.remove();
    }, [dispatch]);

    return null;
}

// Simple screen tracker for Expo Router
function ScreenTracker() {
    const pathname = usePathname();
    const localParams = useLocalSearchParams();
    const globalParams = useGlobalSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
        if (posthog && pathname) {
            // Combine both local and global params
            const params = {
                ...globalParams,
                ...localParams,
            };

            const allowedParams = ALLOWED_ROUTE_PARAMS[pathname] || [];

            const trackedParams = allowedParams.reduce(
                (acc, paramName) => {
                    const value = params[paramName];
                    if (typeof value === 'string' && value !== '') {
                        acc[paramName] = value;
                    }
                    return acc;
                },
                {} as Record<string, string>,
            );

            posthog.capture('$screen', {
                $screen_name: pathname,
                ...(Object.keys(trackedParams).length > 0 && { route_params: trackedParams }),
            });
        }
    }, [pathname, localParams, globalParams, posthog]);

    return null;
}

export default function RootLayout() {
    const colorScheme = useColorScheme();

    const [loaded] = useFonts({
        InterBold: require('../assets/fonts/Inter/Inter_18pt-Bold.ttf'),
        InterSemiBold: require('../assets/fonts/Inter/Inter_18pt-SemiBold.ttf'),
        InterItalic: require('../assets/fonts/Inter/Inter_18pt-Italic.ttf'),
        InterMedium: require('../assets/fonts/Inter/Inter_18pt-Medium.ttf'),
        InterRegular: require('../assets/fonts/Inter/Inter_18pt-Regular.ttf'),

        ComfortaaBold: require('@/assets/fonts/Comfortaa/Comfortaa-Bold.ttf'),

        MontserratAlternatesBold: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Bold.ttf'),

        NunitoBold: require('@/assets/fonts/Nunito/Nunito-Bold.ttf'),
        NunitoMedium: require('@/assets/fonts/Nunito/Nunito-Medium.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            // Hide splash quickly to transition to custom loading
            SplashScreen.hide();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor='transparent' translucent={true} />

            <Provider store={store}>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <AppStateHandler />
                    <PostHogProvider
                        apiKey={POSTHOG_CONFIG.apiKey}
                        autocapture={{
                            captureTouches: false,
                            captureScreens: false,
                            ignoreLabels: [],
                        }}
                        options={{
                            host: POSTHOG_CONFIG.host,
                            enableSessionReplay: true,
                            sessionReplayConfig: {
                                maskAllTextInputs: false,
                                maskAllImages: false,
                                captureLog: true,
                                captureNetworkTelemetry: true,
                                androidDebouncerDelayMs: 500,
                                iOSdebouncerDelayMs: 1000,
                            },
                        }}
                    >
                        <ScreenTracker />
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                gestureEnabled: false,
                                navigationBarColor: '#fcfcfc',
                                animation: 'default',
                                presentation: 'card',
                            }}
                        >
                            <Stack.Screen name='(app)' options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
                            <Stack.Screen name='(auth)' options={{ headerShown: false, gestureEnabled: false }} />
                            <Stack.Screen
                                name='index'
                                options={{
                                    headerShown: false,
                                    animation: 'none',
                                    gestureEnabled: false,
                                }}
                            />
                        </Stack>
                    </PostHogProvider>
                </ThemeProvider>
            </Provider>
        </>
    );
}
