// app/settings/settings.tsx

import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View, Button } from 'react-native';
import React from 'react';
import ParallaxScrollView from '@/components/layout/ParallaxScrollView';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { signOut } from 'aws-amplify/auth';

const SignOutButton = ({ navigation }) => {

    const handleSignOut = async () => {
        try {
            await signOut();
            navigation.navigate('index'); // Redirect to the index (login) page after signing out
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <View style={styles.signOutButton}>
            <Button title='Sign Out' onPress={handleSignOut} />
        </View>
    );
};

const styles = StyleSheet.create({
    signOutButton: {
        alignSelf: 'flex-end',
    },
});
