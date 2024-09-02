// app/index.tsx

import React from 'react';
import { Button, View, StyleSheet, SafeAreaView, Pressable, Text } from 'react-native';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react-native';
import { Link } from 'expo-router';

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: 'ap-south-1_IGoQb5wRf',
            userPoolClientId: '60ps5arjs511dffmcu3arq902m',
            identityPoolId: '<your-cognito-identity-pool-id>',
            loginWith: {
                email: true,
                username: true,
            },
            signUpVerificationMethod: 'code',
            userAttributes: {
                email: {
                    required: true,
                },
            },
            allowGuestAccess: true,
            passwordFormat: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireNumbers: true,
                requireSpecialCharacters: true,
            },
        },
    },
});


const SignOutButton = () => {
    const { signOut } = useAuthenticator();

    return (
        <View style={styles.signOutButton}>
            <Button title='Sign Out' onPress={signOut} />
        </View>
    );
};

const LoginPage = () => {
    return (
        <Authenticator.Provider>
            <Authenticator loginMechanisms={['email']}>
                <SafeAreaView>
                    <SignOutButton />
                </SafeAreaView>
            </Authenticator>
        </Authenticator.Provider>
    );
};

const styles = StyleSheet.create({
    signOutButton: {
        alignSelf: 'flex-end',
    },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default LoginPage;
