// app/login.tsx

import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Authenticator } from '@aws-amplify/ui-react-native';
import { ThemeProvider } from '@aws-amplify/ui-react-native';
import { Hub } from 'aws-amplify/utils';
import { authService } from '@/utils/auth';
import { useAuthTheme } from '@/components/auth/AuthTheme';
import { CustomSignIn } from '@/components/auth/AuthComponents';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');
const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: outputs.auth.Cognito.userPoolId,
            userPoolClientId: outputs.auth.Cognito.userPoolClientId,
            identityPoolId: outputs.auth.Cognito.identityPoolId,
        },
    },
});

const LoginPage = () => {
    const authTheme = useAuthTheme();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    useEffect(() => {
        // Listen for auth events to store or clear data
        const listener = Hub.listen('auth', async ({ payload }) => {
            switch (payload.event) {
                case 'signedIn':
                    try {
                        await authService.storeAuthData();
                    } catch (error) {
                        console.error('Error storing auth data:', error);
                    }
                    break;
                case 'signedOut':
                    try {
                        await authService.clearAuthData();
                    } catch (error) {
                        console.error('Error clearing auth data:', error);
                    }
                    break;
                default:
                    break;
            }
        });

        return () => listener();
    }, []);

    return (
        <View style={[styles.fullScreen, { backgroundColor: themeColors.background }]}>
            <ThemeProvider theme={authTheme}>
                <Authenticator.Provider>
                    <Authenticator
                        Container={(props) => (
                            // reuse default `Container` and apply custom background
                            <Authenticator.Container {...props} style={{ backgroundColor: themeColors.background }} />
                        )}
                        components={{
                            SignIn: CustomSignIn,
                            SignUp: ({ fields, ...props }) => (
                                <Authenticator.SignUp {...props} fields={fields.map((field) => ({ ...field, labelHidden: true }))} />
                            ),
                            ForgotPassword: ({ fields, ...props }) => (
                                <Authenticator.ForgotPassword {...props} fields={fields.map((field) => ({ ...field, labelHidden: true }))} />
                            ),
                            ConfirmResetPassword: ({ fields, ...props }) => (
                                <Authenticator.ConfirmResetPassword {...props} fields={fields.map((field) => ({ ...field, labelHidden: true }))} />
                            ),
                        }}
                        loginMechanisms={['email']}
                        signUpAttributes={['email']}
                    ></Authenticator>
                </Authenticator.Provider>
            </ThemeProvider>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
});

export default LoginPage;
