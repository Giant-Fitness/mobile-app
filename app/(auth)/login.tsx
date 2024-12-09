// app/(auth)/login.tsx

import React, { useEffect } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Authenticator } from '@aws-amplify/ui-react-native';
import { ThemeProvider } from '@aws-amplify/ui-react-native';
import { Hub } from 'aws-amplify/utils';
import { authService } from '@/utils/auth';
import { useAuthTheme } from '@/components/auth/AuthTheme';
import { CustomHeader, CustomSignIn } from '@/components/auth/AuthComponents';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Spaces } from '@/constants/Spaces';
import { ThemedText } from '@/components/base/ThemedText';
import { router } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');
const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

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
                        router.replace('/');
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
                            SignUp: ({ fields, toSignIn, ...props }) => (
                                <View style={{ flex: 1, width: '100%' }}>
                                    <CustomHeader containerStyle={{ marginLeft: Spaces.MD, paddingBottom: Spaces.LG }} />
                                    <View>
                                        <Authenticator.SignUp
                                            {...props}
                                            fields={fields.map((field) => ({
                                                ...field,
                                                labelHidden: true,
                                                placeholder: field.name === 'confirm_password' ? 'Confirm password' : field.placeholder,
                                            }))}
                                            Header={() => null}
                                            toSignIn={toSignIn}
                                            hideSignIn={true}
                                            // Customize the footer to replace the default Sign Up button and add "Sign In" link
                                            Footer={() => (
                                                <View>
                                                    <View style={styles.signUpContainer}>
                                                        <ThemedText style={styles.signUpText}>Already have an account?</ThemedText>
                                                        <Pressable onPress={toSignIn}>
                                                            <ThemedText style={[styles.signUpLink, { color: themeColors.accent }]}>Sign In</ThemedText>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            )}
                                        />
                                    </View>
                                </View>
                            ),
                            ForgotPassword: ({ fields, ...props }) => (
                                <Authenticator.ForgotPassword {...props} fields={fields.map((field) => ({ ...field, labelHidden: true }))} />
                            ),
                            ConfirmResetPassword: ({ fields, ...props }) => (
                                <Authenticator.ConfirmResetPassword {...props} fields={fields.map((field) => ({ ...field, labelHidden: true }))} />
                            ),
                            ConfirmSignUp: ({ fields, ...props }) => (
                                <Authenticator.ConfirmSignUp {...props} fields={fields.map((field) => ({ ...field, labelHidden: true }))} />
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
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spaces.MD,
        gap: Spaces.XS,
    },
    signUpText: {
        // Customize as needed, such as color or font size
    },
    signUpLink: {
        fontWeight: '500',
    },
});

export default LoginPage;
