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

export default function ProgressScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    React.useEffect(() => {
        navigation.setOptions({
            title: 'Settings',
            headerBackTitleVisible: false, // Hide the back button label
            headerStyle: {
                backgroundColor: themeColors.background,
            },
            headerTitleStyle: { color: themeColors.text, fontFamily: 'InterMedium' },
        });
    }, [navigation]);

    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={<Ionicons size={310} name='code-slash' style={styles.headerImage} />}
        >
            <ThemedView style={styles.titleContainer}>
                <ThemedText type='title'>Explore</ThemedText>
                <SignOutButton navigation={navigation} />
            </ThemedView>
            <ThemedText>This app includes example code to help you get started.</ThemedText>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    signOutButton: {
        alignSelf: 'flex-end',
    },
});
