// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import React from 'react';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider } from 'react-redux';
import { store } from '../store/rootReducer';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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
        <Provider store={store}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            // Hide the header for this route
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                </Stack>
            </ThemeProvider>
        </Provider>
    );
}
