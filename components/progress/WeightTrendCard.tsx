// components/progress/WeightTrendCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { ThemedText } from '@/components/base/ThemedText';
import { Icon } from '@/components/base/Icon';
import { TrendCard } from './TrendCard';
import { UserWeightMeasurement } from '@/types';
import { Spaces } from '@/constants/Spaces';
import { formatWeightForDisplay } from '@/utils/weightConversion';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';

type WeightTrendCardProps = {
    values: UserWeightMeasurement[];
    onPress: () => void;
    onLogWeight: () => void;
    isLoading?: boolean;
    style?: any;
};

const formatWeight = (weight: number, bodyWeightPreference: 'kgs' | 'lbs'): string => {
    return formatWeightForDisplay(weight, bodyWeightPreference);
};

const formatAverageWeight = (weight: number, bodyWeightPreference: 'kgs' | 'lbs'): string => {
    return formatWeightForDisplay(weight, bodyWeightPreference) + ' (average)';
};

const processWeightData = (values: UserWeightMeasurement[]) => {
    if (!values?.length) {
        return { processedData: [], dateRange: '', average: 0 };
    }

    const validData = values
        .filter((v) => typeof v.Weight === 'number' && !isNaN(v.Weight))
        .sort((a, b) => new Date(b.MeasurementTimestamp).getTime() - new Date(a.MeasurementTimestamp).getTime());

    const recentData = validData.slice(0, 7).reverse();

    if (recentData.length < 2) {
        return {
            processedData: [],
            dateRange: 'Not enough data',
            average: recentData[0]?.Weight || 0,
        };
    }

    // Calculate average using stored kg values for accuracy
    const avg = recentData.reduce((sum, v) => sum + v.Weight, 0) / recentData.length;

    const startDate = format(new Date(recentData[0].MeasurementTimestamp), 'MMM d');
    const endDate = format(new Date(recentData[recentData.length - 1].MeasurementTimestamp), 'MMM d');

    // Use kg values for calculating graph dimensions
    const minWeight = Math.min(...recentData.map((d) => d.Weight));
    const maxWeight = Math.max(...recentData.map((d) => d.Weight));
    const weightPadding = (maxWeight - minWeight) * 0.5;
    const adjustedMinWeight = Math.max(0, minWeight - weightPadding);
    const adjustedMaxWeight = maxWeight + weightPadding;
    const weightRange = adjustedMaxWeight - adjustedMinWeight;

    const processedData = recentData.map((d, i) => ({
        x: (i / (recentData.length - 1)) * 100,
        y: 40 - 4 - ((d.Weight - adjustedMinWeight) / weightRange) * (40 - 8),
        value: d.Weight, // Store original kg value
    }));

    return {
        processedData,
        dateRange: `${startDate} - ${endDate}`,
        average: avg,
    };
};

const SingleWeightDataPoint = ({ measurement, onPress, themeColors }: { measurement: UserWeightMeasurement; onPress: () => void; themeColors: any }) => {
    const measurementDate = new Date(measurement.MeasurementTimestamp);
    const today = new Date();
    const isToday = measurementDate.toDateString() === today.toDateString();
    const formattedDate = format(measurementDate, 'MMM d, yyyy');

    const bodyWeightPreference = useSelector((state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyWeightUnits as 'kgs' | 'lbs') || 'kgs');

    const content = (
        <View style={styles.singleDataContainer}>
            <View style={styles.singleDataContent}>
                <View style={styles.firstMeasurementContainer}>
                    <ThemedText type='bodyMedium' style={styles.firstMeasurementLabel}>
                        {isToday ? "Today's Measurement" : 'First Measurement'}
                    </ThemedText>
                    <ThemedText type='titleLarge' style={[styles.weightValue, { color: themeColors.purpleSolid }]}>
                        {formatWeight(measurement.Weight, bodyWeightPreference)}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[styles.dateText, { color: themeColors.subText }]}>
                        {formattedDate}
                    </ThemedText>
                </View>
                {isToday ? (
                    <View style={styles.messageContainer}>
                        <ThemedText type='bodySmall' style={[styles.helperText, { color: themeColors.subText }]}>
                            Great start! Come back tomorrow to log your next measurement.
                        </ThemedText>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity style={[styles.addNextButton, { backgroundColor: themeColors.purpleSolid }]} onPress={onPress} activeOpacity={0.8}>
                            <Icon name='plus' size={18} color={themeColors.white} style={styles.addIcon} />
                            <ThemedText type='button' style={[styles.buttonText, { color: themeColors.white }]}>
                                Add Next Measurement
                            </ThemedText>
                        </TouchableOpacity>
                        <ThemedText type='bodySmall' style={[styles.helperText, { color: themeColors.subText }]}>
                            Add another measurement
                        </ThemedText>
                    </>
                )}
            </View>
        </View>
    );

    return isToday ? (
        content
    ) : (
        <TouchableOpacity style={styles.contentWrapper} onPress={onPress} activeOpacity={0.8}>
            {content}
        </TouchableOpacity>
    );
};

export const WeightTrendCard: React.FC<WeightTrendCardProps> = ({ values, onPress, onLogWeight, isLoading, style }) => {
    const bodyWeightPreference = useSelector((state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyWeightUnits as 'kgs' | 'lbs') || 'kgs');

    return (
        <TrendCard
            data={values}
            onPress={onPress}
            onLogData={onLogWeight}
            isLoading={isLoading}
            style={style}
            title='Weight Trend'
            themeColor='purpleSolid'
            themeTransparentColor='purpleTransparent'
            emptyStateTitle='Track Your Weight Journey'
            emptyStateDescription='Track your weight regularly to see your journey take shape with charts that keep you motivated and informed.'
            formatValue={(value) => formatAverageWeight(value, bodyWeightPreference)}
            processData={processWeightData}
            renderSingleDataPoint={SingleWeightDataPoint}
        />
    );
};

const styles = StyleSheet.create({
    singleDataContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
    },
    singleDataContent: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: Spaces.SM,
    },
    firstMeasurementContainer: {
        alignItems: 'center',
        marginBottom: Spaces.MD,
    },
    firstMeasurementLabel: {
        marginBottom: Spaces.XXS,
    },
    weightValue: {
        fontSize: 28,
        fontWeight: '600',
        paddingTop: Spaces.MD,
        marginBottom: Spaces.XXS,
    },
    dateText: {
        marginBottom: Spaces.SM,
    },
    messageContainer: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.MD,
        width: '100%',
    },
    helperText: {
        textAlign: 'center',
        marginTop: Spaces.XXS,
    },
    addNextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: 20,
        marginBottom: Spaces.SM,
    },
    addIcon: {
        marginRight: Spaces.XXS,
    },
    buttonText: {
        fontWeight: '600',
    },
    contentWrapper: {
        width: '100%',
    },
});
