// app/(app)/onboarding/name-collection.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserAsync, getUserAsync } from '@/store/user/thunks';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ThemedText } from '@/components/base/ThemedText';
import { TextInput } from '@/components/inputs/TextInput';
import { usePostHog } from 'posthog-react-native';
import { Icon } from '@/components/base/Icon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const NameCollectionScreen = () => {
    const [firstName, setFirstName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);
    const posthog = usePostHog();

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Check if we already have the user's name
    useEffect(() => {
        const checkUserName = async () => {
            if (!user) {
                const resultAction = await dispatch(getUserAsync());
                if (getUserAsync.fulfilled.match(resultAction)) {
                    const userData = resultAction.payload;
                    if (userData.FirstName) {
                        router.replace('/(app)/initialization');
                    }
                }
            } else if (user.FirstName) {
                router.replace('/(app)/initialization');
            }
        };

        checkUserName();
    }, [user, dispatch]);

    const handleSubmit = async () => {
        if (!firstName?.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await dispatch(
                updateUserAsync({
                    FirstName: firstName.trim(),
                }),
            ).unwrap();
            posthog.capture('onboarding_name_submitted', {
                success: true,
                screen: 'name-collection',
            });
            router.replace('/(app)/initialization');
        } catch (err: any) {
            console.log(err);
            setError('Failed to save your name. Please try again.');
            posthog.capture('onboarding_name_submitted', {
                success: false,
                error_type: 'validation_error',
                error_message: err.message,
                screen: 'name-collection',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            {/* Simple Check Button in the top right */}
            <SafeAreaView style={styles.checkButtonContainer}>
                <TouchableOpacity style={styles.checkButton} onPress={handleSubmit} disabled={isSubmitting || !firstName.trim()} activeOpacity={0.7}>
                    {isSubmitting ? (
                        <ActivityIndicator color={themeColors.text} size='small' />
                    ) : (
                        <Icon name='check' size={22} color={themeColors.text} style={{ opacity: !firstName.trim() ? 0.2 : 1 }} />
                    )}
                </TouchableOpacity>
            </SafeAreaView>

            {/* Main Content */}
            <SafeAreaView style={styles.content}>
                <View style={styles.welcomeContent}>
                    <ThemedText type='titleLarge' style={styles.welcomeDescription}>
                        Let&apos;s personalize your experience. What should we call you?
                    </ThemedText>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder='Your first name...'
                        autoFocus
                        autoCapitalize='words'
                        style={styles.input}
                        textStyle={{ fontSize: 18 }}
                    />
                    {error ? (
                        <ThemedText type='caption' style={styles.errorText}>
                            {error}
                        </ThemedText>
                    ) : null}
                </View>

                <View style={styles.buttonContainer}>
                    <PrimaryButton text='Continue' onPress={handleSubmit} disabled={isSubmitting || !firstName.trim()} style={styles.button} size='MD' />
                </View>
            </SafeAreaView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    checkButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 10,
    },
    checkButton: {
        padding: Spaces.MD,
        margin: Spaces.SM,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spaces.LG,
        paddingVertical: Spaces.XL,
    },
    welcomeContent: {
        alignItems: 'center',
        gap: Spaces.XL,
        marginTop: Spaces.XL,
    },
    welcomeDescription: {
        textAlign: 'left',
    },
    inputContainer: {
        marginTop: Spaces.SM,
        width: '100%',
    },
    input: {
        width: '100%',
        borderWidth: 0,
    },
    errorText: {
        color: 'red',
        marginTop: Spaces.XS,
        paddingLeft: Spaces.MD,
        textAlign: 'left',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: Spaces.MD,
        position: 'absolute',
        bottom: Spaces.XL,
        alignSelf: 'center',
        alignItems: 'center',
    },
    button: {
        width: '100%',
        paddingVertical: Spaces.MD,
        borderRadius: Spaces.XL,
        alignItems: 'center',
        alignSelf: 'center',
    },
});

export default NameCollectionScreen;
