// app/onboarding/name-collection.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router, useNavigation } from 'expo-router';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserAsync, getUserAsync } from '@/store/user/thunks';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ThemedText } from '@/components/base/ThemedText';
import { Sizes } from '@/constants/Sizes';
import { TextInput } from '@/components/inputs/TextInput';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const NameCollectionScreen = () => {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Check if we already have the user's name
    useEffect(() => {
        const checkUserName = async () => {
            if (!user) {
                const resultAction = await dispatch(getUserAsync());
                if (getUserAsync.fulfilled.match(resultAction)) {
                    const userData = resultAction.payload;
                    if (userData.FirstName) {
                        router.replace('/initialization');
                    }
                }
            } else if (user.FirstName) {
                router.replace('/initialization');
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
            router.replace('/initialization');
        } catch (err) {
            setError('Failed to save your name. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.content}>
                <View style={styles.welcomeContent}>
                    <ThemedText type='titleLarge' style={styles.welcomeDescription}>
                        Let's personalize your experience. What should we call you?
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
                    <PrimaryButton text='Continue' onPress={handleSubmit} disabled={isSubmitting} style={styles.button} size='MD' />
                </View>
            </SafeAreaView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spaces.MD,
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
