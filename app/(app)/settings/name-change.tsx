// app/(app)/settings/name-change.tsx

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserAsync } from '@/store/user/thunks';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ThemedText } from '@/components/base/ThemedText';
import { TextInput } from '@/components/inputs/TextInput';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { useSharedValue } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { useColorScheme } from '@/hooks/useColorScheme';

const NameChangeScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);
    const [newName, setNewName] = useState(user?.FirstName || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const scrollY = useSharedValue(0);

    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handleChangeName = async () => {
        if (!newName?.trim()) {
            setError('Please enter your name'); // Made error message consistent
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await dispatch(
                updateUserAsync({
                    FirstName: newName.trim(),
                }),
            ).unwrap();
            router.navigate('/(app)/settings');
        } catch (err) {
            console.log(err);
            setError('Failed to save your name. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                title='Name'
                actionButton={{
                    icon: 'check',
                    onPress: handleChangeName,
                    isLoading: isSubmitting,
                    disabled: !newName.trim() || newName.trim() === user?.FirstName,
                }}
            />
            <ThemedView style={styles.content}>
                <View style={styles.welcomeContent}>
                    <ThemedText type='titleLarge' style={styles.welcomeDescription}>
                        Would you like to update what we call you?
                    </ThemedText>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        value={newName}
                        onChangeText={setNewName}
                        placeholder='Your name...'
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

                {/* <View style={styles.buttonContainer}>
                    <PrimaryButton 
                        text='Continue'
                        onPress={handleChangeName} 
                        disabled={isSubmitting} 
                        style={styles.button} 
                        size='MD' 
                    />
                </View> */}
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spaces.MD,
    },
    welcomeContent: {
        alignItems: 'center',
        gap: Spaces.XL,
        marginTop: Spaces.XL,
    },
    welcomeDescription: {
        textAlign: 'left',
        marginHorizontal: Spaces.SM,
    },
    inputContainer: {
        marginTop: Spaces.XS,
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

export default NameChangeScreen;
