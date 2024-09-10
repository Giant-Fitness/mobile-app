// components/splashScreens/BasicSplash.tsx

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface SplashScreenProps {
    onLoadingComplete: () => void;
    delay?: number; // Optional delay prop in milliseconds (default to 2 seconds)
}

export const BasicSplash: React.FC<SplashScreenProps> = ({ onLoadingComplete, delay = 2000 }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const [isWaiting, setIsWaiting] = useState(true);

    useEffect(() => {
        // Set a timeout to add a delay before calling onLoadingComplete
        const timer = setTimeout(() => {
            setIsWaiting(false);
            onLoadingComplete(); // Call the completion handler
        }, delay);

        // Cleanup the timer when the component unmounts
        return () => clearTimeout(timer);
    }, [delay, onLoadingComplete]);

    // Show the splash screen while waiting
    if (isWaiting) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size='large' color={themeColors.text} />
                <ThemedText style={styles.text}>Loading...</ThemedText>
            </View>
        );
    }

    // Return null or an empty view when splash is no longer needed
    return null;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 20,
    },
});
