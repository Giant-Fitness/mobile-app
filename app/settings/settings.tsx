// app/settings/settings.tsx

import React from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedView } from '@/components/base/ThemedView';
import { signOut } from 'aws-amplify/auth';
import { authService } from '@/utils/auth';

const SettingsScreen = () => {
    const navigation = useNavigation();
    const BYPASS_AUTH = false; // toggle this to false to enable real authentication handling

    const handleSignOut = async () => {
        if (BYPASS_AUTH) {
            // Handle sign out when bypassing Amplify
            navigation.reset({
                index: 0,
                routes: [{ name: 'index' }],
            });
        } else {
            // Handle sign out using Amplify
            try {
                // Clear stored auth data
                await authService.clearAuthData();
                // Sign out from Amplify
                await signOut();
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
        <ThemedView>
            <Button title='Sign Out' onPress={handleSignOut} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({});

export default SettingsScreen;
