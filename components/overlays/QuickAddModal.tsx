// components/overlays/QuickAddModal.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch, RootState } from '@/store/store';
import {
    deleteBodyMeasurementAsync,
    deleteWeightMeasurementAsync,
    getBodyMeasurementsAsync,
    getWeightMeasurementsAsync,
    logBodyMeasurementAsync,
    logWeightMeasurementAsync,
} from '@/store/user/thunks';
import { addAlpha } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import React, { useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import { useDispatch, useSelector } from 'react-redux';

interface QuickAddModalProps {
    visible: boolean;
    onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ visible, onClose }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    // Get user data from Redux store
    const { userWeightMeasurements, userBodyMeasurements } = useSelector((state: RootState) => state.user);

    // State for logging sheets
    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [isBodyMeasurementsSheetVisible, setIsBodyMeasurementsSheetVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Ref to track if component is mounted
    const isMountedRef = useRef(true);

    // Weight logging handlers
    const handleLogWeight = async (weight: number, date: Date) => {
        setIsLoading(true);
        try {
            await dispatch(
                logWeightMeasurementAsync({
                    weight: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            await dispatch(getWeightMeasurementsAsync()).unwrap();
        } catch (error) {
            console.error('Failed to log weight:', error);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    const handleWeightDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteWeightMeasurementAsync({ timestamp })).unwrap();
            setIsWeightSheetVisible(false);
        } catch (error) {
            console.error('Failed to delete weight:', error);
        }
    };

    const getExistingWeightData = (date: Date) => {
        return userWeightMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    // Body measurements (waist) logging handlers
    const handleLogBodyMeasurements = async (measurements: Record<string, number>, date: Date) => {
        setIsLoading(true);
        try {
            await dispatch(
                logBodyMeasurementAsync({
                    measurements,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            await dispatch(getBodyMeasurementsAsync()).unwrap();
        } catch (error) {
            console.error('Failed to log body measurements:', error);
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    };

    const handleBodyMeasurementsDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteBodyMeasurementAsync({ timestamp })).unwrap();
            setIsBodyMeasurementsSheetVisible(false);
        } catch (error) {
            console.error('Failed to delete body measurements:', error);
        }
    };

    const getExistingBodyMeasurementsData = (date: Date) => {
        return userBodyMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const handleNutritionAction = (action: string) => {
        // Close the modal first
        onClose();

        // Navigate to food logging screen with the selected logging mode
        debounce(router, {
            pathname: '/(app)/nutrition/food-logging',
            params: { mode: action }, // Pass the selected mode as a parameter
        });
        trigger('selection');
    };

    const handleMeasurementAction = (measurement: string) => {
        // Close the main modal first, then open the specific logging sheet
        onClose();

        // Use a small delay to ensure the main modal closes before opening the new one
        setTimeout(() => {
            if (measurement === 'weight') {
                setIsWeightSheetVisible(true);
            } else if (measurement === 'waist') {
                setIsBodyMeasurementsSheetVisible(true);
            }
        }, 5);
    };

    const handleWeightSheetClose = () => {
        setIsWeightSheetVisible(false);
    };

    const handleBodyMeasurementsSheetClose = () => {
        setIsBodyMeasurementsSheetVisible(false);
    };

    const nutritionActions = [
        { id: 'search', label: 'Search', icon: 'saved-search', color: addAlpha(themeColors.protein, 0.5) },
        { id: 'quick-add', label: 'Quick Add', icon: 'add-chart', color: addAlpha(themeColors.carbs, 0.5) },
        { id: 'barcode', label: 'Barcode', icon: 'barcode', color: addAlpha(themeColors.fat, 0.5) },
    ];

    const measurementActions = [
        { id: 'weight', label: 'Weight', icon: 'scale' },
        { id: 'waist', label: 'Waist', icon: 'tape-measure' },
    ];

    return (
        <>
            <BottomSheet visible={visible} onClose={onClose}>
                <View style={styles.container}>
                    {/* Nutrition Section */}
                    <View style={styles.section}>
                        <ThemedText type='title' style={[styles.sectionTitle, { color: themeColors.text }]}>
                            Food
                        </ThemedText>
                        <View style={styles.nutritionRow}>
                            {nutritionActions.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    style={[styles.nutritionBox, { backgroundColor: action.color }]}
                                    onPress={() => handleNutritionAction(action.id)}
                                    activeOpacity={1}
                                >
                                    <Icon name={action.icon} color={themeColors.iconSelected} style={styles.nutritionIcon} />
                                    <ThemedText type='bodyXSmall'>{action.label}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Measurements Section */}
                    <View style={styles.section}>
                        <ThemedText type='title' style={[styles.sectionTitle, { color: themeColors.text }]}>
                            Measurements
                        </ThemedText>
                        <View style={styles.measurementRow}>
                            {measurementActions.map((measurement) => (
                                <TouchableOpacity
                                    key={measurement.id}
                                    style={[
                                        styles.measurementBox,
                                        {
                                            backgroundColor: themeColors.backgroundSecondary,
                                        },
                                    ]}
                                    onPress={() => handleMeasurementAction(measurement.id)}
                                    activeOpacity={1}
                                >
                                    <Icon name={measurement.icon} size={Sizes.iconSizeSM} color={themeColors.iconSelected} style={styles.measurementIcon} />

                                    <ThemedText type='bodySmall' style={[styles.measurementLabel, { color: themeColors.text }]}>
                                        {measurement.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>
            </BottomSheet>

            {/* Weight Logging Sheet */}
            <WeightLoggingSheet
                visible={isWeightSheetVisible}
                onClose={handleWeightSheetClose}
                onSubmit={handleLogWeight}
                onDelete={handleWeightDelete}
                isLoading={isLoading}
                getExistingData={getExistingWeightData}
            />

            {/* Body Measurements (Waist) Logging Sheet */}
            <BodyMeasurementsLoggingSheet
                visible={isBodyMeasurementsSheetVisible}
                onClose={handleBodyMeasurementsSheetClose}
                onSubmit={handleLogBodyMeasurements}
                onDelete={handleBodyMeasurementsDelete}
                isLoading={isLoading}
                getExistingData={getExistingBodyMeasurementsData}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spaces.LG,
    },
    section: {
        marginBottom: Spaces.LG,
    },
    sectionTitle: {
        marginBottom: Spaces.SM,
    },
    nutritionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: Spaces.MD,
    },
    nutritionBox: {
        flex: 1,
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.SM,
        borderRadius: Spaces.XS,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nutritionIcon: {
        marginBottom: Spaces.XXS,
    },
    measurementRow: {
        flexDirection: 'column',
        gap: Spaces.SM,
    },
    measurementBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        borderRadius: Spaces.XS,
    },
    measurementIcon: {
        marginRight: Spaces.MD,
    },
    measurementLabel: {},
});
