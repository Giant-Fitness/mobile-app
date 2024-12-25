// app/(app)/progress/all-weight-data.tsx

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
import { UserWeightMeasurement } from '@/types';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { MeasurementCalendar } from '@/components/progress/MeasurementCalendar';
import { AppDispatch } from '@/store/store';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { logWeightMeasurementAsync, updateWeightMeasurementAsync, deleteWeightMeasurementAsync } from '@/store/user/thunks';
import { kgToPounds } from '@/utils/weightConversion';

type CalendarData = {
    timestamp: string;
    value: number;
    originalData: UserWeightMeasurement;
    previousData?: UserWeightMeasurement;
};

export default function AllWeightDataScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);

    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<UserWeightMeasurement | null>(null);
    const [isAddingWeight, setIsAddingWeight] = useState(false);
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

    const { userWeightMeasurements } = useSelector((state: RootState) => state.user);
    const bodyWeightPreference = useSelector((state : RootState) => state.settings.bodyWeightPreference);

    // Calculate weight change between measurements
    const getWeightChange = (currentWeight: number, previousWeight: number | null) => {
        if (previousWeight === null) return null;
        const change = currentWeight - previousWeight;
        return change !== 0 ? change.toFixed(1) : null;
    };

    const handleAddWeight = () => {
        setSelectedMeasurement(null);
        setIsAddingWeight(true);
        setIsWeightSheetVisible(true);
    };

    const getExistingData = (date: Date) => {
        return userWeightMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const handleWeightAdd = async (weight: number, date: Date) => {
        try {
            await dispatch(
                logWeightMeasurementAsync({
                    weight: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();
            setIsAddingWeight(false);
        } catch (error) {
            console.error('Failed to log weight:', error);
        }
    };

    const handleWeightUpdate = async (weight: number) => {
        if (!selectedMeasurement) return;

        try {
            await dispatch(
                updateWeightMeasurementAsync({
                    timestamp: selectedMeasurement.MeasurementTimestamp,
                    weight: weight,
                }),
            ).unwrap();
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to update weight:', error);
        }
    };

    const handleWeightDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteWeightMeasurementAsync({ timestamp })).unwrap();
            setIsWeightSheetVisible(false);
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to delete weight:', error);
        }
    };

    const handleDayPress = (date: string) => {
        const selectedDate = new Date(date);
        setSelectedCalendarDate(selectedDate);

        const measurement = userWeightMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date);

        if (measurement) {
            handleTilePress(measurement);
        } else {
            setSelectedMeasurement(null);
            setIsAddingWeight(true);
            setIsWeightSheetVisible(true);
        }
    };

    const handleSheetClose = () => {
        setIsWeightSheetVisible(false);
        setSelectedMeasurement(null);
        setIsAddingWeight(false);
    };

    // Update tile press handler
    const handleTilePress = (measurement: UserWeightMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsAddingWeight(false);
        setIsWeightSheetVisible(true);
    };

    // Render tile for the measurement list
    const renderWeightTile = (item: UserWeightMeasurement, previousItem?: UserWeightMeasurement) => {
        const date = new Date(item.MeasurementTimestamp);
        const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });
        const month = date.toLocaleDateString('default', { month: 'short' });
        const day = date.getDate();

        const weightChange = previousItem ? getWeightChange(item.Weight, previousItem.Weight) : null;

        return (
            <TouchableOpacity
                style={[styles.tile, { backgroundColor: lightenColor(themeColors.purpleTransparent, 0.1) }]}
                onPress={() => handleTilePress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.tileLeft}>
                    <ThemedText type='caption' style={styles.dateText}>
                        {`${dayOfWeek}, ${month} ${day}`}
                    </ThemedText>
                    <ThemedText type='title' style={styles.weightText}>
                        {(bodyWeightPreference === 'pounds') ? `${kgToPounds(item.Weight)}lbs` : `${item.Weight.toFixed(1)}kg`}

                    </ThemedText>
                </View>
                {weightChange && (
                    <View style={styles.tileRight}>
                        <ThemedText
                            type='body'
                            style={[
                                styles.changeText,
                                {
                                    color: parseFloat(weightChange) > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3),
                                },
                            ]}
                        >
                            {parseFloat(weightChange) > 0 ? '+' : ''}
                            {(bodyWeightPreference === 'pounds') ? `${kgToPounds(parseFloat(weightChange)).toString()}lbs` : `${weightChange}kg`}


                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const measurementData = userWeightMeasurements.map((measurement) => ({
        timestamp: measurement.MeasurementTimestamp,
        value: measurement.Weight,
        originalData: measurement,
    }));

    // Prepare data for list rendering with previous measurements
    const renderListItem = (item: CalendarData) => {
        return renderWeightTile(item.originalData, item.previousData);
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                title='Weight History'
                menuIcon='plus'
                onMenuPress={handleAddWeight}
            />

            <View style={styles.content}>
                <MeasurementCalendar data={measurementData} onDayPress={handleDayPress} renderTile={renderListItem} measurementUnit='kg' />
            </View>

            <WeightLoggingSheet
                visible={isWeightSheetVisible}
                onClose={handleSheetClose}
                onSubmit={isAddingWeight ? handleWeightAdd : handleWeightUpdate}
                onDelete={handleWeightDelete}
                initialWeight={selectedMeasurement?.Weight}
                initialDate={isAddingWeight ? selectedCalendarDate : selectedMeasurement ? new Date(selectedMeasurement.MeasurementTimestamp) : undefined}
                isEditing={!!selectedMeasurement}
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
    weightText: {
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
