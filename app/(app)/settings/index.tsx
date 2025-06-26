// app/(app)/settings/index.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TextButton } from '@/components/buttons/TextButton';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { resetStore } from '@/store/actions';
import { authService } from '@/utils/auth';
import { lightenColor } from '@/utils/colorUtils';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { usePostHog } from 'posthog-react-native';
import { useSharedValue } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
        <ThemedText type='overlineTransformed' style={styles.sectionTitle}>
            {title}
        </ThemedText>
        <View style={styles.sectionContent}>{children}</View>
    </View>
);

type SettingItemProps = {
    text: string;
    onPress: () => void;
    iconName?: string;
    endIcon?: string;
};

const SettingItem = ({ text, onPress, iconName, endIcon = 'chevron-forward' }: SettingItemProps) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: lightenColor(themeColors.backgroundSecondary, 0.3) }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.settingItemContent]}>
                {iconName && <Icon name={iconName} size={18} color={themeColors.iconDefault} style={styles.settingItemIcon} />}
                <ThemedText type='body'>{text}</ThemedText>
            </View>
            <Icon name={endIcon} size={16} color={themeColors.iconDefault} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
    );
};

const SettingsIndex = () => {
    const dispatch = useDispatch();
    const scrollY = useSharedValue(0);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const posthog = usePostHog();

    const handleSignOut = async () => {
        try {
            // Capture analytics event
            posthog.capture('sign_out_clicked');
            posthog.reset();

            const success = await authService.signOut();

            // Clear store state (this now also clears cache via authService.clearAuthData)
            await dispatch(resetStore());

            // Navigate to welcome screen with a slight delay to ensure cleanup
            setTimeout(() => {
                router.replace('/');
            }, 100);

            if (!success) {
                // If sign out failed through normal channels, still ensure local cleanup
                console.warn('Sign out through Amplify failed, but local state and cache have been cleared');
            }
        } catch (error: unknown) {
            console.error('Error during sign out process:', error);

            // Even on error, ensure complete cleanup
            try {
                // This will clear both auth data AND cache
                await authService.clearAuthData();
                await dispatch(resetStore());

                setTimeout(() => {
                    router.replace('/');
                }, 100);

                console.log('Fallback cleanup completed - auth data, cache, and Redux store cleared');
            } catch (cleanupError: unknown) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                            ? error.message
                            : cleanupError instanceof Error
                              ? cleanupError.message
                              : 'An unexpected error occurred'
                        : 'An unexpected error occurred';
                Alert.alert('Sign out Error', errorMessage);
            }
        }
    };

    const handleChangeName = () => {
        router.push('/(app)/settings/name-change');
    };

    const handlePreference = () => {
        router.push('/(app)/settings/measurement-units');
    };

    const handleDeleteAccount = async () => {
        const deleteAccountUrl = 'https://forms.gle/ZyKC2JvEg3KfiuSr6';

        try {
            await Linking.openURL(deleteAccountUrl);
            posthog.capture('delete_account_clicked');
        } catch (error) {
            console.error('Error opening Delete Account Form:', error);
            Alert.alert('Error', 'Unable to open Delete Account Form');
        }
    };

    const handlePrivacyPolicy = async () => {
        const privacyPolicyUrl = 'https://docs.google.com/document/d/1bJ-Xw8wAiOQhmAfmjhniHx8rpnEeBCgmnA5Pwg_MUlY/edit?tab=t.0#heading=h.b0je0ulgfxxr';

        try {
            await Linking.openURL(privacyPolicyUrl);
            posthog.capture('privacy_policy_clicked');
        } catch (error) {
            console.error('Error opening Privacy Policy:', error);
            Alert.alert('Error', 'Unable to open Privacy Policy');
        }
    };

    const handleTermsOfService = () => {
        router.push('/(app)/settings/terms-of-service');
    };

    const handleInstagramPress = async () => {
        const instagramUrl = 'https://instagram.com/kynfit.in';

        try {
            await Linking.openURL(instagramUrl);
            posthog.capture('instagram_link_clicked');
        } catch (error) {
            console.error('Error opening Instagram:', error);
            Alert.alert('Error', 'Unable to open Instagram');
        }
    };

    const handleWhatsAppPress = async () => {
        const whatsappGroupUrl = 'https://chat.whatsapp.com/ECLltc3OGZ28yhSdVS4KHe';

        try {
            const canOpen = await Linking.canOpenURL(whatsappGroupUrl);
            if (canOpen) {
                await Linking.openURL(whatsappGroupUrl);
                posthog.capture('whatsapp_beta_group_clicked');
            } else {
                Alert.alert('Error', 'WhatsApp is not installed on this device');
            }
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            Alert.alert('Error', 'Unable to open WhatsApp group');
        }
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} headerBackground={themeColors.background} title='Settings' />
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <SettingsSection title='Profile'>
                    <SettingItem text='Name' onPress={handleChangeName} iconName='person' />
                </SettingsSection>

                <SettingsSection title='Preferences'>
                    <SettingItem text='Measurement Units' onPress={handlePreference} iconName='pencil-ruler' />
                </SettingsSection>

                <SettingsSection title='Join our kyn'>
                    <SettingItem text='Instagram' onPress={handleInstagramPress} iconName='logo-instagram' endIcon='open-outline' />
                    <SettingItem text='Whatsapp' onPress={handleWhatsAppPress} iconName='logo-whatsapp' endIcon='open-outline' />
                </SettingsSection>

                <SettingsSection title='Legal'>
                    <SettingItem text='Terms and Conditions' onPress={handleTermsOfService} iconName='file-text' />
                    <SettingItem text='Privacy Policy' onPress={handlePrivacyPolicy} iconName='shield-checkmark' endIcon='open-outline' />
                    <SettingItem text='Delete Account' onPress={handleDeleteAccount} iconName='trash' endIcon='open-outline' />
                </SettingsSection>

                <TextButton text='Sign Out' onPress={handleSignOut} iconName='exit' size='MD' style={styles.signOutButton} haptic='impactHeavy' />

                <View style={styles.versionContainer}>
                    <ThemedText type='headline' style={styles.versionText}>
                        kyn
                    </ThemedText>
                    <ThemedText type='caption' style={styles.versionText}>
                        v1.0.0
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight,
    },
    scrollView: {
        flex: 1,
    },
    section: {
        paddingVertical: Spaces.MD,
    },
    sectionTitle: {
        paddingHorizontal: Spaces.XL,
        opacity: 0.7,
        fontSize: 13,
    },
    sectionContent: {},
    settingButton: {
        width: '100%',
        alignSelf: 'center',
        borderRadius: Spaces.SM,
        marginBottom: Spaces.XS,
        paddingHorizontal: Spaces.MD,
    },
    versionContainer: {
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.XL,
        alignItems: 'center',
    },
    versionText: {
        opacity: 0.5,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.XL,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    },
    settingItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    settingItemIcon: {
        marginRight: Spaces.MD,
    },
    signOutButton: {
        width: '80%',
        alignSelf: 'center',
        borderRadius: Spaces.SM,
        marginVertical: Spaces.XL,
        paddingHorizontal: Spaces.MD,
    },
});

export default SettingsIndex;
