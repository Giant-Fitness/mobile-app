// app/programs/exercise-details.tsx

import React, { useState } from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useNavigation } from '@react-navigation/native';

const ExerciseDetailsScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigation = useNavigation();

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    return <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}></ThemedView>;
};

export default ExerciseDetailsScreen;
