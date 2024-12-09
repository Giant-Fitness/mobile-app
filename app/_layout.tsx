// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider, useDispatch } from 'react-redux';
import { store } from '@/store/store';
import { AppState } from 'react-native';
import { resetStore } from '@/store/actions';
import { POSTHOG_CONFIG } from '@/config/posthog';
import { PostHogProvider } from 'posthog-react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppStateHandler() {
    const dispatch = useDispatch();
    const appStateRef = useRef(AppState.currentState);
    const lastActiveTimestamp = useRef(Date.now());

    useEffect(() => {
        const INACTIVITY_TIMEOUT = 45 * 60 * 1000; // 45 minutes

        // console.log('Setting up app state listener. Timeout:', INACTIVITY_TIMEOUT / 1000, 'seconds');

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            // console.log('App state changed:', {
            //     from: appStateRef.current,
            //     to: nextAppState,
            // });

            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                const timeAway = Date.now() - lastActiveTimestamp.current;
                // console.log('Time away:', Math.round(timeAway / 1000), 'seconds');

                if (timeAway > INACTIVITY_TIMEOUT) {
                    // console.log('Timeout exceeded, clearing store and refreshing app...');
                    dispatch(resetStore());
                    router.replace('/');
                } else {
                    // console.log('Within timeout, continuing normally');
                }
            }

            if (nextAppState.match(/inactive|background/)) {
                lastActiveTimestamp.current = Date.now();
                // console.log('App backgrounded at:', new Date().toLocaleTimeString());
            }

            appStateRef.current = nextAppState;
        });

        return () => subscription.remove();
    }, [dispatch]);

    return null;
}

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const [loaded] = useFonts({
        InterBlack: require('../assets/fonts/Inter_18pt-Black.ttf'),
        InterBlackItalic: require('../assets/fonts/Inter_18pt-BlackItalic.ttf'),
        InterBold: require('../assets/fonts/Inter_18pt-Bold.ttf'),
        InterBoldItalic: require('../assets/fonts/Inter_18pt-BoldItalic.ttf'),
        InterExtraBold: require('../assets/fonts/Inter_18pt-ExtraBold.ttf'),
        InterExtraBoldItalic: require('../assets/fonts/Inter_18pt-ExtraBoldItalic.ttf'),
        InterExtraLight: require('../assets/fonts/Inter_18pt-ExtraLight.ttf'),
        InterExtraLightItalic: require('../assets/fonts/Inter_18pt-ExtraLightItalic.ttf'),
        InterItalic: require('../assets/fonts/Inter_18pt-Italic.ttf'),
        InterLight: require('../assets/fonts/Inter_18pt-Light.ttf'),
        InterLightItalic: require('../assets/fonts/Inter_18pt-LightItalic.ttf'),
        InterMedium: require('../assets/fonts/Inter_18pt-Medium.ttf'),
        InterMediumItalic: require('../assets/fonts/Inter_18pt-MediumItalic.ttf'),
        InterRegular: require('../assets/fonts/Inter_18pt-Regular.ttf'),
        InterSemiBold: require('../assets/fonts/Inter_18pt-SemiBold.ttf'),
        InterSemiBoldItalic: require('../assets/fonts/Inter_18pt-SemiBoldItalic.ttf'),
        InterThin: require('../assets/fonts/Inter_18pt-Thin.ttf'),
        InterThinItalic: require('../assets/fonts/Inter_18pt-ThinItalic.ttf'),

        ComfortaaBold: require('@/assets/fonts/Comfortaa/Comfortaa-Bold.ttf'),
        ComfortaaLight: require('@/assets/fonts/Comfortaa/Comfortaa-Light.ttf'),
        ComfortaaMedium: require('@/assets/fonts/Comfortaa/Comfortaa-Medium.ttf'),
        ComfortaaRegular: require('@/assets/fonts/Comfortaa/Comfortaa-Regular.ttf'),
        ComfortaaSemiBold: require('@/assets/fonts/Comfortaa/Comfortaa-SemiBold.ttf'),

        MontserratBlack: require('@/assets/fonts/Montserrat/Montserrat-Black.ttf'),
        MontserratBlackItalic: require('@/assets/fonts/Montserrat/Montserrat-BlackItalic.ttf'),
        MontserratBold: require('@/assets/fonts/Montserrat/Montserrat-Bold.ttf'),
        MontserratBoldItalic: require('@/assets/fonts/Montserrat/Montserrat-BoldItalic.ttf'),
        MontserratExtraBold: require('@/assets/fonts/Montserrat/Montserrat-ExtraBold.ttf'),
        MontserratExtraBoldItalic: require('@/assets/fonts/Montserrat/Montserrat-ExtraBoldItalic.ttf'),
        MontserratExtraLight: require('@/assets/fonts/Montserrat/Montserrat-ExtraLight.ttf'),
        MontserratExtraLightItalic: require('@/assets/fonts/Montserrat/Montserrat-ExtraLightItalic.ttf'),
        MontserratItalic: require('@/assets/fonts/Montserrat/Montserrat-Italic.ttf'),
        MontserratLight: require('@/assets/fonts/Montserrat/Montserrat-Light.ttf'),
        MontserratLightItalic: require('@/assets/fonts/Montserrat/Montserrat-LightItalic.ttf'),
        MontserratMedium: require('@/assets/fonts/Montserrat/Montserrat-Medium.ttf'),
        MontserratMediumItalic: require('@/assets/fonts/Montserrat/Montserrat-MediumItalic.ttf'),
        MontserratRegular: require('@/assets/fonts/Montserrat/Montserrat-Regular.ttf'),
        MontserratSemiBold: require('@/assets/fonts/Montserrat/Montserrat-SemiBold.ttf'),
        MontserratSemiBoldItalic: require('@/assets/fonts/Montserrat/Montserrat-SemiBoldItalic.ttf'),
        MontserratThin: require('@/assets/fonts/Montserrat/Montserrat-Thin.ttf'),
        MontserratThinItalic: require('@/assets/fonts/Montserrat/Montserrat-ThinItalic.ttf'),

        MontserratAlternatesBlack: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Black.ttf'),
        MontserratAlternatesBlackItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-BlackItalic.ttf'),
        MontserratAlternatesBold: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Bold.ttf'),
        MontserratAlternatesBoldItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-BoldItalic.ttf'),
        MontserratAlternatesExtraBold: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-ExtraBold.ttf'),
        MontserratAlternatesExtraBoldItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-ExtraBoldItalic.ttf'),
        MontserratAlternatesExtraLight: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-ExtraLight.ttf'),
        MontserratAlternatesExtraLightItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-ExtraLightItalic.ttf'),
        MontserratAlternatesItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Italic.ttf'),
        MontserratAlternatesLight: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Light.ttf'),
        MontserratAlternatesLightItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-LightItalic.ttf'),
        MontserratAlternatesMedium: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Medium.ttf'),
        MontserratAlternatesMediumItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-MediumItalic.ttf'),
        MontserratAlternatesRegular: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Regular.ttf'),
        MontserratAlternatesSemiBold: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-SemiBold.ttf'),
        MontserratAlternatesSemiBoldItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-SemiBoldItalic.ttf'),
        MontserratAlternatesThin: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-Thin.ttf'),
        MontserratAlternatesThinItalic: require('@/assets/fonts/Montserrat_Alternates/MontserratAlternates-ThinItalic.ttf'),

        NunitoBlack: require('@/assets/fonts/Nunito/Nunito-Black.ttf'),
        NunitoBlackItalic: require('@/assets/fonts/Nunito/Nunito-BlackItalic.ttf'),
        NunitoBold: require('@/assets/fonts/Nunito/Nunito-Bold.ttf'),
        NunitoBoldItalic: require('@/assets/fonts/Nunito/Nunito-BoldItalic.ttf'),
        NunitoExtraBold: require('@/assets/fonts/Nunito/Nunito-ExtraBold.ttf'),
        NunitoExtraBoldItalic: require('@/assets/fonts/Nunito/Nunito-ExtraBoldItalic.ttf'),
        NunitoExtraLight: require('@/assets/fonts/Nunito/Nunito-ExtraLight.ttf'),
        NunitoExtraLightItalic: require('@/assets/fonts/Nunito/Nunito-ExtraLightItalic.ttf'),
        NunitoItalic: require('@/assets/fonts/Nunito/Nunito-Italic.ttf'),
        NunitoLight: require('@/assets/fonts/Nunito/Nunito-Light.ttf'),
        NunitoLightItalic: require('@/assets/fonts/Nunito/Nunito-LightItalic.ttf'),
        NunitoMedium: require('@/assets/fonts/Nunito/Nunito-Medium.ttf'),
        NunitoMediumItalic: require('@/assets/fonts/Nunito/Nunito-MediumItalic.ttf'),
        NunitoRegular: require('@/assets/fonts/Nunito/Nunito-Regular.ttf'),
        NunitoSemiBold: require('@/assets/fonts/Nunito/Nunito-SemiBold.ttf'),
        NunitoSemiBoldItalic: require('@/assets/fonts/Nunito/Nunito-SemiBoldItalic.ttf'),
    });

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return (
        <PostHogProvider
            apiKey={POSTHOG_CONFIG.apiKey}
            autocapture={{
                captureLifecycleEvents: true,
                captureScreens: true,
                ignoreLabels: [], // Any labels here will be ignored from the stack in touch events
                navigation: {
                    // By default, only the screen name is tracked but it is possible to track the
                    // params or modify the name by intercepting the autocapture like so
                    routeToName: (name, params) => {
                        if (params && params.id) return `${name}/${params.id}`;
                        return name;
                    },
                },
            }}
            options={{
                host: POSTHOG_CONFIG.host,
                enableSessionReplay: true,
                sessionReplayConfig: {
                    // Whether text inputs are masked. Default is true.
                    // Password inputs are always masked regardless
                    maskAllTextInputs: false,
                    // Whether images are masked. Default is true.
                    maskAllImages: false,
                    // Capture logs automatically. Default is true.
                    // Android only (Native Logcat only)
                    captureLog: true,
                    // Whether network requests are captured in recordings. Default is true
                    // Only metric-like data like speed, size, and response code are captured.
                    // No data is captured from the request or response body.
                    // iOS only
                    captureNetworkTelemetry: true,
                    // Deboucer delay used to reduce the number of snapshots captured and reduce performance impact. Default is 500ms
                    androidDebouncerDelayMs: 500,
                    // Deboucer delay used to reduce the number of snapshots captured and reduce performance impact. Default is 1000ms
                    iOSdebouncerDelayMs: 1000,
                },
            }}
        >
            <Provider store={store}>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <AppStateHandler />
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
                </ThemeProvider>
            </Provider>
        </PostHogProvider>
    );
}
