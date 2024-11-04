// app/progress/all-weight-data.tsx

import React, { useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
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

export default function AllWeightDataScreen() {
    const navigation = useNavigation();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);

    const { userWeightMeasurements } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Handle tile press
    const handleTilePress = (measurement: UserWeightMeasurement) => {
        console.log('Tile clicked:', measurement);
    };

    // Calculate weight change between measurements
    const getWeightChange = (currentWeight: number, previousWeight: number | null) => {
        if (previousWeight === null) return null;
        const change = currentWeight - previousWeight;
        return change !== 0 ? change.toFixed(1) : null;
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
                        {item.Weight.toFixed(1)} kg
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
                            {weightChange > 0 ? '+' : ''}
                            {weightChange} kg
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
    const renderListItem = (item: { originalData: UserWeightMeasurement; previousData?: UserWeightMeasurement }) => {
        return renderWeightTile(item.originalData, item.previousData);
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} headerBackground={themeColors.background} title='Weight History' />

            <View style={styles.content}>
                <MeasurementCalendar
                    data={measurementData}
                    onDayPress={(date) => {
                        const measurement = userWeightMeasurements.find((m) => new Date(m.MeasurementTimestamp).toDateString() === date);
                        if (measurement) {
                            handleTilePress(measurement);
                        }
                    }}
                    renderTile={renderListItem}
                    measurementUnit='kg'
                />
            </View>
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
