// components/progress/BodyMeasurementsLoggingSheet.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { IconButton } from '@/components/buttons/IconButton';
import { TextButton } from '@/components/buttons/TextButton';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RootState } from '@/store/store';
import { UserBodyMeasurement } from '@/types';
import { lightenColor } from '@/utils/colorUtils';
import { formatMeasurementForDisplay, parseMeasurementForStorage } from '@/utils/unitConversion';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { addDays, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';

interface BodyMeasurementsLoggingSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (measurements: Record<string, number>, date: Date) => Promise<void>;
    onDelete?: (timestamp: string) => Promise<void>;
    isLoading?: boolean;
    getExistingData?: (date: Date) => UserBodyMeasurement | undefined;
    initialDate?: Date;
    isEditing?: boolean;
}

export const BodyMeasurementsLoggingSheet: React.FC<BodyMeasurementsLoggingSheetProps> = ({
    visible,
    onClose,
    onSubmit,
    onDelete,
    getExistingData,
    initialDate,
    isEditing = false,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Move the useSelector hook to the top level of the component
    const measurementUnit = useSelector(
        (state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyMeasurementUnits as 'cms' | 'inches') || 'cms',
    );

    const [waist, setWaist] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(isEditing);
    const [originalWaist, setOriginalWaist] = useState<number | undefined>(undefined);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const waistInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            setIsSuccess(false);
            // Use initialDate if provided, otherwise use today
            const dateToUse = initialDate || new Date();
            const existingData = getExistingData?.(dateToUse);

            if (existingData) {
                // Convert waist measurement from cm to display unit (cms or inches)
                const displayWaist = existingData.waist ? formatMeasurementForDisplay(existingData.waist, measurementUnit).split(' ')[0] : '';

                setWaist(displayWaist);
                setOriginalWaist(parseFloat(displayWaist));
                setSelectedDate(new Date(existingData.MeasurementTimestamp));
                setIsEditingMode(true);
            } else {
                setOriginalWaist(undefined);
                setWaist('');
                setSelectedDate(dateToUse);
                setIsEditingMode(isEditing);
            }
            // Set the display month to match the selected date
            setDisplayMonth(dateToUse);

            setTimeout(() => {
                waistInputRef.current?.focus();
            }, 100);
        }
    }, [visible, getExistingData, initialDate, isEditing, measurementUnit]);

    useEffect(() => {
        if (visible && !isEditing) {
            const existingData = getExistingData?.(selectedDate);
            if (existingData) {
                // Convert waist measurement from cm to display unit (cms or inches)
                const displayWaist = existingData.waist ? formatMeasurementForDisplay(existingData.waist, measurementUnit).split(' ')[0] : '';

                setWaist(displayWaist);
                setOriginalWaist(parseFloat(displayWaist));
                setIsEditingMode(true);
            } else {
                setWaist('');
                setOriginalWaist(undefined);
                setIsEditingMode(false);
            }
        }
    }, [selectedDate, getExistingData, visible, isEditing, measurementUnit]);

    const handleClose = () => {
        if (isSuccess) {
            return;
        }

        Keyboard.dismiss();
        onClose();
        setWaist('');
        setSelectedDate(new Date());
        setDisplayMonth(new Date());
        setShowCalendar(false);
        setError('');
        setIsSubmitting(false);
        setIsDeleting(false);
        setIsSuccess(false);
    };

    const showCalendarView = () => {
        Keyboard.dismiss();
        setShowCalendar(true);
    };

    const hideCalendarView = () => {
        setShowCalendar(false);
        setTimeout(() => {
            waistInputRef.current?.focus();
        }, 100);
    };

    const handleSubmit = async () => {
        const waistNum = parseFloat(waist);
        if (isNaN(waistNum) || waistNum <= 0) {
            setError('Please enter a valid waist measurement');
            waistInputRef.current?.focus();
            return;
        }
        setError('');

        try {
            setIsSubmitting(true);

            // Convert from display unit (cms or inches) to cm for storage
            const waistCm = parseMeasurementForStorage(waistNum, measurementUnit);

            const measurements: Record<string, number> = {
                waist: waistCm,
            };

            let finalTimestamp;
            const localSelectedDate = new Date(selectedDate);

            if (isEditingMode && originalWaist !== undefined) {
                finalTimestamp = new Date(selectedDate.getTime());
            } else {
                localSelectedDate.setHours(0, 0, 0, 0);
                const utcMidnight = new Date(Date.UTC(localSelectedDate.getFullYear(), localSelectedDate.getMonth(), localSelectedDate.getDate(), 0, 0, 0));
                finalTimestamp = utcMidnight;
            }

            await onSubmit(measurements, finalTimestamp);
            setSuccessMessage(isEditingMode ? 'Measurements updated' : 'Measurements logged');
            setIsSuccess(true);
            await new Promise<void>((resolve) => setTimeout(resolve, 1600));
            onClose();
        } catch (err) {
            console.log(err);
            setError('Failed to save body measurements');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSuccessAnimation = () => {
        if (!isSuccess) return null;

        return (
            <View style={styles.successContainer}>
                <View style={styles.animationContainer}>
                    <LottieView source={require('@/assets/animations/check.json')} autoPlay loop={false} style={styles.animation} />
                </View>
                <ThemedText type='title' style={styles.successMessage}>
                    {successMessage}
                </ThemedText>
            </View>
        );
    };

    const handleDelete = async () => {
        if (!onDelete) return;

        setIsDeleting(true);
        try {
            const localSelectedDate = new Date(selectedDate);
            localSelectedDate.setHours(0, 0, 0, 0);
            const utcMidnight = new Date(Date.UTC(localSelectedDate.getFullYear(), localSelectedDate.getMonth(), localSelectedDate.getDate(), 0, 0, 0));
            await onDelete(utcMidnight.toISOString());
            handleClose();
        } catch (err) {
            console.log(err);
            setError('Failed to delete measurement');
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePrevMonth = () => {
        setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);
        if (nextMonth <= new Date()) {
            setDisplayMonth(nextMonth);
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        hideCalendarView();
    };

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setDisplayMonth(today);
        hideCalendarView();
    };

    const generateCalendarDays = (date: Date): Date[][] => {
        const start = startOfWeek(startOfMonth(date));
        const end = endOfWeek(endOfMonth(date));

        const days: Date[][] = [];
        let currentWeek: Date[] = [];
        let day = start;

        while (day <= end) {
            currentWeek.push(day);

            if (currentWeek.length === 7) {
                days.push(currentWeek);
                currentWeek = [];
            }

            day = addDays(day, 1);
        }

        if (currentWeek.length > 0) {
            days.push(currentWeek);
        }

        return days;
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose} style={Platform.OS === 'ios' ? { height: '66%' } : undefined}>
            <View style={styles.container}>
                {isSuccess ? (
                    renderSuccessAnimation()
                ) : (
                    <>
                        <ThemedView style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
                            <IconButton
                                onPress={handleClose}
                                iconName='close'
                                iconSize={18}
                                size={21}
                                style={styles.headerButton}
                                addBorder={false}
                                disabled={isSubmitting || isDeleting}
                            />

                            <ThemedText type='title'>{isEditingMode ? 'Edit Waist Measurement' : 'Log Waist Measurement'}</ThemedText>

                            <View style={styles.headerRight}>
                                {isSubmitting ? (
                                    <ActivityIndicator size='small' color={themeColors.subText} />
                                ) : (
                                    <IconButton
                                        onPress={handleSubmit}
                                        iconName='check'
                                        iconSize={20}
                                        size={25}
                                        iconColor={
                                            !isSubmitting &&
                                            !isDeleting &&
                                            !isNaN(parseFloat(waist)) &&
                                            parseFloat(waist) !== 0 &&
                                            (!isEditingMode || originalWaist !== parseFloat(waist))
                                                ? themeColors.text
                                                : lightenColor(themeColors.subText, 0.8)
                                        }
                                        addBorder={false}
                                        haptic='notificationSuccess'
                                        disabled={
                                            isSubmitting ||
                                            isDeleting ||
                                            isNaN(parseFloat(waist)) ||
                                            parseFloat(waist) === 0 ||
                                            (isEditingMode && originalWaist === parseFloat(waist))
                                        }
                                    />
                                )}
                            </View>
                        </ThemedView>

                        {error && (
                            <ThemedText type='bodySmall' style={[styles.errorText, { color: themeColors.red }]}>
                                {error}
                            </ThemedText>
                        )}

                        <View style={styles.mainContent}>
                            {!showCalendar ? (
                                <>
                                    <TouchableOpacity
                                        style={styles.dateSelector}
                                        onPress={() => !isEditing && showCalendarView()}
                                        disabled={isEditing || isSubmitting || isDeleting}
                                    >
                                        <ThemedText type='body' style={{ opacity: isEditing ? 0.5 : 1 }}>
                                            {format(selectedDate, 'dd/MM/yyyy')}
                                        </ThemedText>
                                        {!isEditing && (
                                            <Icon
                                                name='chevron-down'
                                                color={isSubmitting || isDeleting ? themeColors.subText : themeColors.text}
                                                size={16}
                                                style={{ marginTop: 1, marginLeft: Spaces.XS }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <ScrollView style={styles.inputContainer}>
                                        <View style={styles.measurementInputContainer}>
                                            <ThemedText type='buttonSmall' style={styles.inputLabel}>
                                                Waist
                                            </ThemedText>
                                            <View style={[styles.inputWrapper, { backgroundColor: themeColors.background }]}>
                                                <TextInput
                                                    ref={waistInputRef}
                                                    style={[
                                                        styles.input,
                                                        {
                                                            color: themeColors.text,
                                                            opacity: isSubmitting || isDeleting ? 0.5 : 1,
                                                        },
                                                    ]}
                                                    value={waist}
                                                    onChangeText={setWaist}
                                                    keyboardType='numeric'
                                                    placeholder='0.0'
                                                    placeholderTextColor={themeColors.subText}
                                                    editable={!isSubmitting && !isDeleting}
                                                />
                                                <ThemedText type='bodySmall' style={[styles.unit, { opacity: isSubmitting || isDeleting ? 0.5 : 0.7 }]}>
                                                    {measurementUnit === 'inches' ? ' in' : ' cm'}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </ScrollView>

                                    {/* Footer Delete Section */}
                                    {isEditingMode && onDelete && (
                                        <View style={[styles.footerActions, { borderTopColor: themeColors.systemBorderColor }]}>
                                            {isDeleting ? (
                                                <ActivityIndicator size='small' color={themeColors.red} />
                                            ) : (
                                                <>
                                                    <TextButton
                                                        iconName='trash'
                                                        iconColor={themeColors.red}
                                                        iconSize={12}
                                                        iconStyle={{ marginRight: 0 }}
                                                        text='Delete Entry'
                                                        onPress={handleDelete}
                                                        textStyle={[styles.deleteText, { color: themeColors.red }]}
                                                        disabled={isSubmitting || isDeleting}
                                                        style={[styles.deleteAction, { borderWidth: 0 }]}
                                                        textType='bodySmall'
                                                        haptic='notificationSuccess'
                                                    />
                                                </>
                                            )}
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.calendarContainer}>
                                    <View style={styles.calendarHeader}>
                                        <ThemedText type='body'>{format(displayMonth, 'MMMM yyyy')}</ThemedText>
                                        <View style={styles.calendarNav}>
                                            <TouchableOpacity onPress={handlePrevMonth} style={styles.navigationButton} disabled={isSubmitting || isDeleting}>
                                                <Icon name='chevron-back' color={themeColors.text} />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleNextMonth} style={styles.navigationButton} disabled={isSubmitting || isDeleting}>
                                                <Icon name='chevron-forward' color={themeColors.text} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.calendarGrid}>
                                        {generateCalendarDays(displayMonth).map((week, weekIndex) => (
                                            <View key={`week-${weekIndex}`} style={styles.calendarWeek}>
                                                {week.map((date, dayIndex) => {
                                                    const isCurrentMonth = isSameMonth(date, displayMonth);
                                                    const isToday = isSameDay(date, new Date());
                                                    const isSelected = isSameDay(date, selectedDate);
                                                    const isFutureDate = date > new Date();
                                                    const isDisabled = isFutureDate || !isCurrentMonth;
                                                    const hasEntry = getExistingData ? getExistingData(date) !== undefined : false;

                                                    return (
                                                        <TouchableOpacity
                                                            key={`day-${dayIndex}`}
                                                            style={[
                                                                styles.calendarDay,
                                                                isToday &&
                                                                    !isSelected && {
                                                                        borderWidth: StyleSheet.hairlineWidth,
                                                                        borderColor: themeColors.text,
                                                                    },
                                                                isSelected && {
                                                                    backgroundColor: themeColors.text,
                                                                },
                                                                hasEntry &&
                                                                    !isSelected &&
                                                                    isCurrentMonth && {
                                                                        borderColor: lightenColor(themeColors.text, 0.3),
                                                                        borderWidth: StyleSheet.hairlineWidth,
                                                                    },
                                                            ]}
                                                            onPress={() => handleDateSelect(date)}
                                                            disabled={isSubmitting || isDeleting || isDisabled}
                                                        >
                                                            <ThemedText
                                                                type='bodySmall'
                                                                style={[
                                                                    styles.dayText,
                                                                    isSelected && {
                                                                        color: themeColors.background,
                                                                    },
                                                                    isDisabled && {
                                                                        color: themeColors.subText,
                                                                        opacity: 0.5,
                                                                    },
                                                                    isToday &&
                                                                        !isSelected && {
                                                                            color: themeColors.text,
                                                                        },
                                                                ]}
                                                            >
                                                                {format(date, 'd')}
                                                            </ThemedText>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.calendarFooter}>
                                        <TextButton
                                            text='Go Back'
                                            onPress={hideCalendarView}
                                            style={[styles.calendarButton]}
                                            textStyle={{ color: themeColors.text }}
                                            disabled={isSubmitting || isDeleting}
                                        />
                                        <TextButton
                                            text='Go to Today'
                                            onPress={goToToday}
                                            style={[styles.calendarButton, { marginLeft: Spaces.MD }]}
                                            textStyle={{ color: themeColors.text }}
                                            disabled={isSubmitting || isDeleting}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </>
                )}
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    mainContent: {},
    errorText: {
        textAlign: 'center',
        marginBottom: Spaces.SM,
        paddingHorizontal: Spaces.LG,
    },
    container: {
        padding: Spaces.SM,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Spaces.MD,
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingBottom: Spaces.MD,
        marginBottom: Spaces.MD,
    },
    headerButton: {
        minWidth: 60,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 60,
        justifyContent: 'flex-end',
    },
    dateSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        paddingBottom: Spaces.MD,
        marginLeft: Spaces.SM,
        paddingHorizontal: Spaces.LG,
    },
    inputContainer: {
        paddingBottom: Spaces.MD,
    },
    inputLabel: {
        marginBottom: Spaces.SM,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        height: 48,
        borderWidth: StyleSheet.hairlineWidth,
    },
    input: {
        flex: 1,
    },
    unit: {
        marginLeft: Spaces.SM,
        opacity: 0.7,
    },
    measurementInputContainer: {
        marginBottom: Spaces.SM,
    },
    footerActions: {
        paddingTop: Spaces.SM,
        borderTopWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
    },
    deleteAction: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spaces.SM,
        paddingHorizontal: Spaces.MD,
    },
    deleteText: {
        marginLeft: Spaces.XS,
        fontSize: 12,
        opacity: 0.8,
    },
    calendarContainer: {
        marginTop: Spaces.MD,
        marginBottom: Spaces.XL,
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spaces.MD,
    },
    calendarNav: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navigationButton: {
        padding: Spaces.SM,
        marginLeft: Spaces.SM,
    },
    calendarGrid: {
        flexDirection: 'column',
        paddingVertical: Spaces.MD,
    },
    calendarWeek: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        width: '100%',
        marginBottom: 2,
    },
    dayText: {
        textAlign: 'center',
    },
    calendarDay: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 4,
        borderRadius: 20,
    },
    calendarFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.MD,
        marginTop: Spaces.LG,
    },
    calendarButton: {
        flex: 1,
        borderWidth: 0,
    },
    successContainer: {
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        alignSelf: 'center',
        minHeight: Sizes.bottomSpaceLarge,
        flex: 1,
        marginTop: Platform.select({
            ios: Sizes.bottomSpaceLarge,
            android: 0,
        }),
    },
    animationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spaces.XS,
    },
    animation: {
        height: Sizes.imageXSHeight,
        width: Sizes.imageXSHeight,
    },
    successMessage: {
        marginTop: Spaces.MD,
        textAlign: 'center',
    },
});
