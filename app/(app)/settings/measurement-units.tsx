// app/(app)/settings/measurement-units.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { RadioPill } from '@/components/inputs/RadioPill';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch, RootState } from '@/store/store';
import { updateUserAppSettingsAsync } from '@/store/user/thunks';
import { UserAppSettings } from '@/types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import { useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

const UnitsSelectionScreen = () => {
    const dispatch = useDispatch<AppDispatch>();
    const userAppSettings = useSelector((state: RootState) => state.user.userAppSettings);
    const bodyWeightPreference = userAppSettings?.UnitsOfMeasurement?.BodyWeightUnits || 'kgs';
    const liftWeightPreference = userAppSettings?.UnitsOfMeasurement?.LiftWeightUnits || 'kgs';
    const bodyMeasurementPreference = userAppSettings?.UnitsOfMeasurement?.BodyMeasurementUnits || 'cms';

    const [tempLiftWeightPreference, setTempLiftWeightPreference] = useState<string>(liftWeightPreference);
    const [tempBodyWeightPreference, setTempBodyWeightPreference] = useState<string>(bodyWeightPreference);
    const [tempBodyMeasurementPreference, setTempBodyMeasurementPreference] = useState<string>(bodyMeasurementPreference);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasChanges =
        bodyWeightPreference !== tempBodyWeightPreference ||
        liftWeightPreference !== tempLiftWeightPreference ||
        bodyMeasurementPreference !== tempBodyMeasurementPreference;

    const scrollY = useSharedValue(0);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const toPressSave = async () => {
        trigger('effectClick');
        setIsSubmitting(true);
        try {
            if (!userAppSettings) {
                throw new Error('User settings are not available');
            }
            const userId = userAppSettings.UserId ?? '';
            const updatedSettings: UserAppSettings = {
                ...userAppSettings,
                UserId: userId,
                UnitsOfMeasurement: {
                    BodyWeightUnits: tempBodyWeightPreference,
                    LiftWeightUnits: tempLiftWeightPreference,
                    BodyMeasurementUnits: tempBodyMeasurementPreference,
                },
            };
            await dispatch(updateUserAppSettingsAsync({ userAppSettings: updatedSettings }));
            router.back();
        } catch (error) {
            console.error('Error saving preferences:', error);
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
                title='Measurement Units'
                actionButton={{
                    icon: 'check',
                    onPress: toPressSave,
                    isLoading: isSubmitting,
                    disabled: !hasChanges,
                }}
            />
            <ThemedView style={styles.content}>
                <View style={styles.section}>
                    <ThemedText type='overlineTransformed' style={styles.sectionTitle}>
                        Body Weight
                    </ThemedText>
                    <View style={[styles.options, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <RadioPill selected={tempBodyWeightPreference === 'kgs'} onPress={() => setTempBodyWeightPreference('kgs')} text='Kilograms' />
                        <RadioPill selected={tempBodyWeightPreference === 'lbs'} onPress={() => setTempBodyWeightPreference('lbs')} text='Pounds' />
                    </View>
                </View>
                <View style={styles.section}>
                    <ThemedText type='overlineTransformed' style={styles.sectionTitle}>
                        Exercise Weights
                    </ThemedText>
                    <View style={[styles.options, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <RadioPill selected={tempLiftWeightPreference === 'kgs'} onPress={() => setTempLiftWeightPreference('kgs')} text='Kilograms' />
                        <RadioPill selected={tempLiftWeightPreference === 'lbs'} onPress={() => setTempLiftWeightPreference('lbs')} text='Pounds' />
                    </View>
                </View>
                <View style={styles.section}>
                    <ThemedText type='overlineTransformed' style={styles.sectionTitle}>
                        Body Measurements
                    </ThemedText>
                    <View style={[styles.options, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <RadioPill
                            selected={tempBodyMeasurementPreference === 'cms'}
                            onPress={() => setTempBodyMeasurementPreference('cms')}
                            text='Centimeters'
                        />
                        <RadioPill
                            selected={tempBodyMeasurementPreference === 'inches'}
                            onPress={() => setTempBodyMeasurementPreference('inches')}
                            text='Inches'
                        />
                    </View>
                </View>
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
        marginTop: Spaces.LG,
        paddingHorizontal: Spaces.LG,
    },
    section: {
        marginBottom: Spaces.LG,
    },
    sectionTitle: {
        marginBottom: Spaces.SM,
        paddingHorizontal: Spaces.SM,
        opacity: 0.7,
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.SM,
        borderRadius: Spaces.SM,
    },
});

export default UnitsSelectionScreen;
