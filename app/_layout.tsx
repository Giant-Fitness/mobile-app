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
import { store } from '@/store/store';

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
        <Provider store={store}>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen
                        name='index'
                        options={{
                            // Hide the header for this route
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name='login'
                        options={{
                            // Hide the header for this route
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen name='(tabs)' options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen
                        name='initialization'
                        options={{
                            // Hide the header for this route
                            headerShown: false,
                        }}
                    />
                </Stack>
            </ThemeProvider>
        </Provider>
    );
}
