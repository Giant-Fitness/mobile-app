// app/settings/settings.tsx

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform } from 'react-native';
import React from 'react';
import { Collapsible } from '@/components/layout/Collapsible';
import ParallaxScrollView from '@/components/layout/ParallaxScrollView';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CustomBackButton } from '@/components/base/CustomBackButton';

export default function ProgressScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    React.useEffect(() => {
        navigation.setOptions({
            title: 'Settings',
            headerBackTitleVisible: false, // Hide the back button label
            headerStyle: {
                backgroundColor: themeColors.background,
            },
            headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
            headerLeft: () => <CustomBackButton />,
        });
    }, [navigation]);

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={<Ionicons size={310} name='code-slash' style={styles.headerImage} />}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type='title'>Explore</ThemedText>
            </ThemedView>
            <ThemedText>This app includes example code to help you get started.</ThemedText>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
});
