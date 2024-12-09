// app/(app)/settings/index.tsx

import React from 'react';
import { StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
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
import { TextButton } from '@/components/buttons/TextButton';
import { PostHogProvider, usePostHog } from 'posthog-react-native';

const SettingsIndex = () => {
    const dispatch = useDispatch();
    const BYPASS_AUTH = false; // toggle this to false to enable real authentication handling

    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const posthog = usePostHog();

    const handleSignOut = async () => {
        if (BYPASS_AUTH) {
            router.replace('/');
        } else {
            try {
                posthog.capture('sign_out_clicked');
                posthog.reset();
                await authService.clearAuthData();
                await signOut();
                await dispatch(resetStore());
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

export default SettingsIndex;
