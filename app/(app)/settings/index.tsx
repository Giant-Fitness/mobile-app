// app/(app)/settings/index.tsx

import React from 'react';
import { StyleSheet, Alert, View, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/base/ThemedView';
import { signOut } from 'aws-amplify/auth';
import { authService } from '@/utils/auth';
import { resetStore } from '@/store/actions';
import { useDispatch } from 'react-redux';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { useSharedValue } from 'react-native-reanimated';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Sizes } from '@/constants/Sizes';
import { TextButton } from '@/components/buttons/TextButton';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { lightenColor } from '@/utils/colorUtils';
import { PostHogProvider, usePostHog } from 'posthog-react-native';

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
};

const SettingItem = ({ text, onPress, iconName }: SettingItemProps) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[styles.settingItem, , { backgroundColor: lightenColor(themeColors.backgroundSecondary, 0.3) }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.settingItemContent]}>
                {iconName && <Icon name={iconName} size={18} color={themeColors.iconDefault} style={styles.settingItemIcon} />}
                <ThemedText type='body'>{text}</ThemedText>
            </View>
            <Icon name='chevron-forward' size={16} color={themeColors.iconDefault} style={{ opacity: 0.5 }} />
        </TouchableOpacity>
    );
};

const SettingsIndex = () => {
    const dispatch = useDispatch();
    const BYPASS_AUTH = false;
    const scrollY = useSharedValue(0);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const posthog = usePostHog();

    const handleSignOut = async () => {
        if (BYPASS_AUTH) {
            router.replace('/');
        } else {
            try {
                posthog.capture('sign_out_clicked');
                posthog.reset();
                await authService.clearAuthData();
                await signOut();
                await dispatch(resetStore());
                router.replace('/');
            } catch (error: unknown) {
                console.error('Error signing out:', error);
                const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
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

                <TextButton text='Sign Out' onPress={handleSignOut} iconName='exit' size='MD' style={styles.signOutButton} />

                <View style={styles.versionContainer}>
                    <ThemedText type='caption' style={styles.versionText}>
                        Version 0.0.1
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
        padding: Spaces.LG,
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
