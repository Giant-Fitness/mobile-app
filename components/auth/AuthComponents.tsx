// components/auth/AuthComponents.tsx

import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Pressable, TextInput, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from '@/components/base/Icon';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { signIn } from '@aws-amplify/auth';
import { router } from 'expo-router';
import { authService } from '@/utils/auth';

type CustomHeaderProps = {
    containerStyle?: ViewStyle;
    logoStyle?: ImageStyle;
    textContainerStyle?: ViewStyle;
    textStyle?: TextStyle;
};

export const CustomHeader: React.FC<CustomHeaderProps> = ({ containerStyle, logoStyle, textContainerStyle, textStyle }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.headerContainer, containerStyle]}>
            <Image source={require('@/assets/images/logo.png')} style={[styles.logo, logoStyle]} resizeMode='contain' />
            <View style={[styles.textContainer, textContainerStyle]}>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Gain Muscle
                </ThemedText>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Lose Weight
                </ThemedText>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Maintain Results
                </ThemedText>
            </View>
        </View>
    );
};

export const CustomSignIn = (props: any) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const { toSignUp, toForgotPassword } = props;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const handleSignIn = async () => {
        setLoading(true); // Set loading to true when sign-in starts
        try {
            await signIn({ username, password });
            setError('');
            await authService.storeAuthData();
            router.replace('/');
        } catch (err) {
            setError('Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false); // Reset loading to false after sign-in attempt
        }
    };

    useEffect(() => {
        setIsValid(username.trim().length > 0 && password.trim().length > 0);
    }, [username, password]);

    const handleInputChange = (field, value = '') => {
        if (field === 'username') setUsername(value);
        if (field === 'password') setPassword(value);
    };

    const renderIconPlaceholder = (field) => {
        const iconName = field.name === 'username' ? 'email' : 'lock';
        const placeholderText = field.name === 'username' ? 'Email' : 'Password';

        return (
            <View style={styles.iconInputContainer}>
                <Icon name={iconName} size={14} color={themeColors.subText} style={styles.icon} />
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: themeColors.background,
                            borderColor: field.error ? themeColors.red : themeColors.systemBorderColor,
                            color: themeColors.text,
                        },
                    ]}
                    placeholder={placeholderText}
                    placeholderTextColor={themeColors.subText}
                    onChangeText={(value) => handleInputChange(field.name, value)}
                    secureTextEntry={field.name === 'password' && !showPassword} // Toggle visibility
                    autoCapitalize='none'
                />
                {field.name === 'password' && (
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                        <Icon name={showPassword ? 'eye' : 'eye-off'} size={16} color={themeColors.subText} />
                    </Pressable>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <CustomHeader />
            <View style={styles.formContainer}>
                {['username', 'password'].map((fieldName) => (
                    <View key={fieldName}>
                        {renderIconPlaceholder({ name: fieldName, label: fieldName })}
                        {error && fieldName === 'password' && <ThemedText style={[styles.errorText, { color: themeColors.red }]}>{error}</ThemedText>}
                    </View>
                ))}

                <Pressable style={styles.forgotPasswordContainer} onPress={toForgotPassword}>
                    <ThemedText style={[styles.forgotPasswordText, { color: themeColors.subText }]}>Forgot Password?</ThemedText>
                </Pressable>

                <PrimaryButton text='Sign In' onPress={handleSignIn} size='LG' disabled={!isValid || loading} loading={loading} />

                <View style={styles.signUpContainer}>
                    <ThemedText style={styles.signUpText}>Don't have an account?</ThemedText>
                    <Pressable onPress={toSignUp}>
                        <ThemedText style={[styles.signUpLink, { color: themeColors.accent }]}>Sign Up</ThemedText>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'column',
    },
    logo: {
        width: Sizes.imageMDWidth,
        height: Sizes.imageMDHeight,
        marginLeft: -Spaces.SM,
    },
    textContainer: {
        marginTop: Spaces.MD,
        flex: 1,
        justifyContent: 'center',
        marginLeft: Spaces.MD,
    },
    headerText: {
        fontSize: 18,
        lineHeight: 24,
    },
    container: {
        flex: 1,
        width: '100%',
        padding: Spaces.MD,
    },
    formContainer: {
        width: '100%',
        gap: Spaces.MD,
        marginTop: Spaces.XL,
    },
    input: {
        width: '100%',
        paddingVertical: Spaces.SM + Spaces.XS,
        paddingHorizontal: Spaces.SM,
        borderRadius: Spaces.SM,
        fontSize: 14,
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginRight: Spaces.XS,
        paddingVertical: Spaces.SM,
    },
    forgotPasswordText: {},
    signUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spaces.MD,
        gap: Spaces.XS,
    },
    signUpText: {},
    signUpLink: {
        fontWeight: '500',
    },
    iconInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.SM,
        paddingLeft: Spaces.MD,
        width: '100%',
    },
    icon: {
        marginRight: Spaces.SM,
    },
    errorText: {
        marginTop: Spaces.LG,
        marginLeft: Spaces.SM,
        fontSize: 13,
    },
    eyeIcon: {
        position: 'absolute',
        right: Spaces.SM,
    },
});
