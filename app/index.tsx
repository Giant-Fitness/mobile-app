// app/index.tsx

import React from 'react';
import { Button, View, StyleSheet, SafeAreaView, Pressable, Text } from 'react-native';
import { Amplify } from 'aws-amplify';
import { Authenticator, useAuthenticator, withAuthenticator } from '@aws-amplify/ui-react-native';
import { Link } from 'expo-router';
import outputs from "../amplify_outputs.json";
import { ThemedView } from '@/components/base/ThemedView';


Amplify.configure(outputs);


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
        <ThemedView style={styles.titleContainer}>
            <Link href={'/home'} replace asChild>
                <Pressable style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
            </Link>
            <SignOutButton />
        </ThemedView>
    );

};

const styles = StyleSheet.create({
    signOutButton: {
        alignSelf: 'flex-end',
    },
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

export default withAuthenticator(LoginPage);
