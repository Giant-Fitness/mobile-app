// components/base/BasicSplash.tsx

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';

interface SplashScreenProps {
    onLoadingComplete: () => void;
}

export const BasicSplash: React.FC = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ActivityIndicator size='large' color={themeColors.text} />
            <ThemedText style={styles.text}>Loading...</ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: Spaces.MD,
    },
});
