// components/exercise/ExerciseLoggingSheet.tsx

import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, TextInput, Platform, ActivityIndicator, KeyboardAvoidingView, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import LottieView from 'lottie-react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { deleteExerciseLogAsync, saveExerciseProgressAsync } from '@/store/exerciseProgress/thunks';
import { RootState } from '@/store/store';
import { Exercise } from '@/types/programTypes';
import { isLongTermTrackedLift } from '@/store/exerciseProgress/utils';
import { lightenColor } from '@/utils/colorUtils';
import { ExerciseLog } from '@/types/exerciseProgressTypes';
import { AppDispatch } from '@/store/store';
import { Sizes } from '@/constants/Sizes';
import { TextButton } from '@/components/buttons/TextButton';
import { formatWeightForDisplay, parseWeightForStorage } from '@/utils/weightConversion';

interface ExerciseLoggingSheetProps {
    visible: boolean;
    onClose: () => void;
    exercise: Exercise;
    editDate?: string;
}

type Tab = 'log' | 'history';

interface SetInput {
    reps: string;
    weight: string;
}

export const ExerciseLoggingSheet: React.FC<ExerciseLoggingSheetProps> = ({ visible, onClose, exercise, editDate }) => {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const liftWeightPreference = useSelector((state: RootState) => state.user.userAppSettings?.UnitsOfMeasurement?.LiftWeightUnits || 'kgs');

    const [activeTab, setActiveTab] = useState<Tab>('log');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sets, setSets] = useState<SetInput[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [editingLog, setEditingLog] = useState<ExerciseLog | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState<{
        message: string;
        visible: boolean;
    } | null>(null);

    const { recentLogs, liftHistory } = useSelector((state: RootState) => state.exerciseProgress);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const loadSetsData = () => {
        // If editing a past log
        if (editingLog) {
            return editingLog.Sets.map((set) => ({
                reps: set.Reps.toString(),
                weight:
                    liftWeightPreference === 'lbs'
                        ? formatWeightForDisplay(set.Weight, 'lbs').split(' ')[0] // Extract numeric value only
                        : formatWeightForDisplay(set.Weight, 'kgs').split(' ')[0],
            }));
        }

        // Check for today's log
        const today = format(new Date(), 'yyyy-MM-dd');
        const exerciseLogId = `${exercise.ExerciseId}#${today}`;

        // Get log from appropriate source based on exercise type
        const isTracked = isLongTermTrackedLift(exercise.ExerciseId);
        const todaysLog = isTracked ? liftHistory[exercise.ExerciseId]?.[exerciseLogId] : recentLogs[exercise.ExerciseId]?.[exerciseLogId];

        // Create array of length exercise.Sets filled with empty sets
        const emptySets = Array(exercise.Sets)
            .fill(null)
            .map(() => ({
                reps: '',
                weight: '',
            }));

        if (todaysLog) {
            // Merge today's logged sets with empty sets
            return emptySets.map((emptySet, index) => {
                if (index < todaysLog.Sets.length) {
                    return {
                        reps: todaysLog.Sets[index].Reps.toString(),
                        weight:
                            liftWeightPreference === 'lbs'
                                ? formatWeightForDisplay(todaysLog.Sets[index].Weight, 'lbs').split(' ')[0]
                                : formatWeightForDisplay(todaysLog.Sets[index].Weight, 'kgs').split(' ')[0],
                    };
                }
                return emptySet;
            });
        }

        return emptySets;
    };

    const focusFirstEmptySet = () => {
        const firstEmptyIndex = sets.findIndex((set) => !set.reps);
        if (firstEmptyIndex >= 0) {
            setTimeout(() => {
                inputRefs.current[firstEmptyIndex]?.focus();
                scrollToInput(firstEmptyIndex);
            }, 100);
        }
    };

    const scrollToInput = (index: number) => {
        scrollViewRef.current?.scrollTo({
            y: index * 80, // Approximate height of a row
            animated: true,
        });
    };

    useEffect(() => {
        if (visible) {
            setActiveTab('log');
            setSelectedDate(editDate ? new Date(editDate) : new Date());
            setSets(loadSetsData());
            setError('');
            setEditingLog(null);
            setShowSuccess(null);
        }
    }, [visible, exercise.ExerciseId, editDate]);

    // Add a separate effect for keyboard/focus handling
    useEffect(() => {
        if (visible && activeTab === 'log') {
            // Ensure keyboard shows up and first empty input is focused
            const timeoutId = setTimeout(() => {
                const firstEmptyIndex = sets.findIndex((set) => !set.reps);
                if (firstEmptyIndex >= 0) {
                    inputRefs.current[firstEmptyIndex]?.focus();
                    scrollViewRef.current?.scrollTo({
                        y: firstEmptyIndex * 80,
                        animated: true,
                    });
                } else {
                    // If all sets have values, focus the first set
                    inputRefs.current[0]?.focus();
                }
            }, 300);

            return () => clearTimeout(timeoutId);
        }
    }, [visible, activeTab, sets.length]);

    const handleSetChange = (index: number, field: 'reps' | 'weight', value: string) => {
        const newSets = [...sets];
        newSets[index][field] = value;
        setSets(newSets);
    };

    const canSave = () => {
        const validSets = sets.filter((set) => parseInt(set.reps) > 0 && (parseInt(set.weight) >= 0 || set.weight === ''));
        return validSets.length > 0;
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
        setActiveTab('log');
        setSets([]);
        setError('');
        setEditingLog(null);
        setShowSuccess(null);
    };

    const handleBackFromEdit = () => {
        setEditingLog(null);
        setActiveTab('history');
        // Reset sets data to today's data or blank state
        setSets(loadSetsData());
        setSelectedDate(new Date());
    };

    const renderSuccessAnimation = () => {
        if (!showSuccess?.visible) return null;

        return (
            <View style={styles.successContainer}>
                <View style={styles.animationContainer}>
                    <LottieView source={require('@/assets/animations/check.json')} autoPlay loop={false} style={styles.animation} />
                </View>
                <ThemedText type='title' style={styles.successMessage}>
                    {showSuccess.message}
                </ThemedText>
            </View>
        );
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            setError('');
            const weightUnit: 'kgs' | 'lbs' = liftWeightPreference === 'lbs' ? 'lbs' : 'kgs';
            const validSets = sets
                .filter((set) => parseInt(set.reps) > 0)
                .map((set, index) => ({
                    SetNumber: index + 1,
                    Reps: parseInt(set.reps),
                    Weight: parseWeightForStorage(set.weight, weightUnit),
                    Timestamp: format(new Date(), 'HH:mm:ss'),
                }));

            if (validSets.length === 0) {
                setError('Please enter at least one valid set');
                return;
            }

            await dispatch(
                saveExerciseProgressAsync({
                    exerciseId: exercise.ExerciseId,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    sets: validSets,
                }),
            ).unwrap();

            setShowSuccess({
                message: editingLog ? 'Exercise log updated' : 'Exercise logged',
                visible: true,
            });

            setTimeout(() => {
                handleClose();
            }, 1500);
        } catch (err: any) {
            const serverErrorMessage = err?.errorMessage || 'Failed to save exercise progress';
            setError(serverErrorMessage);
            setActiveTab('log');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLog = async () => {
        if (!editingLog) return;

        try {
            setIsSubmitting(true);

            // Check if we're deleting today's log
            const isTodayLog = format(new Date(editingLog.Date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

            await dispatch(
                deleteExerciseLogAsync({
                    exerciseId: exercise.ExerciseId,
                    date: format(new Date(editingLog.Date), 'yyyy-MM-dd'),
                }),
            ).unwrap();

            setShowSuccess({
                message: 'Exercise log deleted',
                visible: true,
            });

            setTimeout(() => {
                setShowSuccess(null);
                setShowDeleteConfirm(false);
                setEditingLog(null);

                if (isTodayLog) {
                    // If deleting today's log, reset to empty sets
                    const emptySets = Array(exercise.Sets)
                        .fill(null)
                        .map(() => ({
                            reps: '',
                            weight: '',
                        }));
                    setSets(emptySets);
                    setActiveTab('log');
                } else {
                    // If deleting a past log, load today's data (if any) or default sets
                    setSets(loadSetsData());
                    setActiveTab('history');
                }
            }, 1500);
        } catch (err) {
            setError('Failed to delete log');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderHeader = () => (
        <ThemedView style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
            {editingLog ? (
                <TouchableOpacity onPress={handleBackFromEdit} style={styles.headerButton}>
                    <Icon name='chevron-back' size={20} color={themeColors.text} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                    <Icon name='close' size={20} color={themeColors.text} />
                </TouchableOpacity>
            )}

            <ThemedText type='title'>{editingLog ? `Edit ${format(new Date(editingLog.Date), 'MMM d')} Log` : exercise.ExerciseName}</ThemedText>

            <TouchableOpacity onPress={handleSave} disabled={!canSave() || isSubmitting} style={styles.headerButton}>
                {isSubmitting ? (
                    <ActivityIndicator size='small' color={themeColors.text} />
                ) : (
                    <Icon name='check' size={24} color={canSave() ? themeColors.text : lightenColor(themeColors.subText, 0.8)} />
                )}
            </TouchableOpacity>
        </ThemedView>
    );

    const renderTabs = () => (
        <View style={styles.tabs}>
            <TouchableOpacity
                activeOpacity={1}
                style={[styles.tab, activeTab === 'log' && { borderBottomColor: themeColors.text }]}
                onPress={() => {
                    if (!editingLog) {
                        setActiveTab('log');
                        // Reset to today's data or blank state when switching to log tab
                        setSets(loadSetsData());
                        setSelectedDate(new Date());
                        focusFirstEmptySet();
                        setError(''); // Clear error when switching to log tab
                    }
                }}
            >
                <ThemedText type='button'>Log</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
                activeOpacity={1}
                style={[styles.tab, activeTab === 'history' && { borderBottomColor: themeColors.text }]}
                onPress={() => {
                    if (!editingLog) {
                        setActiveTab('history');
                        Keyboard.dismiss();
                        setError(''); // Clear error when switching to history tab
                    }
                }}
            >
                <ThemedText type='button'>History</ThemedText>
            </TouchableOpacity>
        </View>
    );

    const renderSetRow = (set: SetInput, index: number) => (
        <View key={index} style={styles.setRow}>
            <ThemedText type='buttonSmall' style={styles.setNumber}>
                #{index + 1}
            </ThemedText>
            <View style={styles.setInputContainer}>
                <TextInput
                    ref={(el) => (inputRefs.current[index] = el)}
                    style={[styles.input, { color: themeColors.text }]}
                    value={set.weight}
                    onChangeText={(value) => handleSetChange(index, 'weight', value)}
                    keyboardType='numeric'
                    placeholder='0'
                    placeholderTextColor={themeColors.subText}
                    onFocus={() => scrollToInput(index)}
                    showSoftInputOnFocus={true}
                />
                <ThemedText type='bodySmall' style={styles.inputLabel}>
                    {liftWeightPreference === 'lbs' ? 'lbs' : 'kgs'}
                </ThemedText>
            </View>
            <View style={styles.setInputContainer}>
                <TextInput
                    style={[styles.input, { color: themeColors.text }]}
                    value={set.reps}
                    onChangeText={(value) => handleSetChange(index, 'reps', value)}
                    keyboardType='numeric'
                    placeholder='0'
                    placeholderTextColor={themeColors.subText}
                    onFocus={() => scrollToInput(index)}
                    showSoftInputOnFocus={true}
                />
                <ThemedText type='bodySmall' style={styles.inputLabel}>
                    {`${exercise.RepsLower}-${exercise.RepsUpper} reps`}
                </ThemedText>
            </View>
        </View>
    );

    const renderDeleteConfirmation = () => {
        if (!editingLog) return null;

        return (
            <View style={styles.deleteConfirmContainer}>
                <ThemedText type='body' style={styles.deleteConfirmText}>
                    Are you sure you want to delete this log from {format(new Date(editingLog.Date), 'MMMM d')}?
                </ThemedText>
                <View style={styles.deleteConfirmButtons}>
                    <TextButton
                        text='No, Keep'
                        onPress={() => setShowDeleteConfirm(false)}
                        style={[styles.cancelDeleteButton, { borderColor: themeColors.text }]}
                        textStyle={{ color: themeColors.text }}
                        textType='buttonSmall'
                    />
                    <TextButton
                        text='Yes, Delete'
                        onPress={handleDeleteLog}
                        style={[styles.confirmDeleteButton, { borderColor: themeColors.red }]}
                        textStyle={{ color: themeColors.red }}
                        textType='buttonSmall'
                    />
                </View>
            </View>
        );
    };

    const renderLogTab = () => (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.logContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            {showSuccess?.visible ? (
                renderSuccessAnimation()
            ) : (
                <>
                    <ThemedText type='body' style={styles.dateText}>
                        {format(selectedDate, 'dd/MM/yyyy')}
                    </ThemedText>

                    <ScrollView ref={scrollViewRef} keyboardShouldPersistTaps='always' keyboardDismissMode='none' contentContainerStyle={styles.scrollContent}>
                        {showDeleteConfirm && editingLog ? (
                            renderDeleteConfirmation()
                        ) : (
                            <>
                                <View style={styles.setsContainer}>{sets.map((set, index) => renderSetRow(set, index))}</View>

                                {editingLog && (
                                    <TextButton
                                        text='Delete Log'
                                        onPress={() => setShowDeleteConfirm(true)}
                                        style={[styles.deleteButton, { borderColor: themeColors.red }]}
                                        textStyle={{ color: themeColors.red }}
                                        textType='bodyMedium'
                                    />
                                )}
                            </>
                        )}
                    </ScrollView>

                    {error && (
                        <ThemedText type='bodySmall' style={[styles.errorText, { color: themeColors.red }]}>
                            {error}
                        </ThemedText>
                    )}
                </>
            )}
        </KeyboardAvoidingView>
    );

    const renderHistoryItem = (log: ExerciseLog | null) => {
        if (!log) return null;

        try {
            const date = new Date(log.Date);
            const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });
            const month = date.toLocaleDateString('default', { month: 'short' });
            const day = date.getDate();
            const weightUnit: 'kgs' | 'lbs' = liftWeightPreference === 'lbs' ? 'lbs' : 'kgs';
            const setsDisplay = `${log.Sets.length} sets - ${log.Sets.map((set) => formatWeightForDisplay(set.Weight, weightUnit) + ` × ${set.Reps}`).join(
                ', ',
            )}`;

            return (
                <TouchableOpacity
                    style={[styles.historyTile, { backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.6) }]}
                    onPress={() => {
                        setEditingLog(log);
                        setActiveTab('log');
                        setSelectedDate(date);
                        setSets(
                            log.Sets.map((set) => ({
                                reps: set.Reps.toString(),
                                weight:
                                    liftWeightPreference === 'lbs'
                                        ? formatWeightForDisplay(set.Weight, 'lbs').split(' ')[0]
                                        : formatWeightForDisplay(set.Weight, 'kgs').split(' ')[0],
                            })),
                        );
                    }}
                    activeOpacity={0.8}
                >
                    <View style={styles.tileLeft}>
                        <ThemedText type='caption' style={styles.historyDate}>
                            {dayOfWeek}, {`${month} ${day}`}
                        </ThemedText>
                        <ThemedText type='body' style={styles.historyDetails}>
                            {setsDisplay}
                        </ThemedText>
                    </View>
                    <View style={styles.tileRight}>
                        <Icon name='chevron-forward' size={16} color={themeColors.subText} />
                    </View>
                </TouchableOpacity>
            );
        } catch (err) {
            console.error('Error rendering history item:', err);
            return null;
        }
    };

    const renderHistoryTab = () => {
        const isTrackedLift = isLongTermTrackedLift(exercise.ExerciseId);

        // Get logs from appropriate source based on exercise type
        let logs: ExerciseLog[] = [];

        if (isTrackedLift && liftHistory[exercise.ExerciseId]) {
            // For tracked lifts, get values from nested structure
            logs = Object.values(liftHistory[exercise.ExerciseId]);
        } else if (!isTrackedLift && recentLogs[exercise.ExerciseId]) {
            // For non-tracked lifts, get values from nested structure
            logs = Object.values(recentLogs[exercise.ExerciseId]);
        }

        // Sort logs by date, then by updatedAt for same dates
        const sortedLogs = logs
            .sort((a, b) => {
                const dateCompare = new Date(b.Date).getTime() - new Date(a.Date).getTime();
                if (dateCompare === 0) {
                    return new Date(b.UpdatedAt).getTime() - new Date(a.UpdatedAt).getTime();
                }
                return dateCompare;
            })
            .slice(0, 10);

        if (sortedLogs.length === 0) {
            return (
                <View style={styles.emptyHistory}>
                    <ThemedText type='body' style={{ opacity: 0.7 }}>
                        No history available
                    </ThemedText>
                </View>
            );
        }

        return (
            <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyContent}>
                {sortedLogs.map((log) => (
                    <React.Fragment key={`${log.Date}-${log.CreatedAt}`}>{renderHistoryItem(log)}</React.Fragment>
                ))}
            </ScrollView>
        );
    };

    return (
        <>
            <BottomSheet
                visible={visible}
                onClose={handleClose}
                style={{ height: '100%', maxHeight: '90%' }}
                disableBackdropPress={activeTab === 'log'} // Prevent accidental dismissal while logging
            >
                {renderHeader()}
                {!editingLog && renderTabs()}
                {activeTab === 'log' ? renderLogTab() : renderHistoryTab()}
            </BottomSheet>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerButton: {
        minWidth: 40,
        alignItems: 'center',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: Spaces.MD,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.SM,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    dateText: {
        textAlign: 'center',
        marginTop: Spaces.LG,
        paddingBottom: Spaces.SM,
    },
    instructions: {
        padding: Spaces.MD,
        opacity: 0.8,
    },
    logContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: Spaces.MD,
        paddingBottom: Platform.OS === 'ios' ? 120 : 180, // Extra padding for keyboard
    },
    setsContainer: {
        marginTop: Spaces.XS,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spaces.MD,
    },
    setNumber: {
        width: 30,
        opacity: 0.7,
        paddingVertical: Spaces.SM,
    },
    setInputContainer: {
        flex: 1,
        marginHorizontal: Spaces.SM,
    },
    input: {
        height: 40,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
        paddingHorizontal: Spaces.MD,
        textAlign: 'center',
    },
    inputLabel: {
        textAlign: 'center',
        marginTop: 4,
        opacity: 0.7,
    },
    errorText: {
        textAlign: 'center',
        marginTop: Spaces.MD,
        paddingHorizontal: Spaces.MD,
    },
    historyContainer: {
        flex: 1,
    },
    historyContent: {
        padding: Spaces.MD,
    },
    historyTile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        marginVertical: Spaces.XS,
        borderRadius: Spaces.SM,
    },
    tileLeft: {
        flex: 1,
    },
    tileRight: {
        marginLeft: Spaces.MD,
    },
    historyDate: {
        opacity: 0.7,
    },
    historyDetails: {
        marginTop: Spaces.XS,
        fontWeight: '500',
    },
    emptyHistory: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spaces.XL,
        paddingTop: Sizes.bottomSpaceLarge,
    },
    deleteButton: {
        marginTop: Spaces.LG,
        marginBottom: Spaces.XL,
        alignSelf: 'center',
        borderRadius: Spaces.XS,
        width: '60%',
    },
    deleteConfirmContainer: {
        padding: Spaces.LG,
        alignItems: 'center',
        marginTop: Spaces.XXL,
    },
    deleteConfirmText: {
        textAlign: 'center',
        marginBottom: Spaces.LG,
    },
    deleteConfirmButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        gap: Spaces.MD,
    },
    cancelDeleteButton: {
        flex: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.SM,
        borderColor: 'transparent',
    },
    confirmDeleteButton: {
        flex: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.SM,
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: Spaces.XXL,
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

export default ExerciseLoggingSheet;
