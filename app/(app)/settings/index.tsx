// app/(app)/settings/index.tsx
///home/manavparmar/Desktop/intern_main/mobile-app/store

import React from 'react';
import { View,StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/base/ThemedView';
import { signOut } from 'aws-amplify/auth';
import { authService } from '@/utils/auth';
import { resetStore } from '@/store/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { useSharedValue } from 'react-native-reanimated';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sizes } from '@/constants/Sizes';
import { TextButton } from '@/components/buttons/TextButton';
import { setBodyWeightPreference, setLiftWeightPreference } from '@/store/settings/settingsSlice';
import { RootState } from '@/store';


const SettingsIndex = () => {
    const dispatch = useDispatch();
    const BYPASS_AUTH = false; // toggle this to false to enable real authentication handling

    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const toggleBodyWeightPreference = () => {
            const newPreference = bodyWeightPreference === 'kg' ? 'pounds' : 'kg';
            dispatch(setBodyWeightPreference(newPreference));
    };

    const toggleLiftWeightPreference = () => {
            const newPreference = liftWeightPreference === 'kg' ? 'pounds' : 'kg';
            dispatch(setLiftWeightPreference(newPreference));
    }
    const bodyWeightPreference = useSelector((state: RootState) => state.settings.bodyWeightPreference);
    const liftWeightPreference = useSelector((state: RootState) => state.settings.liftWeightPreference);



    const handleSignOut = async () => {
        if (BYPASS_AUTH) {
            router.replace('/');
        } else {
            try {
                await authService.clearAuthData();
                await signOut();
                dispatch(resetStore());
                router.replace('/');
            } catch (error: unknown) {
                console.error('Error signing out:', error);
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
                Alert.alert('Sign out Error', errorMessage);
            }
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} headerBackground={themeColors.background} title='Settings' />
            <ThemedView style={[styles.content]}>
                <TextButton
                    iconStyle={{ marginTop: Spaces.XXS }}
                    iconName='exit'
                    size='LG'
                    style={[styles.signOutButton]}
                    text='Sign Out'
                    onPress={handleSignOut}
                />
                <View style={[styles.divider, { backgroundColor: themeColors.divider }]} />

                {/* Weight Preference Toggle */}
                <TextButton
                    iconStyle={{ marginTop: Spaces.XXS }}
                    iconName='swap-horizontal'
                    size='LG'
                    style={[styles.toggleButton]}
                    text={`Switch Body Weight to ${bodyWeightPreference === 'kg' ? 'Pounds' : 'Kgs'}`}
                    onPress={toggleBodyWeightPreference}
                />
                <TextButton
                    iconStyle={{ marginTop: Spaces.XXS }}
                    iconName='swap-horizontal'
                    size='LG'
                    style={[styles.toggleButton]}
                    text={`Switch Lift Weight to ${liftWeightPreference === 'kg' ? 'Pounds' : 'Kgs'}`}
                    onPress={toggleLiftWeightPreference}
                />

            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight,
    },
    content: {
        marginTop: Spaces.XL,
    },
    signOutButton: {
        width: '80%',
        alignSelf: 'center',
        borderRadius: Spaces.SM,
    },
    divider: {
        height: 1,
        width: '90%',
        alignSelf: 'center',
        marginVertical: Spaces.LG,
    },
    toggleButton: {
        width: '80%',
        alignSelf: 'center',
        borderRadius: Spaces.SM,
    },
});

export default SettingsIndex;
