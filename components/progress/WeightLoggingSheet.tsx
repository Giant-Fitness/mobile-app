// components/progress/WeightLoggingSheet.tsx

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
import { UserWeightMeasurement } from '@/types';
import { Sizes } from '@/constants/Sizes';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { formatWeightForDisplay, parseWeightForStorage } from '@/utils/unitConversion';
import { IconButton } from '../buttons/IconButton';

interface WeightLoggingSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (weight: number, date: Date) => Promise<void>;
    onDelete?: (timestamp: string) => Promise<void>;
    initialWeight?: number;
    initialDate?: Date;
    isEditing?: boolean;
    isLoading?: boolean;
    getExistingData?: (date: Date) => UserWeightMeasurement | undefined;
}

export const WeightLoggingSheet: React.FC<WeightLoggingSheetProps> = ({
    visible,
    onClose,
    onSubmit,
    onDelete,
    initialWeight,
    initialDate,
    isEditing = false,
    getExistingData,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [weight, setWeight] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(isEditing);
    const [originalWeight, setOriginalWeight] = useState<number | undefined>(undefined);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const weightInputRef = useRef<TextInput>(null);
    const bodyWeightPreference = useSelector((state: RootState) => (state.user.userAppSettings?.UnitsOfMeasurement?.BodyWeightUnits as 'kgs' | 'lbs') || 'kgs');

    useEffect(() => {
        if (visible) {
            setIsSuccess(false);
            const today = new Date();
            const existingData = getExistingData?.(initialDate || today);

            if (existingData) {
                // existingData.Weight is always in kg
                const displayWeight = formatWeightForDisplay(existingData.Weight, bodyWeightPreference).split(' ')[0]; // Remove the unit suffix

                setWeight(displayWeight);
                setOriginalWeight(parseFloat(displayWeight));
                setSelectedDate(new Date(existingData.MeasurementTimestamp));
                setIsEditingMode(true);
            } else {
                setOriginalWeight(undefined);
                // initialWeight is assumed to be in kg
                const displayWeight = initialWeight ? formatWeightForDisplay(initialWeight, bodyWeightPreference).split(' ')[0] : '';
                setWeight(displayWeight);
                setSelectedDate(initialDate || today);
                setIsEditingMode(false);
            }
            setDisplayMonth(initialDate || today);

            setTimeout(() => {
                weightInputRef.current?.focus();
            }, 100);
        }
    }, [visible, initialWeight, initialDate, getExistingData, bodyWeightPreference]);

    useEffect(() => {
        if (visible && !isEditing) {
            const existingData = getExistingData?.(selectedDate);
            if (existingData) {
                // existingData.Weight is in kg
                const displayWeight = formatWeightForDisplay(existingData.Weight, bodyWeightPreference).split(' ')[0]; // Remove the unit suffix

                setWeight(displayWeight);
                setOriginalWeight(parseFloat(displayWeight));
                setIsEditingMode(true);
            } else {
                // initialWeight is in kg
                const displayWeight = initialWeight ? formatWeightForDisplay(initialWeight, bodyWeightPreference).split(' ')[0] : '';
                setWeight(displayWeight);
                setOriginalWeight(undefined);
                setIsEditingMode(false);
            }
        }
    }, [selectedDate, getExistingData, visible, isEditing, initialWeight, bodyWeightPreference]);

    const handleClose = () => {
        if (isSuccess) {
            return;
        }

        Keyboard.dismiss();
        onClose();
        setWeight('');
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
            weightInputRef.current?.focus();
        }, 100);
    };

    // for every new entry it takes in the time as 12am, else it preserves the original timestamp
    const handleSubmit = async () => {
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0) {
            setError('Please enter a valid weight');
            weightInputRef.current?.focus();
            return;
        }
        setError('');

        try {
            setIsSubmitting(true);

            const weightInKg = parseWeightForStorage(weightNum, bodyWeightPreference);

            let finalTimestamp;
            const localSelectedDate = new Date(selectedDate);

            if (isEditingMode && originalWeight !== undefined) {
                finalTimestamp = new Date(selectedDate.getTime());
            } else {
                localSelectedDate.setHours(0, 0, 0, 0);

                const utcMidnight = new Date(Date.UTC(localSelectedDate.getFullYear(), localSelectedDate.getMonth(), localSelectedDate.getDate(), 0, 0, 0));

                finalTimestamp = utcMidnight;
            }

            await onSubmit(weightInKg, finalTimestamp);
            setSuccessMessage(isEditingMode ? 'Weight updated' : 'Weight logged');
            setIsSuccess(true);
            await new Promise<void>((resolve) => setTimeout(resolve, 1600));
            onClose();
        } catch (err) {
            console.log(err);
            setError('Failed to save weight measurement');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Modify your render logic
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
                                iconSize={20}
                                size={21}
                                style={styles.headerButton}
                                addBorder={false}
                                disabled={isSubmitting || isDeleting}
                            />

                            <ThemedText type='title'>{isEditingMode ? 'Edit Weight' : 'Log Weight'}</ThemedText>

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
                                            !isSubmitting &&
                                            !isDeleting &&
                                            !isNaN(parseFloat(weight)) &&
                                            parseFloat(weight) !== 0 &&
                                            (!isEditingMode || originalWeight !== parseFloat(weight))
                                                ? themeColors.text
                                                : lightenColor(themeColors.subText, 0.8)
                                        }
                                        addBorder={false}
                                        haptic='notificationSuccess'
                                        disabled={
                                            isSubmitting ||
                                            isDeleting ||
                                            isNaN(parseFloat(weight)) ||
                                            parseFloat(weight) === 0 ||
                                            (isEditingMode && originalWeight === parseFloat(weight))
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
                                                color={isSubmitting || isDeleting ? themeColors.text : themeColors.text}
                                                size={16}
                                                style={{ marginTop: 1, marginLeft: Spaces.XS }}
                                            />
                                        )}
                                    </TouchableOpacity>
                                    <View style={styles.inputContainer}>
                                        <ThemedText type='buttonSmall' style={styles.inputLabel}>
                                            Weight
                                        </ThemedText>
                                        <View style={[styles.inputWrapper, { backgroundColor: themeColors.background }]}>
                                            <TextInput
                                                ref={weightInputRef}
                                                style={[
                                                    styles.input,
                                                    {
                                                        color: themeColors.text,
                                                        opacity: isSubmitting || isDeleting ? 0.5 : 1,
                                                    },
                                                ]}
                                                value={weight}
                                                onChangeText={setWeight}
                                                keyboardType='numeric'
                                                placeholder='0.0'
                                                placeholderTextColor={themeColors.subText}
                                                editable={!isSubmitting && !isDeleting}
                                            />
                                            <ThemedText type='bodySmall' style={[styles.unit, { opacity: isSubmitting || isDeleting ? 0.5 : 0.7 }]}>
                                                {bodyWeightPreference === 'lbs' ? ' lbs' : ' kgs'}
                                            </ThemedText>
                                        </View>
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
        paddingVertical: Spaces.SM,
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
