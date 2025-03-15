// components/cards/TrendCard.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { SparkLine, EmptySparkLine, SinglePointSparkLine } from '../charts/SparkLine';
import { ThemedText } from '../base/ThemedText';
import { lightenColor } from '@/utils/colorUtils';
import { format } from 'date-fns';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, useSharedValue } from 'react-native-reanimated';

type ThemeColorKey = keyof typeof Colors['light'];

type TrendCardProps = {
    title: string;
    data: any[];
    onPress: () => void;
    onLogData: () => void;
    isLoading?: boolean;
    style?: any;
    themeColor: ThemeColorKey;
    themeTransparentColor: ThemeColorKey;
    formatAvgValue: (value: number) => string;
    processData: (data: any[]) => {
        processedData: { x: number; y: number; value: number }[];
        dateRange: string;
        average: number;
    };
    valueKey?: string;
};

const ShimmerEffect = ({ style }: { style: any }) => {
    const translateX = useSharedValue(-100);

    React.useEffect(() => {
        translateX.value = withRepeat(withSequence(withTiming(-100), withTiming(100, { duration: 1000 }), withTiming(-100)), -1);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={[styles.shimmerContainer, style, { overflow: 'hidden' }]}>
            <Animated.View style={[styles.shimmer, animatedStyle]} />
        </View>
    );
};

export const TrendCard: React.FC<TrendCardProps> = ({
    title,
    data,
    onPress,
    onLogData,
    isLoading = false,
    style = {},
    themeColor,
    themeTransparentColor,
    formatAvgValue,
    processData,
    valueKey = 'Value',
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handlePress = () => {
        if (data?.length === 1) {
            const measurementDate = new Date(data[0].MeasurementTimestamp);
            const today = new Date();
            const isToday = measurementDate.toDateString() === today.toDateString();
            if (isToday) return;
        }

        if (!data?.length || data.length < 2) {
            onLogData();
        } else {
            onPress();
        }
    };

    // Common card styling for all states
    const cardStyle = [
        styles.card,
        {
            backgroundColor: themeColors[themeTransparentColor],
            borderColor: lightenColor(themeColors[themeColor], 0.7),
        },
        style,
    ];

    // Common divider styling for consistent placement
    const dividerStyle = [
        styles.divider,
        {
            borderBottomColor: themeColors.systemBorderColor,
            borderBottomWidth: StyleSheet.hairlineWidth,
        },
    ];

    if (isLoading) {
        return (
            <TouchableOpacity style={[styles.card, { backgroundColor: themeColors.backgroundSecondary }, style]} onPress={handlePress} activeOpacity={0.9}>
                <View style={styles.textContainer}>
                    <ShimmerEffect style={{ height: 20 }} />
                    <View style={{ height: 8 }} />
                    <ShimmerEffect style={{ height: 16 }} />
                </View>
                <View style={[styles.chartContainer, style.chartContainer]}>
                    <ShimmerEffect style={{ height: '100%' }} />
                </View>
                <View style={styles.footerContainer}>
                    <ShimmerEffect style={{ height: 20, width: '30%' }} />
                    <Icon name='chevron-forward' color={themeColors.subText} />
                </View>
            </TouchableOpacity>
        );
    }

    if (!data?.length) {
        return (
            <TouchableOpacity style={cardStyle} onPress={handlePress} activeOpacity={0.9}>
                <View style={styles.textContainer}>
                    <ThemedText type='button' style={styles.title}>
                        {title}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[styles.subtitle, { color: themeColors.subText }]}>
                        No data available
                    </ThemedText>
                </View>
                <View style={[styles.chartContainer, style.chartContainer]}>
                    <EmptySparkLine color={lightenColor(themeColors[themeColor], 0.5)} />
                </View>
                <View style={dividerStyle} />
                <View style={styles.footerContainer}>
                    <TouchableOpacity style={styles.addButtonSmall} onPress={handlePress} activeOpacity={0.8}>
                        <Icon name='plus' size={14} color={themeColors[themeColor]} style={styles.addIconSmall} />
                        <ThemedText type='button' style={[styles.buttonText, { color: themeColors[themeColor] }]}>
                            Start
                        </ThemedText>
                    </TouchableOpacity>
                    <Icon name='chevron-forward' size={14} color={themeColors.subText} style={{ marginTop: Spaces.XXS }} />
                </View>
            </TouchableOpacity>
        );
    }

    if (data.length === 1) {
        const measurement = data[0];
        const measurementDate = new Date(measurement.MeasurementTimestamp);
        const today = new Date();
        const isToday = measurementDate.toDateString() === today.toDateString();
        const formattedDate = format(measurementDate, 'MMM d, yyyy');

        // Get value using valueKey
        const value = measurement[valueKey] !== undefined ? measurement[valueKey] : 0;

        return (
            <TouchableOpacity style={cardStyle} onPress={handlePress} activeOpacity={0.9} disabled={isToday}>
                <View style={styles.textContainer}>
                    <ThemedText type='button' style={styles.title}>
                        {title}
                    </ThemedText>
                </View>

                <View style={styles.singlePointContainer}>
                    {isToday ? (
                        <>
                            <View style={styles.singlePointMessage}>
                                <ThemedText type='bodySmall' style={[styles.singlePointHelperText, { color: themeColors.subText }]}>
                                    Great start! Add another tomorrow to start tracking your trend.
                                </ThemedText>
                            </View>
                        </>
                    ) : (
                        <>
                            <View style={styles.textContainer}>
                                <ThemedText type='bodySmall' style={[styles.subtitle, { color: themeColors.subText }]}>
                                    {formattedDate}
                                </ThemedText>
                            </View>
                            <View style={[styles.chartContainer, style.chartContainer]}>
                                <SinglePointSparkLine value={value} color={lightenColor(themeColors[themeColor], 0.5)} />
                            </View>
                            <View style={dividerStyle} />
                            <View style={styles.footerContainer}>
                                <TouchableOpacity style={styles.addButtonSmall} onPress={handlePress} activeOpacity={0.8}>
                                    <Icon name='plus' size={14} color={themeColors[themeColor]} style={styles.addIconSmall} />
                                    <ThemedText type='button' style={[styles.buttonText, { color: themeColors[themeColor] }]}>
                                        Add next
                                    </ThemedText>
                                </TouchableOpacity>
                                <Icon name='chevron-forward' size={14} color={themeColors.subText} style={{ marginTop: Spaces.XXS }} />
                            </View>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        );
    }

    const { processedData, dateRange, average } = processData(data);

    return (
        <TouchableOpacity style={cardStyle} onPress={handlePress} activeOpacity={0.9}>
            <View style={styles.textContainer}>
                <ThemedText type='button' style={styles.title}>
                    {title}
                </ThemedText>
                <ThemedText type='bodySmall' style={[styles.subtitle, { color: themeColors.subText }]}>
                    {dateRange}
                </ThemedText>
            </View>
            <View style={[styles.chartContainer, style.chartContainer]}>
                <SparkLine data={processedData} color={themeColors[themeColor]} dotFillColor={themeColors[themeTransparentColor]} />
            </View>
            <View style={dividerStyle} />
            <View style={styles.footerContainer}>
                <ThemedText type='overline' style={[styles.value, { color: themeColors.subText }]}>
                    {formatAvgValue(average)}
                </ThemedText>
                <Icon name='chevron-forward' size={14} color={themeColors.subText} style={{ marginTop: Spaces.XXS }} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
        alignItems: 'flex-start',
        width: '100%',
        borderWidth: StyleSheet.hairlineWidth,
    },
    chartContainer: {
        width: '90%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: Spaces.XXS,
        position: 'relative',
    },
    textContainer: {
        width: '100%',
    },
    title: {},
    subtitle: {},
    value: {},
    footerContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    shimmerContainer: {
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
    shimmer: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F5F5F5',
    },
    divider: {
        marginBottom: Spaces.MD,
        width: '100%',
        alignSelf: 'center',
    },
    addButtonSmall: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addIconSmall: {
        marginRight: Spaces.XXS,
    },
    buttonText: {},
    // Single data point styles
    singlePointContainer: {
        width: '100%',
        alignItems: 'center',
    },
    singlePointMessage: {
        width: '100%',
        paddingHorizontal: Spaces.SM,
        justifyContent: 'center',
        minHeight: 120,
    },
    singlePointHelperText: {
        textAlign: 'center',
    },
    addNextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        borderRadius: 20,
        marginBottom: Spaces.XS,
    },
    addIcon: {
        marginRight: Spaces.XXS,
    },
});
