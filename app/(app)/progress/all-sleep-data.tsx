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
import { UserSleepMeasurement } from '@/types';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { useSharedValue } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { MeasurementCalendar } from '@/components/progress/MeasurementCalendar';
import { AppDispatch } from '@/store/store';
import { SleepLoggingSheet } from '@/components/progress/SleepLoggingSheet';
import { logSleepMeasurementAsync, updateSleepMeasurementAsync, deleteSleepMeasurementAsync } from '@/store/user/thunks';

type CalendarData = {
    timestamp: string;
    value: number;
    originalData: UserSleepMeasurement;
    previousData?: UserSleepMeasurement;
};

export default function AllSleepDataScreen() {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);

    const [isSleepSheetVisible, setIsSleepSheetVisible] = useState(false);
    const [selectedMeasurement, setSelectedMeasurement] = useState<UserSleepMeasurement | null>(null);
    const [isAddingSleep, setIsAddingSleep] = useState(false);
    const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

    const { userSleepMeasurements } = useSelector((state: RootState) => state.user);

    // Calculate Sleep change between measurements
    const getSleepChange = (currentSleep: number, previousSleep: number | null) => {
        if (previousSleep === null) return null;
        const change = currentSleep - previousSleep;
        return change !== 0 ? change.toFixed(1) : null;
    };

    const handleAddSleep = () => {
        setSelectedMeasurement(null);
        setIsAddingSleep(true);
        setIsSleepSheetVisible(true);
    };

    const getExistingData = (date: Date) => {
        return userSleepMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date.toDateString());
    };

    const handleSleepAdd = async (weight: number, date: Date) => {
        try {
            await dispatch(
                logSleepMeasurementAsync({
                    durationInMinutes: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();
            setIsAddingSleep(false);
        } catch (error) {
            console.error('Failed to log sleep:', error);
        }
    };

    const handleSleepUpdate = async (weight: number) => {
        if (!selectedMeasurement) return;

        try {
            await dispatch(
                updateSleepMeasurementAsync({
                    timestamp: selectedMeasurement.MeasurementTimestamp,
                    durationInMinutes: weight,
                }),
            ).unwrap();
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to update sleep:', error);
        }
    };

    const handleSleepDelete = async (timestamp: string) => {
        try {
            await dispatch(deleteSleepMeasurementAsync({ timestamp })).unwrap();
            setIsSleepSheetVisible(false);
            setSelectedMeasurement(null);
        } catch (error) {
            console.error('Failed to delete sleep:', error);
        }
    };

    const handleDayPress = (date: string) => {
        const selectedDate = new Date(date);
        setSelectedCalendarDate(selectedDate);

        const measurement = userSleepMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date);

        if (measurement) {
            handleTilePress(measurement);
        } else {
            setSelectedMeasurement(null);
            setIsAddingSleep(true);
            setIsSleepSheetVisible(true);
        }
    };

    const handleSheetClose = () => {
        setIsSleepSheetVisible(false);
        setSelectedMeasurement(null);
        setIsAddingSleep(false);
    };

    // Update tile press handler
    const handleTilePress = (measurement: UserSleepMeasurement) => {
        setSelectedMeasurement(measurement);
        setIsAddingSleep(false);
        setIsSleepSheetVisible(true);
    };

    // Render tile for the measurement list
    const renderSleepTile = (item: UserSleepMeasurement, previousItem?: UserSleepMeasurement) => {
        const date = new Date(item.MeasurementTimestamp);
        const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });
        const month = date.toLocaleDateString('default', { month: 'short' });
        const day = date.getDate();

        const sleepChange = previousItem ? getSleepChange(item.DurationInMinutes, previousItem.DurationInMinutes) : null;

        return (
            <TouchableOpacity
                style={[styles.tile, { backgroundColor: lightenColor(themeColors.blueTransparent, 0.1) }]}
                onPress={() => handleTilePress(item)}
                activeOpacity={0.8}
            >
                <View style={styles.tileLeft}>
                    <ThemedText type='caption' style={styles.dateText}>
                        {`${dayOfWeek}, ${month} ${day}`}
                    </ThemedText>
                    <ThemedText type='title' style={styles.weightText}>
                        {/* {item.Weight.toFixed(1)} kg */}
                        {Math.floor(item.DurationInMinutes / 60)} h {item.DurationInMinutes % 60} m
                    </ThemedText>
                </View>
                {sleepChange && (
                    <View style={styles.tileRight}>
                        <ThemedText
                            type='body'
                            style={[
                                styles.changeText,
                                {
                                    color: parseFloat(sleepChange) > 0 ? themeColors.maroonSolid : darkenColor(themeColors.accent, 0.3),
                                },
                            ]}
                        >
                            {parseFloat(sleepChange) > 0 ? '+' : ''}
                            {Math.floor(parseInt(sleepChange) / 60)} h {parseInt(sleepChange) % 60} m
                        </ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const measurementData = userSleepMeasurements.map((measurement) => ({
        timestamp: measurement.MeasurementTimestamp,
        value: measurement.DurationInMinutes,
        originalData: measurement,
    }));

    // Prepare data for list rendering with previous measurements
    const renderListItem = (item: CalendarData) => {
        return renderSleepTile(item.originalData, item.previousData);
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                title='Sleep History'
                menuIcon='plus'
                onMenuPress={handleAddSleep}
            />

            <View style={styles.content}>
                <MeasurementCalendar data={measurementData} onDayPress={handleDayPress} renderTile={renderListItem} measurementUnit='kg' isSleepData={true} />
            </View>

            <SleepLoggingSheet
                visible={isSleepSheetVisible}
                onClose={handleSheetClose}
                onSubmit={isAddingSleep ? handleSleepAdd : handleSleepUpdate}
                onDelete={handleSleepDelete}
                initialSleep={selectedMeasurement?.DurationInMinutes}
                initialDate={isAddingSleep ? selectedCalendarDate : selectedMeasurement ? new Date(selectedMeasurement.MeasurementTimestamp) : undefined}
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
