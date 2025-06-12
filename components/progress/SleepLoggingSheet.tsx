// components/progress/SleepLoggingSheet.tsx

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Platform, ActivityIndicator, Keyboard } from 'react-native';
import LottieView from 'lottie-react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from '@/components/base/Icon';
import { TextButton } from '@/components/buttons/TextButton';
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, format } from 'date-fns';
import { lightenColor } from '@/utils/colorUtils';
import { Sizes } from '@/constants/Sizes';
import { SleepSubmissionData, UserSleepMeasurement } from '@/types';
import { IconButton } from '@/components/buttons/IconButton';

interface SleepLoggingSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (sleepData: SleepSubmissionData, date: Date) => Promise<void>;
    onDelete?: (timestamp: string) => Promise<void>;
    initialSleep?: number;
    initialDate?: Date;
    isEditing?: boolean;
    isLoading?: boolean;
    getExistingData?: (data: Date) => UserSleepMeasurement | undefined;
}

export const SleepLoggingSheet: React.FC<SleepLoggingSheetProps> = ({
    visible,
    onClose,
    onSubmit,
    onDelete,
    initialSleep,
    initialDate,
    isEditing = false,
    getExistingData,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Time input states (12-hour format)
    const [sleepHour, setSleepHour] = useState<string>('');
    const [sleepMinute, setSleepMinute] = useState<string>('');
    const [sleepAmPm, setSleepAmPm] = useState<'AM' | 'PM'>('PM');

    const [wakeHour, setWakeHour] = useState<string>('');
    const [wakeMinute, setWakeMinute] = useState<string>('');
    const [wakeAmPm, setWakeAmPm] = useState<'AM' | 'PM'>('AM');

    // Common states
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(isEditing);
    const [originalSleepData, setOriginalSleepData] = useState<UserSleepMeasurement | undefined>(undefined);
    const [originalTimestamp, setOriginalTimestamp] = useState<string | undefined>(undefined);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const sleepHourInputRef = useRef<TextInput>(null);

    // Helper functions
    const convertTo24Hour = (hour: string, minute: string, ampm: 'AM' | 'PM'): string => {
        let h = parseInt(hour) || 0;
        const m = (parseInt(minute) || 0).toString().padStart(2, '0');

        if (h < 1 || h > 12) throw new Error('Invalid hour');

        if (ampm === 'AM') {
            h = h === 12 ? 0 : h;
        } else {
            h = h === 12 ? 12 : h + 12;
        }

        return `${h.toString().padStart(2, '0')}:${m}`;
    };

    const convertFrom24Hour = (time24: string): { hour: string; minute: string; ampm: 'AM' | 'PM' } => {
        const [hour24, minute] = time24.split(':');
        let hour = parseInt(hour24);
        const ampm: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';

        if (hour === 0) {
            hour = 12;
        } else if (hour > 12) {
            hour = hour - 12;
        }

        return {
            hour: hour.toString(),
            minute: minute,
            ampm,
        };
    };

    const calculateDurationFromTimes = (sleepTime24: string, wakeTime24: string): number => {
        const [sleepHour, sleepMin] = sleepTime24.split(':').map(Number);
        const [wakeHour, wakeMin] = wakeTime24.split(':').map(Number);

        let sleepMinutes = sleepHour * 60 + sleepMin;
        let wakeMinutes = wakeHour * 60 + wakeMin;

        // Handle cross-midnight sleep
        if (wakeMinutes <= sleepMinutes) {
            wakeMinutes += 24 * 60; // Add 24 hours
        }

        const duration = wakeMinutes - sleepMinutes;

        if (duration <= 0 || duration > 1440) {
            throw new Error('Invalid sleep duration');
        }

        return duration;
    };

    const getDefaultSleepTimes = (durationMinutes?: number) => {
        // Default to 10:00 PM sleep time, calculate wake time from duration
        const defaultSleepTime = '22:00';
        let defaultWakeTime = '06:00';

        if (durationMinutes) {
            const sleepDate = new Date();
            sleepDate.setHours(22, 0, 0, 0);
            const wakeDate = new Date(sleepDate.getTime() + durationMinutes * 60 * 1000);
            const wakeHours = wakeDate.getHours().toString().padStart(2, '0');
            const wakeMinutes = wakeDate.getMinutes().toString().padStart(2, '0');
            defaultWakeTime = `${wakeHours}:${wakeMinutes}`;
        }

        return { sleepTime: defaultSleepTime, wakeTime: defaultWakeTime };
    };

    useEffect(() => {
        if (visible) {
            setIsSuccess(false);

            const today = new Date();
            const existingData = getExistingData?.(initialDate || today);

            if (existingData) {
                let sleepTime24, wakeTime24;

                // If we have sleep/wake times, use them; otherwise create from duration
                if (existingData.SleepTime && existingData.WakeTime) {
                    sleepTime24 = existingData.SleepTime;
                    wakeTime24 = existingData.WakeTime;
                } else {
                    // Create times from duration using default logic
                    const defaultTimes = getDefaultSleepTimes(existingData.DurationInMinutes);
                    sleepTime24 = defaultTimes.sleepTime;
                    wakeTime24 = defaultTimes.wakeTime;
                }

                // Convert to 12-hour format for display
                const sleepTime12 = convertFrom24Hour(sleepTime24);
                const wakeTime12 = convertFrom24Hour(wakeTime24);

                setSleepHour(sleepTime12.hour);
                setSleepMinute(sleepTime12.minute);
                setSleepAmPm(sleepTime12.ampm);

                setWakeHour(wakeTime12.hour);
                setWakeMinute(wakeTime12.minute);
                setWakeAmPm(wakeTime12.ampm);

                setSelectedDate(new Date(existingData.MeasurementTimestamp));
                setOriginalSleepData(existingData);
                setOriginalTimestamp(existingData.MeasurementTimestamp);
                setIsEditingMode(true);
            } else {
                // New entry - set reasonable defaults
                setSleepHour('10');
                setSleepMinute('00');
                setSleepAmPm('PM');

                setWakeHour('6');
                setWakeMinute('00');
                setWakeAmPm('AM');

                setSelectedDate(initialDate || today);
                setOriginalSleepData(undefined);
                setOriginalTimestamp(undefined);
                setIsEditingMode(false);
            }
            setDisplayMonth(initialDate || today);

            setTimeout(() => {
                sleepHourInputRef.current?.focus();
            }, 100);
        }
    }, [visible, initialSleep, initialDate, getExistingData]);

    useEffect(() => {
        if (visible && !isEditing) {
            const existingData = getExistingData?.(selectedDate);
            if (existingData) {
                let sleepTime24, wakeTime24;

                if (existingData.SleepTime && existingData.WakeTime) {
                    sleepTime24 = existingData.SleepTime;
                    wakeTime24 = existingData.WakeTime;
                } else {
                    const defaultTimes = getDefaultSleepTimes(existingData.DurationInMinutes);
                    sleepTime24 = defaultTimes.sleepTime;
                    wakeTime24 = defaultTimes.wakeTime;
                }

                const sleepTime12 = convertFrom24Hour(sleepTime24);
                const wakeTime12 = convertFrom24Hour(wakeTime24);

                setSleepHour(sleepTime12.hour);
                setSleepMinute(sleepTime12.minute);
                setSleepAmPm(sleepTime12.ampm);

                setWakeHour(wakeTime12.hour);
                setWakeMinute(wakeTime12.minute);
                setWakeAmPm(wakeTime12.ampm);

                setOriginalSleepData(existingData);
                setOriginalTimestamp(existingData.MeasurementTimestamp);
                setIsEditingMode(true);
            } else {
                // Reset to defaults for new entry
                setSleepHour('10');
                setSleepMinute('00');
                setSleepAmPm('PM');

                setWakeHour('6');
                setWakeMinute('00');
                setWakeAmPm('AM');

                setOriginalSleepData(undefined);
                setOriginalTimestamp(undefined);
                setIsEditingMode(false);
            }
        }
    }, [selectedDate, getExistingData, visible, isEditing, initialSleep]);

    const handleClose = () => {
        if (isSuccess) {
            return;
        }

        Keyboard.dismiss();
        onClose();
        setSleepHour('');
        setSleepMinute('');
        setSleepAmPm('PM');
        setWakeHour('');
        setWakeMinute('');
        setWakeAmPm('AM');
        setSelectedDate(new Date());
        setDisplayMonth(new Date());
        setShowCalendar(false);
        setError('');
        setIsSubmitting(false);
        setIsDeleting(false);
        setIsSuccess(false);
        setOriginalSleepData(undefined);
        setOriginalTimestamp(undefined);
    };

    const showCalendarView = () => {
        Keyboard.dismiss();
        setShowCalendar(true);
    };

    const hideCalendarView = () => {
        setShowCalendar(false);
        setTimeout(() => {
            sleepHourInputRef.current?.focus();
        }, 100);
    };

    const validateAndCalculateDuration = (): { sleepTime24: string; wakeTime24: string; duration: number } => {
        // Validate inputs
        const sHour = parseInt(sleepHour);
        const sMinute = parseInt(sleepMinute) || 0;
        const wHour = parseInt(wakeHour);
        const wMinute = parseInt(wakeMinute) || 0;

        if (!sleepHour || sHour < 1 || sHour > 12) {
            throw new Error('Please enter a valid sleep hour (1-12)');
        }
        if (sMinute < 0 || sMinute > 59) {
            throw new Error('Please enter valid sleep minutes (0-59)');
        }
        if (!wakeHour || wHour < 1 || wHour > 12) {
            throw new Error('Please enter a valid wake hour (1-12)');
        }
        if (wMinute < 0 || wMinute > 59) {
            throw new Error('Please enter valid wake minutes (0-59)');
        }

        // Convert to 24-hour format
        const sleepTime24 = convertTo24Hour(sleepHour, sleepMinute, sleepAmPm);
        const wakeTime24 = convertTo24Hour(wakeHour, wakeMinute, wakeAmPm);

        // Calculate and validate duration
        const duration = calculateDurationFromTimes(sleepTime24, wakeTime24);

        // Additional validation for reasonable sleep duration
        if (duration < 10) {
            throw new Error('Sleep duration seems too short (less than 10 minutes)');
        }
        if (duration > 960) {
            // 16 hours
            throw new Error('Sleep duration seems too long (more than 16 hours)');
        }

        return { sleepTime24, wakeTime24, duration };
    };

    const handleSubmit = async () => {
        setError('');

        try {
            setIsSubmitting(true);

            const { sleepTime24, wakeTime24 } = validateAndCalculateDuration();

            const sleepData: SleepSubmissionData = {
                sleepTime: sleepTime24,
                wakeTime: wakeTime24,
            };

            let finalTimestamp;
            const localSelectedDate = new Date(selectedDate);

            if (isEditingMode && originalTimestamp !== undefined) {
                // Preserve exact original timestamp when editing existing measurement
                finalTimestamp = new Date(originalTimestamp);
            } else {
                // Snap to UTC midnight for new measurements
                localSelectedDate.setHours(0, 0, 0, 0);
                finalTimestamp = new Date(Date.UTC(localSelectedDate.getFullYear(), localSelectedDate.getMonth(), localSelectedDate.getDate(), 0, 0, 0));
            }

            await onSubmit(sleepData, finalTimestamp);
            setSuccessMessage(isEditingMode ? 'Sleep time updated' : 'Sleep logged');
            setIsSuccess(true);
            await new Promise<void>((resolve) => setTimeout(resolve, 1600));
            onClose();
        } catch (err: any) {
            console.log(err);
            setError(err.message || 'Failed to save sleep time');
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

    const hasChanges = (): boolean => {
        if (!isEditingMode || !originalSleepData) {
            return true; // For new entries, always allow saving
        }

        try {
            // Get current values in 24-hour format
            const currentSleepTime24 = convertTo24Hour(sleepHour, sleepMinute, sleepAmPm);
            const currentWakeTime24 = convertTo24Hour(wakeHour, wakeMinute, wakeAmPm);

            // Get original values in 24-hour format
            let originalSleepTime24, originalWakeTime24;

            if (originalSleepData.SleepTime && originalSleepData.WakeTime) {
                originalSleepTime24 = originalSleepData.SleepTime;
                originalWakeTime24 = originalSleepData.WakeTime;
            } else {
                // If original data only has duration, recreate the default times
                const defaultTimes = getDefaultSleepTimes(originalSleepData.DurationInMinutes);
                originalSleepTime24 = defaultTimes.sleepTime;
                originalWakeTime24 = defaultTimes.wakeTime;
            }

            // Compare times
            return currentSleepTime24 !== originalSleepTime24 || currentWakeTime24 !== originalWakeTime24;
        } catch {
            // If there's an error in conversion, treat as having changes
            return true;
        }
    };

    const renderTimeInput = (
        title: string,
        hour: string,
        setHour: (value: string) => void,
        minute: string,
        setMinute: (value: string) => void,
        ampm: 'AM' | 'PM',
        setAmPm: (value: 'AM' | 'PM') => void,
        hourRef?: React.RefObject<TextInput>,
    ) => (
        <View style={styles.timeInputSection}>
            <View style={styles.timeInputRow}>
                <ThemedText type='bodySmall' style={styles.timeTitle}>
                    {title}
                </ThemedText>
                <TextInput
                    ref={hourRef}
                    style={[styles.timeDigitInput, { color: themeColors.text, borderColor: themeColors.systemBorderColor }]}
                    value={hour}
                    onChangeText={(text) => {
                        const num = parseInt(text);
                        if (text === '' || (num >= 1 && num <= 12)) {
                            setHour(text);
                        }
                    }}
                    placeholder='12'
                    placeholderTextColor={themeColors.subText}
                    keyboardType='numeric'
                    maxLength={2}
                    editable={!isSubmitting && !isDeleting}
                />

                <ThemedText type='title' style={styles.timeSeparator}>
                    :
                </ThemedText>

                <TextInput
                    style={[styles.timeDigitInput, { color: themeColors.text, borderColor: themeColors.systemBorderColor }]}
                    value={minute}
                    onChangeText={(text) => {
                        const num = parseInt(text);
                        if (text === '' || (num >= 0 && num <= 59)) {
                            setMinute(text.padStart(2, '0'));
                        }
                    }}
                    placeholder='00'
                    placeholderTextColor={themeColors.subText}
                    keyboardType='numeric'
                    maxLength={2}
                    editable={!isSubmitting && !isDeleting}
                />

                <View style={styles.ampmContainer}>
                    <TouchableOpacity
                        style={[
                            styles.ampmButton,
                            ampm === 'AM' && styles.ampmButtonActive,
                            { backgroundColor: ampm === 'AM' ? themeColors.text : 'transparent', borderColor: themeColors.systemBorderColor },
                        ]}
                        onPress={() => setAmPm('AM')}
                        disabled={isSubmitting || isDeleting}
                    >
                        <ThemedText type='bodySmall' style={[styles.ampmText, { color: ampm === 'AM' ? themeColors.background : themeColors.text }]}>
                            AM
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.ampmButton,
                            ampm === 'PM' && styles.ampmButtonActive,
                            { backgroundColor: ampm === 'PM' ? themeColors.text : 'transparent', borderColor: themeColors.systemBorderColor },
                        ]}
                        onPress={() => setAmPm('PM')}
                        disabled={isSubmitting || isDeleting}
                    >
                        <ThemedText type='bodySmall' style={[styles.ampmText, { color: ampm === 'PM' ? themeColors.background : themeColors.text }]}>
                            PM
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Calculate duration for display
    const getDurationDisplay = () => {
        try {
            const { duration } = validateAndCalculateDuration();
            const hours = Math.floor(duration / 60);
            const minutes = duration % 60;
            return `${hours}h ${minutes}m`;
        } catch {
            return '';
        }
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose} style={Platform.OS === 'ios' ? { height: '75%' } : undefined}>
            <View style={styles.container}>
                {isSuccess ? (
                    renderSuccessAnimation()
                ) : (
                    <>
                        <ThemedView style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
                            <IconButton
                                onPress={handleClose}
                                iconName='close'
                                iconSize={20}
                                size={21}
                                style={styles.headerButton}
                                addBorder={false}
                                disabled={isSubmitting || isDeleting}
                            />

                            <ThemedText type='title'>{isEditingMode ? 'Edit Sleep Time' : 'Log Sleep'}</ThemedText>

                            <View style={styles.headerRight}>
                                {isEditingMode && onDelete && (
                                    <>
                                        {isDeleting ? (
                                            <ActivityIndicator size='small' style={styles.deleteButton} color={themeColors.subText} />
                                        ) : (
                                            <IconButton
                                                onPress={handleDelete}
                                                iconName='trash'
                                                iconSize={18}
                                                size={20}
                                                style={styles.deleteButton}
                                                addBorder={false}
                                                haptic='impactLight'
                                                disabled={isSubmitting || isDeleting}
                                            />
                                        )}
                                    </>
                                )}
                                {isSubmitting ? (
                                    <ActivityIndicator size='small' color={themeColors.subText} />
                                ) : (
                                    <IconButton
                                        onPress={handleSubmit}
                                        iconName='check'
                                        iconSize={22}
                                        size={25}
                                        iconColor={
                                            !isSubmitting && !isDeleting && sleepHour && wakeHour && (!isEditingMode || hasChanges())
                                                ? themeColors.text
                                                : lightenColor(themeColors.subText, 0.8)
                                        }
                                        addBorder={false}
                                        haptic='notificationSuccess'
                                        disabled={isSubmitting || isDeleting || !sleepHour || !wakeHour || (isEditingMode && !hasChanges)}
                                    />
                                )}
                            </View>
                        </ThemedView>

                        <View style={styles.mainContent}>
                            {!showCalendar ? (
                                <>
                                    <TouchableOpacity
                                        style={[
                                            styles.dateSelector,
                                            {
                                                backgroundColor: themeColors.background,
                                                borderColor: themeColors.systemBorderColor,
                                                opacity: isEditing ? 0.5 : 1,
                                            },
                                        ]}
                                        onPress={() => !isEditing && showCalendarView()}
                                        disabled={isEditing || isSubmitting || isDeleting}
                                    >
                                        <ThemedText type='body'>{format(selectedDate, 'dd/MM/yyyy')}</ThemedText>
                                        {!isEditing && (
                                            <Icon
                                                name='chevron-down'
                                                color={isSubmitting || isDeleting ? themeColors.text : themeColors.text}
                                                size={16}
                                                style={{ marginLeft: Spaces.XS }}
                                            />
                                        )}
                                    </TouchableOpacity>

                                    <View style={styles.inputContainer}>
                                        <View style={styles.timeInputContainer}>
                                            {renderTimeInput(
                                                'Sleep Time',
                                                sleepHour,
                                                setSleepHour,
                                                sleepMinute,
                                                setSleepMinute,
                                                sleepAmPm,
                                                setSleepAmPm,
                                                sleepHourInputRef,
                                            )}

                                            {renderTimeInput('Wake Time', wakeHour, setWakeHour, wakeMinute, setWakeMinute, wakeAmPm, setWakeAmPm)}
                                        </View>

                                        {getDurationDisplay() && (
                                            <View style={styles.durationDisplay}>
                                                <ThemedText type='caption' style={styles.durationLabel}>
                                                    Total Sleep:
                                                </ThemedText>
                                                <ThemedText type='body' style={styles.durationValue}>
                                                    {getDurationDisplay()}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>
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
                            {error && (
                                <ThemedText type='bodySmall' style={[styles.errorText, { color: themeColors.red }]}>
                                    {error}
                                </ThemedText>
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
    deleteButton: {
        marginRight: Spaces.SM + Spaces.XS,
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
        marginTop: Spaces.SM,
    },
    inputLabel: {},
    timeInputContainer: {
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.MD,
    },
    timeInputSection: {
        marginBottom: Spaces.MD,
    },
    timeTitle: {
        textAlign: 'center',
        opacity: 0.8,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spaces.SM,
    },
    timeDigitInput: {
        width: 50,
        height: 40,
        borderWidth: 1,
        borderRadius: Spaces.SM,
        textAlign: 'center',
        paddingVertical: Spaces.SM,
    },
    timeSeparator: {},
    ampmContainer: {
        flexDirection: 'row',
        gap: 4,
        marginLeft: Spaces.SM,
    },
    ampmButton: {
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
        borderRadius: Spaces.XS,
        borderWidth: 1,
        minWidth: 40,
        alignItems: 'center',
    },
    ampmButtonActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    ampmText: {
        fontSize: 12,
        fontWeight: '600',
    },
    durationDisplay: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        marginHorizontal: Spaces.MD,
        borderRadius: Spaces.SM,
        gap: Spaces.SM,
    },
    durationLabel: {
        opacity: 0.7,
    },
    durationValue: {
        fontWeight: '600',
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
        justifyContent: 'space-between',
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
