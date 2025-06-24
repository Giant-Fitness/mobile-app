// app/_layout.tsx

import { useEffect, useRef } from 'react';

import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';

import 'react-native-reanimated';

import { POSTHOG_CONFIG } from '@/config/posthog';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useScreenTracking } from '@/hooks/useScreenTracking';
import { resetStore } from '@/store/actions';
import { store } from '@/store/store';
import React from 'react';
import { AppState, StatusBar } from 'react-native';

import { PostHogProvider } from 'posthog-react-native';
import { Provider, useDispatch } from 'react-redux';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Set splash animation options - much shorter now
SplashScreen.setOptions({
    duration: 200, // Reduced from 400ms
    fade: true,
});

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

export default function RootLayout() {
    const colorScheme = useColorScheme();

    function ScreenTrackingWrapper({ children }: { children: React.ReactNode }) {
        useScreenTracking();
        return <>{children}</>;
    }

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
            <PostHogProvider
                apiKey={POSTHOG_CONFIG.apiKey}
                autocapture={{
                    captureLifecycleEvents: true,
                    captureScreens: true,
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
                <Provider store={store}>
                    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                        <AppStateHandler />
                        {/* <ScreenTrackingWrapper> */}
                        <Stack
                            screenOptions={{
                                headerShown: false,
                                gestureEnabled: false,
                                navigationBarHidden: true,
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
                        {/* </ScreenTrackingWrapper> */}
                    </ThemeProvider>
                </Provider>
            </PostHogProvider>
        </>
    );
}
