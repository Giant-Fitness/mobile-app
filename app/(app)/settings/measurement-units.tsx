// app/(app)/settings/measurement-units.tsx

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSharedValue } from 'react-native-reanimated';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { RootState } from '@/store/store';
import { setBodyWeightPreference, setLiftWeightPreference } from '@/store/settings/settingsSlice';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { RadioPill } from '@/components/inputs/RadioPill';

const UnitsSelectionScreen = () => {
    const dispatch = useDispatch();
    const bodyWeightPreference = useSelector((state: RootState) => state.settings.bodyWeightPreference);
    const liftWeightPreference = useSelector((state: RootState) => state.settings.liftWeightPreference);
    const [tempLiftWeightPreference, setTempLiftWeightPreference] = useState(liftWeightPreference);
    const [tempBodyWeightPreference, setTempBodyWeightPreference] = useState(bodyWeightPreference);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if any changes were made to enable/disable save button
    const hasChanges = bodyWeightPreference !== tempBodyWeightPreference || liftWeightPreference !== tempLiftWeightPreference;

    const scrollY = useSharedValue(0);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const toPressSave = async () => {
        setIsSubmitting(true);
        try {
            if (bodyWeightPreference !== tempBodyWeightPreference) {
                await dispatch(setBodyWeightPreference(tempBodyWeightPreference));
            }
            if (liftWeightPreference !== tempLiftWeightPreference) {
                await dispatch(setLiftWeightPreference(tempLiftWeightPreference));
            }
            router.navigate('/(app)/settings');
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
                title='Measurements Units'
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
                        Exercise Weights
                    </ThemedText>
                    <View style={[styles.options, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <RadioPill selected={tempLiftWeightPreference === 'kgs'} onPress={() => setTempLiftWeightPreference('kgs')} text='Kilograms' />
                        <RadioPill selected={tempLiftWeightPreference === 'lbs'} onPress={() => setTempLiftWeightPreference('lbs')} text='Pounds' />
                    </View>
                </View>

                <View style={styles.section}>
                    <ThemedText type='overlineTransformed' style={styles.sectionTitle}>
                        Body Weight
                    </ThemedText>
                    <View style={[styles.options, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <RadioPill selected={tempBodyWeightPreference === 'kgs'} onPress={() => setTempBodyWeightPreference('kgs')} text='Kilograms' />
                        <RadioPill selected={tempBodyWeightPreference === 'lbs'} onPress={() => setTempBodyWeightPreference('lbs')} text='Pounds' />
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
