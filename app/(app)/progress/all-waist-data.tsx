// app/(app)/progress/all-waist-data.tsx

import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { RootState } from '@/store/store';
import { UserBodyMeasurement } from '@/types';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { MeasurementCalendar } from '@/components/progress/MeasurementCalendar';
import { AppDispatch } from '@/store/store';
import { BodyMeasurementsLoggingSheet } from '@/components/progress/BodyMeasurementsLoggingSheet';
import { logBodyMeasurementAsync, updateBodyMeasurementAsync, deleteBodyMeasurementAsync } from '@/store/user/thunks';
import { formatMeasurementForDisplay, cmToInches } from '@/utils/unitConversion';

type CalendarData = {
    timestamp: string;
    value: number;
    originalData: UserBodyMeasurement;
    previousData?: UserBodyMeasurement;
};

export default function AllBodyMeasurementsDataScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);

    const [isBodyMeasurementsSheetVisible, setIsBodyMeasurementsSheetVisible] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<UserBodyMeasurement | null>(null);
    const [isAddingMeasurement, setIsAddingMeasurement] = useState(false);
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

    const { userBodyMeasurements } = useSelector((state: RootState) => state.user);
    const measurementUnit = useSelector(
        (state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyMeasurementUnits as 'cms' | 'inches') || 'cms',
    );

    // Calculate measurement change between measurements
    const getWaistChange = (currentWaist: number | undefined, previousWaist: number | undefined) => {
        if (previousWaist === undefined || currentWaist === undefined) return null;
        const change = currentWaist - previousWaist;
        return change !== 0 ? change.toFixed(1) : null;
    };

    const handleAddMeasurement = () => {
        // Reset the selected measurement
        setSelectedMeasurement(null);

        // Reset to today's date when adding a new measurement
        const today = new Date();
        setSelectedCalendarDate(today);

        // Set mode to adding and show the sheet
        setIsAddingMeasurement(true);
        setIsBodyMeasurementsSheetVisible(true);
    };

    const getExistingData = (date: Date) => {
        return userBodyMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const handleMeasurementAdd = async (measurements: Record<string, number>, date: Date) => {
        try {
            await dispatch(
                logBodyMeasurementAsync({
                    measurements,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();
            setIsAddingMeasurement(false);
        } catch (error) {
            console.error('Failed to log body measurement:', error);
        }
    };

    const handleMeasurementUpdate = async (measurements: Record<string, number>) => {
        if (!selectedMeasurement) return;

        try {
            await dispatch(
                updateBodyMeasurementAsync({
                    timestamp: selectedMeasurement.MeasurementTimestamp,
                    measurements,
                }),
            ).unwrap();
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to update body measurement:', error);
        }
    };

    const handleMeasurementDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteBodyMeasurementAsync({ timestamp })).unwrap();
            setIsBodyMeasurementsSheetVisible(false);
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to delete body measurement:', error);
        }
    };

    const handleDayPress = (date: string) => {
        const selectedDate = new Date(date);
        setSelectedCalendarDate(selectedDate);

        const measurement = userBodyMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === selectedDate.toDateString());

        if (measurement) {
            handleTilePress(measurement);
        } else {
            setSelectedMeasurement(null);
            setIsAddingMeasurement(true);
            setIsBodyMeasurementsSheetVisible(true);
        }
    };

    const handleSheetClose = () => {
        setIsBodyMeasurementsSheetVisible(false);
        setSelectedMeasurement(null);
        setIsAddingMeasurement(false);
    };

    // Update tile press handler
    const handleTilePress = (measurement: UserBodyMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsAddingMeasurement(false);
        setIsBodyMeasurementsSheetVisible(true);
    };

    // Render tile for the measurement list
    const renderMeasurementTile = (item: UserBodyMeasurement, previousItem?: UserBodyMeasurement) => {
        if (item.waist === undefined) return null;

        const date = new Date(item.MeasurementTimestamp);
        const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });
        const month = date.toLocaleDateString('default', { month: 'short' });
        const day = date.getDate();

        const waistChange = getWaistChange(item.waist, previousItem?.waist);

        return (
            <TouchableOpacity
                style={[styles.tile, { backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.1) }]}
                onPress={() => handleTilePress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.tileLeft}>
                    <ThemedText type='caption' style={styles.dateText}>
                        {`${dayOfWeek}, ${month} ${day}`}
                    </ThemedText>
                    <ThemedText type='title' style={styles.measurementText}>
                        {formatMeasurementForDisplay(item.waist || 0, measurementUnit)}
                    </ThemedText>
                </View>
                {waistChange && (
                    <View style={styles.tileRight}>
                        <ThemedText
                            type='body'
                            style={[
                                styles.changeText,
                                {
                                    color: parseFloat(waistChange) > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3),
                                },
                            ]}
                        >
                            {parseFloat(waistChange) > 0 ? '+' : ''}
                            {measurementUnit === 'inches' ? `${cmToInches(parseFloat(waistChange)).toFixed(1)} in` : `${waistChange} cm`}
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Filter and prepare measurements data that have waist values
    const measurementData = userBodyMeasurements
        .filter((m) => m.waist !== undefined)
        .map((measurement) => ({
            timestamp: measurement.MeasurementTimestamp,
            value: measurement.waist || 0,
            originalData: measurement,
        }));

    // Prepare data for list rendering with previous measurements
    const renderListItem = (item: CalendarData) => {
        return renderMeasurementTile(item.originalData, item.previousData);
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                title='Body Measurements History'
                menuIcon='plus'
                onMenuPress={handleAddMeasurement}
            />

            <View style={styles.content}>
                <MeasurementCalendar data={measurementData} onDayPress={handleDayPress} renderTile={renderListItem} backgroundColor='tangerineSolid' />
            </View>

            <BodyMeasurementsLoggingSheet
                visible={isBodyMeasurementsSheetVisible}
                onClose={handleSheetClose}
                onSubmit={isAddingMeasurement ? handleMeasurementAdd : handleMeasurementUpdate}
                onDelete={handleMeasurementDelete}
                initialDate={isAddingMeasurement ? selectedCalendarDate : selectedMeasurement ? new Date(selectedMeasurement.MeasurementTimestamp) : undefined}
                isLoading={false}
                getExistingData={getExistingData}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight,
    },
    content: {
        flex: 1,
        paddingTop: Spaces.SM,
    },
    tile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        marginVertical: Spaces.XS,
        marginHorizontal: Spaces.MD,
        borderRadius: Spaces.SM,
    },
    tileLeft: {
        flex: 1,
    },
    tileRight: {
        marginLeft: Spaces.MD,
    },
    dateText: {
        marginBottom: Spaces.XS,
    },
    measurementText: {
        fontWeight: '600',
    },
    changeText: {
        fontWeight: '500',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: Spaces.XL,
        opacity: 0.7,
    },
});
