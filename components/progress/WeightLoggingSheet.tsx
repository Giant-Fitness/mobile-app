// components/progress/WeightLoggingSheet.tsx

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Platform, ActivityIndicator, Keyboard } from 'react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Icon } from '@/components/base/Icon';
import { TextButton } from '@/components/buttons/TextButton';
import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth, format } from 'date-fns';

interface WeightLoggingSheetProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (weight: number, date: Date) => Promise<void>;
    onDelete?: (timestamp: string) => Promise<void>;
    initialWeight?: number;
    initialDate?: Date;
    isEditing?: boolean;
    isLoading?: boolean;
}

export const WeightLoggingSheet: React.FC<WeightLoggingSheetProps> = ({
    visible,
    onClose,
    onSubmit,
    onDelete,
    initialWeight,
    initialDate,
    isEditing = false,
    isLoading = false,
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

    const weightInputRef = useRef<TextInput>(null);

    const resetSheet = () => {
        setWeight('');
        setSelectedDate(new Date());
        setDisplayMonth(new Date());
        setShowCalendar(false);
        setError('');
        setIsSubmitting(false);
        setIsDeleting(false);
        Keyboard.dismiss();
    };

    useEffect(() => {
        if (visible) {
            if (initialWeight) {
                setWeight(initialWeight.toString());
            } else {
                setWeight('');
            }
            if (initialDate) {
                setSelectedDate(initialDate);
                setDisplayMonth(initialDate);
            } else {
                setSelectedDate(new Date());
                setDisplayMonth(new Date());
            }
            setError('');
            setShowCalendar(false);
            setTimeout(() => {
                weightInputRef.current?.focus();
            }, 100);
        }
    }, [visible, initialWeight, initialDate]);

    const handleClose = () => {
        onClose();
        resetSheet();
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

    const handleSubmit = async () => {
        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0) {
            setError('Please enter a valid weight');
            weightInputRef.current?.focus();
            return;
        }
        setError('');

        setIsSubmitting(true);
        try {
            await onSubmit(weightNum, selectedDate);
            handleClose();
        } catch (err) {
            setError('Failed to save weight measurement');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!initialDate || !onDelete) return;

        setIsDeleting(true);
        try {
            await onDelete(initialDate.toISOString());
            handleClose();
        } catch (err) {
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

    const generateCalendarDays = (date: Date): Date[] => {
        const start = startOfWeek(startOfMonth(date));
        const end = endOfWeek(endOfMonth(date));

        const days: Date[] = [];
        let day = start;

        while (day <= end) {
            days.push(day);
            day = addDays(day, 1);
        }

        return days;
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose} style={Platform.OS === 'ios' ? { height: '62%' } : undefined}>
            <View style={styles.container}>
                {/* Header */}
                <ThemedView style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
                    <TouchableOpacity onPress={handleClose} style={styles.headerButton} disabled={isSubmitting || isDeleting}>
                        <Icon name='close' size={20} color={themeColors.text} />
                    </TouchableOpacity>

                    <ThemedText type='title'>{isEditing ? 'Edit Weight' : 'Log Weight'}</ThemedText>

                    <View style={styles.headerRight}>
                        {isEditing && onDelete && (
                            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton} disabled={isSubmitting || isDeleting}>
                                {isDeleting ? (
                                    <ActivityIndicator size='small' color={themeColors.subText} />
                                ) : (
                                    <Icon name='trash' color={isSubmitting ? themeColors.subText : themeColors.subText} size={18} />
                                )}
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting || isDeleting}>
                            {isSubmitting ? (
                                <ActivityIndicator size='small' color={themeColors.text} />
                            ) : (
                                <Icon name='check' color={isSubmitting || isDeleting ? themeColors.subText : themeColors.text} size={24} />
                            )}
                        </TouchableOpacity>
                    </View>
                </ThemedView>

                {error && (
                    <ThemedText type='bodySmall' style={[styles.errorText, { color: themeColors.red }]}>
                        {error}
                    </ThemedText>
                )}

                {/* Date Selection */}
                {!showCalendar ? (
                    <>
                        <TouchableOpacity
                            style={styles.dateSelector}
                            onPress={() => !isEditing && showCalendarView()}
                            disabled={isEditing || isSubmitting || isDeleting}
                        >
                            <ThemedText type='buttonMedium' style={{ opacity: isEditing ? 0.5 : 1 }}>
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

                        {/* Weight Input */}
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
                                    kgs
                                </ThemedText>
                            </View>
                        </View>
                    </>
                ) : (
                    <View style={styles.calendarContainer}>
                        <View style={styles.calendarHeader}>
                            <ThemedText type='buttonMedium'>{format(displayMonth, 'MMMM yyyy')}</ThemedText>
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
                            {generateCalendarDays(displayMonth).map((date, index) => {
                                const isCurrentMonth = isSameMonth(date, displayMonth);
                                const isToday = isSameDay(date, new Date());
                                const isSelected = isSameDay(date, selectedDate);
                                const isFutureDate = date > new Date();
                                const isDisabled = isFutureDate || !isCurrentMonth;

                                return (
                                    <TouchableOpacity
                                        key={index}
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
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
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
    calendar: {
        // Calendar styles
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        paddingVertical: Spaces.MD,
    },
    dayText: {
        textAlign: 'center',
    },
    today: {
        borderWidth: 1,
    },
    selectedDay: {},
    outsideMonth: {
        opacity: 0.4,
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
    calendarDay: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 2,
        borderRadius: 20,
    },
});
