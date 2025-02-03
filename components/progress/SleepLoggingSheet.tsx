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
import { UserSleepMeasurement } from '@/types';

interface SleepLoggingSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (sleep: number, date: Date) => Promise<void>;
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

    const [sleep, setSleep] = useState<string>(''); // this is for the hours
    const [minutes, setMinutes] = useState<string>('0');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditingMode, setIsEditingMode] = useState(isEditing);
    const [originalSleep, setOriginalSleep] = useState<number | undefined>(undefined);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const sleepInputRef = useRef<TextInput>(null);

    useEffect(() => {
        if (visible) {
            setIsSuccess(false);

            const today = new Date();
            const existingData = getExistingData?.(initialDate || today);

            if (existingData) {
                const convertedSleep = existingData.DurationInMinutes;
                const hours = Math.floor(convertedSleep / 60);
                const mins = convertedSleep % 60;

                setSleep(hours?.toString());
                setMinutes(mins?.toString());
                setOriginalSleep(convertedSleep);
                setSelectedDate(new Date(existingData.MeasurementTimestamp));
                setIsEditingMode(true);
            } else {
                setOriginalSleep(undefined);
                setSleep(initialSleep ? Math.floor(initialSleep / 60).toString() : '');
                setMinutes(initialSleep ? (initialSleep % 60).toString() : '0');
                setSelectedDate(initialDate || today);
                setIsEditingMode(false);
            }
            setDisplayMonth(initialDate || today);

            setTimeout(() => {
                sleepInputRef.current?.focus();
            }, 300);
        }
    }, [visible, initialSleep, initialDate, getExistingData]);

    useEffect(() => {
        if (visible && !isEditing) {
            const existingData = getExistingData?.(selectedDate);
            if (existingData) {
                const convertedSleep = existingData.DurationInMinutes;
                const hours = Math.floor(convertedSleep / 60);
                const mins = convertedSleep % 60;
                setSleep(hours?.toString());
                setMinutes(mins?.toString());
                setOriginalSleep(convertedSleep);
                setIsEditingMode(true);
            } else {
                setSleep(initialSleep ? Math.floor(initialSleep / 60).toString() : '');
                setMinutes(initialSleep ? (initialSleep % 60).toString() : '0');
                setOriginalSleep(undefined);
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
        setSleep('');
        setMinutes('0');
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
            sleepInputRef.current?.focus();
        }, 100);
    };

    const formatSleep = (hours: string | number, minutes: string | number): string => {
        const parsedHours = typeof hours === 'string' ? parseInt(hours, 10) : hours;
        const parsedMinutes = typeof minutes === 'string' ? parseInt(minutes, 10) : minutes;

        if (isNaN(parsedHours) || parsedHours < 0 || parsedMinutes < 0 || parsedMinutes >= 60) {
            // can do this for hours and minutes separately
            return '';
        }

        const totalMinutes = parsedHours * 60 + parsedMinutes;

        // Return as a string
        return totalMinutes.toString();
    };

    const handleSubmit = async () => {
        const hoursSlept = parseFloat(sleep);
        const minutesSlept = parseFloat(minutes);

        if (
            isNaN(hoursSlept) ||
            hoursSlept > 24 ||
            hoursSlept < 0 ||
            minutesSlept >= 60 ||
            minutesSlept < 0 ||
            isNaN(minutesSlept) ||
            (hoursSlept === 0 && minutesSlept === 0)
        ) {
            setError('Please enter a valid sleep time');
            sleepInputRef.current?.focus();
            return;
        }
        setError('');

        try {
            setIsSubmitting(true);
            const formattedSleep = Number(formatSleep(hoursSlept, minutesSlept));
            await onSubmit(formattedSleep, selectedDate);

            // Set states separately to ensure update
            setSuccessMessage(isEditingMode ? 'Sleep time updated' : 'Sleep logged');
            setIsSuccess(true);
            // Wait for animation then close
            await new Promise<void>((resolve) => setTimeout(resolve, 1600));
            onClose();
        } catch (err) {
            console.log(err);
            setError('Failed to save sleep time');
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
        if (!initialDate || !onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(initialDate.toISOString());
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
        <BottomSheet visible={visible} onClose={handleClose} style={Platform.OS === 'ios' ? { height: '62%' } : undefined}>
            <View style={styles.container}>
                {isSuccess ? (
                    renderSuccessAnimation()
                ) : (
                    <>
                        <ThemedView style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
                            <TouchableOpacity onPress={handleClose} style={styles.headerButton} disabled={isSubmitting || isDeleting}>
                                <Icon name='close' size={20} color={themeColors.text} />
                            </TouchableOpacity>

                            <ThemedText type='title'>{isEditingMode ? 'Edit Sleep Time' : 'Log Sleep'}</ThemedText>

                            <View style={styles.headerRight}>
                                {isEditingMode && onDelete && (
                                    <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} disabled={isSubmitting || isDeleting}>
                                        {isDeleting ? (
                                            <ActivityIndicator size='small' color={themeColors.subText} />
                                        ) : (
                                            <Icon name='trash' color={isSubmitting ? themeColors.subText : themeColors.subText} size={18} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={
                                        isSubmitting ||
                                        isDeleting ||
                                        isNaN(parseFloat(sleep)) ||
                                        parseFloat(sleep) === 0 ||
                                        (isEditingMode && originalSleep === parseFloat(sleep))
                                    }
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator size='small' color={themeColors.text} />
                                    ) : (
                                        <Icon
                                            name='check'
                                            size={24}
                                            color={
                                                !isSubmitting &&
                                                !isDeleting &&
                                                !isNaN(parseFloat(sleep)) &&
                                                parseFloat(sleep) !== 0 &&
                                                (!isEditingMode || originalSleep !== parseFloat(sleep))
                                                    ? themeColors.text
                                                    : lightenColor(themeColors.subText, 0.8)
                                            }
                                        />
                                    )}
                                </TouchableOpacity>
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
                                        <View style={[styles.inputWrapper, { backgroundColor: themeColors.background }]}>
                                            <TextInput
                                                ref={sleepInputRef}
                                                style={[
                                                    styles.input,
                                                    {
                                                        color: themeColors.text,
                                                        opacity: isSubmitting || isDeleting ? 0.5 : 1,
                                                    },
                                                ]}
                                                value={sleep}
                                                onChangeText={setSleep}
                                                keyboardType='numeric'
                                                placeholder='0'
                                                placeholderTextColor={themeColors.subText}
                                                editable={!isSubmitting && !isDeleting}
                                            />
                                            <ThemedText type='bodySmall' style={styles.unit}>
                                                Hours
                                            </ThemedText>
                                        </View>

                                        <View style={[styles.inputWrapper, { backgroundColor: themeColors.background, marginTop: Spaces.SM }]}>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    {
                                                        color: themeColors.text,
                                                        opacity: isSubmitting || isDeleting ? 0.5 : 1,
                                                    },
                                                ]}
                                                value={minutes}
                                                onChangeText={setMinutes}
                                                keyboardType='numeric'
                                                placeholder='0'
                                                placeholderTextColor={themeColors.subText}
                                                editable={!isSubmitting && !isDeleting}
                                                defaultValue='0'
                                            />
                                            <ThemedText type='bodySmall' style={styles.unit}>
                                                Mins
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.MD,
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
        flex: 1,
    },
    input: {
        flex: 1,
    },
    unit: {
        marginLeft: Spaces.SM,
        opacity: 0.4,
        width: 55,
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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});
