// app/settings/settings.tsx

import React, { useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/base/ThemedView';
import { signOut } from 'aws-amplify/auth';
import { authService } from '@/utils/auth';
import { resetStore } from '@/store/actions';
import { useDispatch } from 'react-redux';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { useSharedValue } from 'react-native-reanimated';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sizes } from '@/constants/Sizes';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { TextButton } from '@/components/buttons/TextButton';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const BYPASS_AUTH = false; // toggle this to false to enable real authentication handling

    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    useEffect(() => {
        const setNavOptions = () => {
            navigation.setOptions({
                headerShown: false,
            });
        };

        // Run immediately and after a small delay
        setNavOptions();
        const timer = setTimeout(setNavOptions, 0);

        return () => {
            clearTimeout(timer);
            // Optional: restore default settings on unmount
            navigation.setOptions({
                headerShown: true,
            });
        };
    }, [navigation]);

    const handleSignOut = async () => {
        if (BYPASS_AUTH) {
            // Handle sign out when bypassing Amplify
            navigation.reset({
                index: 0,
                routes: [{ name: 'index' }],
            });
        } else {
            try {
                // Clear stored auth data
                await authService.clearAuthData();

                // Sign out from Amplify
                await signOut();

                // Reset the entire Redux store to initial state
                dispatch(resetStore());

                // Navigate to login
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'index' }],
                });
            } catch (error) {
                console.error('Error signing out:', error);
                Alert.alert('Sign out Error', error.message);
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
});

export default SettingsScreen;
