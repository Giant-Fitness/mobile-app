// app/oauthredirect.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { Hub } from 'aws-amplify/utils';

export default function OAuthRedirect() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    useEffect(() => {
        // Set up a Hub listener to be notified of authentication events
        const listener = Hub.listen('auth', ({ payload }) => {
            if (payload.event === 'signedIn') {
                // User is signed in, navigate to the main app
                router.replace('/');
            } else if (payload.event === 'signInWithRedirect_failure') {
                console.error('Sign in failure:', payload.data);
                router.replace('/(auth)/login');
            }
        });

        // In React Native, we don't need to handle URL parameters manually
        // The Amplify library takes care of this automatically
        console.log('OAuth redirect screen loaded - Amplify will handle auth flow');

        return () => listener();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ActivityIndicator size='large' color={themeColors.accent} />
            {/* <ThemedText style={styles.text}>Completing sign-in...</ThemedText> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 20,
        fontSize: 16,
    },
});
