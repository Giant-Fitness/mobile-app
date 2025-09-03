// components/overlays/DatePickerBottomSheet.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { IconButton } from '@/components/buttons/IconButton';
import { TextButton } from '@/components/buttons/TextButton';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { lightenColor } from '@/utils/colorUtils';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    title?: string;
    maxDate?: Date;
    minDate?: Date;
    showConfirmButton?: boolean; // Option to show confirm button instead of auto-selecting
    isLoading?: boolean;
}

export const DatePickerBottomSheet: React.FC<DatePickerBottomSheetProps> = ({
    visible,
    onClose,
    selectedDate,
    onDateSelect,
    title = 'Select Date',
    maxDate,
    minDate,
    showConfirmButton = true, // default to true
    isLoading = false,
}) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const [tempDate, setTempDate] = useState<Date>(selectedDate);

    // Calculate default date restrictions (1 year past and future)
    const getDefaultMinDate = (): Date => {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return minDate && minDate > oneYearAgo ? minDate : oneYearAgo;
    };

    const getDefaultMaxDate = (): Date => {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        return maxDate && maxDate < oneYearFromNow ? maxDate : oneYearFromNow;
    };

    const effectiveMinDate = getDefaultMinDate();
    const effectiveMaxDate = getDefaultMaxDate();

    useEffect(() => {
        if (visible) {
            setTempDate(selectedDate);
        }
    }, [visible, selectedDate]);

    const handleClose = () => {
        onClose();
    };

    const handleDateChange = (event: any, date?: Date) => {
        if (date) {
            setTempDate(date);

            // If not showing confirm button, auto-select the date
            if (!showConfirmButton) {
                onDateSelect(date);
                onClose();
            }
        }
    };

    const handleConfirm = () => {
        onDateSelect(tempDate);
        onClose();
    };

    const goToToday = () => {
        const today = new Date();
        const isWithinRange = (!effectiveMinDate || today >= effectiveMinDate) && (!effectiveMaxDate || today <= effectiveMaxDate);

        if (isWithinRange) {
            setTempDate(today);
            if (!showConfirmButton) {
                onDateSelect(today);
                onClose();
            }
        }
    };

    const isTodayDisabled = (): boolean => {
        const today = new Date();
        if (effectiveMinDate && today < effectiveMinDate) return true;
        if (effectiveMaxDate && today > effectiveMaxDate) return true;
        return false;
    };

    const isTodaySelected = (): boolean => {
        const today = new Date();
        return tempDate.getFullYear() === today.getFullYear() && tempDate.getMonth() === today.getMonth() && tempDate.getDate() === today.getDate();
    };

    const hasDateChanged = (): boolean => {
        return (
            tempDate.getFullYear() !== selectedDate.getFullYear() ||
            tempDate.getMonth() !== selectedDate.getMonth() ||
            tempDate.getDate() !== selectedDate.getDate()
        );
    };

    return (
        <BottomSheet visible={visible} onClose={handleClose} keyboardAvoidingBehavior='none'>
            <View style={styles.container}>
                <ThemedView style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
                    <IconButton
                        onPress={handleClose}
                        iconName='close'
                        iconSize={18}
                        size={21}
                        style={styles.headerButton}
                        addBorder={false}
                        disabled={isLoading}
                    />

                    <ThemedText type='title'>{title}</ThemedText>

                    <View style={styles.headerRight}>
                        {showConfirmButton && (
                            <>
                                {isLoading ? (
                                    <ActivityIndicator size='small' color={themeColors.subText} />
                                ) : (
                                    <IconButton
                                        onPress={handleConfirm}
                                        iconName='check'
                                        iconSize={20}
                                        size={25}
                                        iconColor={!isLoading && hasDateChanged() ? themeColors.text : lightenColor(themeColors.subText, 0.8)}
                                        addBorder={false}
                                        haptic='notificationSuccess'
                                        disabled={isLoading || !hasDateChanged()}
                                    />
                                )}
                            </>
                        )}
                    </View>
                </ThemedView>

                <ThemedView style={styles.content}>
                    <DateTimePicker
                        value={tempDate}
                        mode='date'
                        display='spinner'
                        onChange={handleDateChange}
                        minimumDate={effectiveMinDate}
                        maximumDate={effectiveMaxDate}
                        style={[styles.datePicker, { opacity: isLoading ? 0.5 : 1 }]}
                        themeVariant={colorScheme}
                        textColor={themeColors.text}
                        locale='en-GB' // This will show dd/mm/yyyy format
                    />

                    {/* Today Button */}
                    <View style={styles.todayButtonContainer}>
                        <TextButton
                            text='Go to Today'
                            onPress={goToToday}
                            style={[
                                styles.todayButton,
                                {
                                    opacity: isTodayDisabled() || isTodaySelected() || isLoading ? 0.5 : 1,
                                },
                            ]}
                            textStyle={{
                                color: isTodayDisabled() || isTodaySelected() || isLoading ? themeColors.subText : themeColors.iconSelected,
                                fontWeight: isTodaySelected() ? '600' : 'normal',
                            }}
                            disabled={isTodayDisabled() || isTodaySelected() || isLoading}
                        />
                    </View>
                </ThemedView>
            </View>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
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
    content: {
        marginBottom: Spaces.XL,
    },
    datePicker: {
        width: '100%',
        backgroundColor: 'transparent',
        marginBottom: Spaces.LG,
    },
    todayButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: Spaces.LG,
    },
    todayButton: {
        borderWidth: 0,
        paddingHorizontal: Spaces.LG,
    },
});
