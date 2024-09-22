// app/index.tsx

import React from 'react';
import { StyleSheet, Pressable, Text, SafeAreaView } from 'react-native';
import { Amplify } from 'aws-amplify';
import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react-native';
import outputs from '../amplify_outputs.json';
import { Link, Redirect } from 'expo-router';
import { ThemedView } from '@/components/base/ThemedView';

Amplify.configure(outputs);

// Set the flag to bypass authentication
const BYPASS_AUTH = true; // Change this to false to enable authentication. You'll have to restart the expo server

const LoginPage = () => {
    if (BYPASS_AUTH) {
        return (
            <SafeAreaView style={styles.titleContainer}>
                <Link href={'/initialization'} replace asChild>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText}>Login</Text>
                    </Pressable>
                </Link>
            </SafeAreaView>
        );
    }

    // Otherwise, render the authenticator provider
    return (
        <Authenticator.Provider>
            <Authenticator>
                <Redirect href='/initialization' />
            </Authenticator>
        </Authenticator.Provider>
    );
};

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
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

// Conditionally export with or without the withAuthenticator HOC
export default BYPASS_AUTH ? LoginPage : withAuthenticator(LoginPage);
