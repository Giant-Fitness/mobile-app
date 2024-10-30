// app/index.tsx

import React from 'react';
import { StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react-native';
import { ThemeProvider } from '@aws-amplify/ui-react-native';
import { Link, Redirect } from 'expo-router';
import { Hub } from 'aws-amplify/utils';

import outputs from '../amplify_outputs.json';
import { useAuthTheme } from '@/components/auth/AuthTheme';
import { CustomHeader } from '@/components/auth/AuthComponents';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { authService } from '@/utils/auth';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: outputs.auth.Cognito.userPoolId,
            userPoolClientId: outputs.auth.Cognito.userPoolClientId,
            identityPoolId: outputs.auth.Cognito.identityPoolId,
        },
    },
});

const BYPASS_AUTH = false;

const LoginPage = () => {
    const authTheme = useAuthTheme();

    React.useEffect(() => {
        // Listen for auth events
        const listener = Hub.listen('auth', async ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    try {
                        await authService.storeAuthData();
                    } catch (error) {
                        console.error('Error storing auth data:', error);
                    }
                    break;

                // Handle sign out to clear data
                case 'signedOut':
                    try {
                        await authService.clearAuthData();
                    } catch (error) {
                        console.error('Error clearing auth data:', error);
                    }
                    break;
            }
        });

        return () => listener();
    }, []);

    // Add initial auth check
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                await authService.storeAuthData();
            } catch (error) {
                console.log('No initial auth data to store:', error);
            }
        };

        checkAuth();
    }, []);

    if (BYPASS_AUTH) {
        return (
            <SafeAreaView style={styles.container}>
                <Link href={'/initialization'} replace asChild>
                    <Pressable style={styles.button}>
                        <ThemedText type='button'>Login</ThemedText>
                    </Pressable>
                </Link>
            </SafeAreaView>
        );
    }

    return (
        <ThemeProvider theme={authTheme}>
            <Authenticator.Provider>
                <Authenticator Header={CustomHeader} loginMechanisms={['email']} signUpAttributes={['email']}>
                    <Redirect href='/initialization' />
                </Authenticator>
            </Authenticator.Provider>
        </ThemeProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spaces.MD,
    },
    button: {
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.LG,
        borderRadius: 5,
    },
});

export default LoginPage;
