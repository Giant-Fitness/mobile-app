// app/(auth)/login.tsx

import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Authenticator } from '@aws-amplify/ui-react-native';
import { ThemeProvider } from '@aws-amplify/ui-react-native';
import { Hub } from 'aws-amplify/utils';
import { authService } from '@/utils/auth';
import { useAuthTheme } from '@/components/auth/AuthTheme';
import { CustomHeader } from '@/components/auth/AuthComponents';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Spaces } from '@/constants/Spaces';
import { ThemedText } from '@/components/base/ThemedText';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('screen');
const { height: SCREEN_HEIGHT } = Dimensions.get('screen');

const LoginPage = () => {
    const authTheme = useAuthTheme();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoadingState, setIsLoadingState] = useState(true);

    // Initialize the page state
    useEffect(() => {
        const initializeLoginPage = async () => {
            try {
                // Clear any hanging browser sessions (iOS only)
                if (Platform.OS === 'ios') {
                    WebBrowser.dismissAuthSession();
                }

                // Check if there's any existing auth session
                // and ensure we have a clean state when entering login page
                await authService.checkSession().then(async ({ isAuthenticated }) => {
                    if (isAuthenticated) {
                        // If somehow the user has an active session but is on the login page,
                        // we should clean up to prevent confusion
                        await authService.signOut();
                    }
                });
            } catch (error) {
                console.error('Error initializing login page:', error);
                // If error, still try to clear auth data to be safe
                await authService.clearAuthData();
            } finally {
                setIsInitialized(true);
                setIsLoadingState(false);
            }
        };

        initializeLoginPage();
    }, []);

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
                        setIsLoadingState(false);
                    }
                    break;
                case 'signedOut':
                    try {
                        await authService.clearAuthData();
                        setIsLoadingState(false);
                    } catch (error) {
                        console.error('Error clearing auth data:', error);
                        setIsLoadingState(false);
                    }
                    break;
                case 'signInWithRedirect_failure':
                    // Handle OAuth failures
                    console.error('OAuth sign-in/sign-out failure:', payload.data);
                    try {
                        // Clean up local state
                        await authService.clearAuthData();
                    } catch (e) {
                        console.error('Failed to clear auth data after OAuth failure', e);
                    } finally {
                        setIsLoadingState(false);
                    }
                    break;
                default:
                    setIsLoadingState(false);
                    break;
            }
        });

        return () => listener();
    }, []);

    // Show loading spinner while initializing
    if (isLoadingState || !isInitialized) {
        return (
            <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                <ActivityIndicator size='large' color={themeColors.accent} />
                {/* <ThemedText style={styles.loadingText}>Preparing login...</ThemedText> */}
            </View>
        );
    }

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
                            SignIn: ({ fields, toSignUp, socialProviders, ...props }) => (
                                <View style={{ flex: 1, width: '100%' }}>
                                    <CustomHeader containerStyle={{ marginLeft: Spaces.MD, paddingBottom: Spaces.XXXL }} />
                                    <View>
                                        <Authenticator.SignIn
                                            {...props}
                                            fields={fields.map((field) => ({
                                                ...field,
                                                labelHidden: true,
                                            }))}
                                            socialProviders={socialProviders}
                                            Header={() => null}
                                            toSignUp={toSignUp}
                                            hideSignUp={true}
                                            Footer={() => (
                                                <View>
                                                    <View style={styles.signInContainer}>
                                                        <ThemedText style={styles.signInText}>Don&apos;t have an account</ThemedText>
                                                        <Pressable onPress={toSignUp}>
                                                            <ThemedText style={[styles.signInLink, { color: themeColors.accent }]}>Sign Up</ThemedText>
                                                        </Pressable>
                                                    </View>
                                                </View>
                                            )}
                                        />
                                    </View>
                                </View>
                            ),
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
                        socialProviders={['google']}
                    ></Authenticator>
                </Authenticator.Provider>
            </ThemeProvider>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
    },
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
    signInContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spaces.MD,
        gap: Spaces.XS,
    },
    signInText: {
        // Customize as needed, such as color or font size
    },
    signInLink: {
        fontWeight: '500',
    },
});

export default LoginPage;
