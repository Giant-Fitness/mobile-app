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
import { createExerciseSetModificationAsync, updateExerciseSetModificationAsync, deleteExerciseSetModificationAsync } from '@/store/user/thunks';
import { RootState } from '@/store/store';
import { Exercise } from '@/types/programTypes';
import { isLongTermTrackedLift } from '@/store/exerciseProgress/utils';
import { lightenColor } from '@/utils/colorUtils';
import { ExerciseLog } from '@/types/exerciseProgressTypes';
import { AppDispatch } from '@/store/store';
import { Sizes } from '@/constants/Sizes';
import { TextButton } from '@/components/buttons/TextButton';
import { formatWeightForDisplay, parseWeightForStorage } from '@/utils/unitConversion';

interface ExerciseLoggingSheetProps {
    visible: boolean;
    onClose: () => void;
    exercise: Exercise;
    editDate?: string;
    programId?: string;
}

type Tab = 'log' | 'history';

interface SetInput {
    reps: string;
    weight: string;
}

export const ExerciseLoggingSheet: React.FC<ExerciseLoggingSheetProps> = ({ visible, onClose, exercise, editDate, programId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const liftWeightPreference = useSelector((state: RootState) => state.user.userAppSettings?.UnitsOfMeasurement?.LiftWeightUnits || 'kgs');

    const [activeTab, setActiveTab] = useState<Tab>('log');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sets, setSets] = useState<SetInput[]>([]);
    const [extraSets, setExtraSets] = useState<SetInput[]>([]);
    const [initialSetsSnapshot, setInitialSetsSnapshot] = useState<SetInput[]>([]);
    const [initialExtraSetsSnapshot, setInitialExtraSetsSnapshot] = useState<SetInput[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [editingLog, setEditingLog] = useState<ExerciseLog | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState<{
        message: string;
        visible: boolean;
    } | null>(null);

    const { recentLogs, liftHistory } = useSelector((state: RootState) => state.exerciseProgress);
    const { userExerciseSetModifications } = useSelector((state: RootState) => state.user);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    // Find existing modification for this exercise
    const existingModification = React.useMemo(() => {
        if (!programId) return null;

        const today = format(new Date(), 'yyyy-MM-dd');
        return userExerciseSetModifications.find(
            (mod) => mod.ExerciseId === exercise.ExerciseId && mod.ProgramId === programId && mod.IsTemporary === true && mod.TemporaryDate === today,
        );
    }, [exercise.ExerciseId, programId, userExerciseSetModifications]);

    const loadSetsData = () => {
        // If editing a past log
        if (editingLog) {
            const logSets = editingLog.Sets.map((set) => ({
                reps: set.Reps.toString(),
                weight:
                    liftWeightPreference === 'lbs'
                        ? formatWeightForDisplay(set.Weight, 'lbs').split(' ')[0]
                        : formatWeightForDisplay(set.Weight, 'kgs').split(' ')[0],
            }));

            // Split into original and extra sets based on exercise definition
            const originalSetsCount = exercise.Sets ?? 0;
            return {
                sets: logSets.slice(0, originalSetsCount),
                extraSets: logSets.slice(originalSetsCount),
            };
        }

        // For today's log, we need to be more careful about existing modifications
        const today = format(new Date(), 'yyyy-MM-dd');
        const exerciseLogId = `${exercise.ExerciseId}#${today}`;
        const isTracked = isLongTermTrackedLift(exercise.ExerciseId);
        const todaysLog = isTracked ? liftHistory[exercise.ExerciseId]?.[exerciseLogId] : recentLogs[exercise.ExerciseId]?.[exerciseLogId];

        const originalSetsCount = exercise.Sets ?? 0;

        // Always start with the expected structure based on exercise definition + modifications
        const expectedExtraSets = existingModification?.AdditionalSets ?? 0;
        const totalExpectedSets = originalSetsCount + expectedExtraSets;

        // Create empty structure
        const emptySets = Array(totalExpectedSets)
            .fill(null)
            .map(() => ({ reps: '', weight: '' }));

        if (todaysLog) {
            // Fill with existing log data, but maintain the original/extra split
            const filledSets = todaysLog.Sets.map((set) => ({
                reps: set.Reps.toString(),
                weight:
                    liftWeightPreference === 'lbs'
                        ? formatWeightForDisplay(set.Weight, 'lbs').split(' ')[0]
                        : formatWeightForDisplay(set.Weight, 'kgs').split(' ')[0],
            }));

            // Pad with empty sets if needed
            while (filledSets.length < totalExpectedSets) {
                filledSets.push({ reps: '', weight: '' });
            }

            return {
                sets: filledSets.slice(0, originalSetsCount),
                extraSets: filledSets.slice(originalSetsCount, totalExpectedSets),
            };
        }

        return {
            sets: emptySets.slice(0, originalSetsCount),
            extraSets: emptySets.slice(originalSetsCount),
        };
    };

    const focusFirstEmptySet = () => {
        const allSets = [...sets, ...extraSets];
        const firstEmptyIndex = allSets.findIndex((set) => !set.reps);
        if (firstEmptyIndex >= 0) {
            setTimeout(() => {
                inputRefs.current[firstEmptyIndex]?.focus();
                scrollToInput(firstEmptyIndex);
            }, 100);
        }
    };

    const scrollToInput = (index: number) => {
        scrollViewRef.current?.scrollTo({
            y: index * 80,
            animated: true,
        });
    };

    const isSavingRef = useRef(false);

    useEffect(() => {
        if (visible && !isSavingRef.current) {
            // Don't reset during save process
            setActiveTab('log');
            setSelectedDate(editDate ? new Date(editDate) : new Date());

            const setsData = loadSetsData();
            setSets(setsData.sets);
            setExtraSets(setsData.extraSets);

            // Create snapshots for comparison
            setInitialSetsSnapshot(JSON.parse(JSON.stringify(setsData.sets)));
            setInitialExtraSetsSnapshot(JSON.parse(JSON.stringify(setsData.extraSets)));

            setError('');
            setEditingLog(null);
            setShowSuccess(null);
        }
    }, [visible, exercise.ExerciseId, editDate, existingModification]);

    useEffect(() => {
        if (visible && activeTab === 'log') {
            const timeoutId = setTimeout(() => {
                focusFirstEmptySet();
            }, 300);
            return () => clearTimeout(timeoutId);
        }
    }, [visible, activeTab, sets.length, extraSets.length]);

    const handleSetChange = (index: number, field: 'reps' | 'weight', value: string) => {
        const allSets = [...sets, ...extraSets];
        const newSets = [...allSets];
        newSets[index][field] = value;

        const originalSetsCount = sets.length;
        setSets(newSets.slice(0, originalSetsCount));
        setExtraSets(newSets.slice(originalSetsCount));
    };

    const addExtraSet = () => {
        const newExtraSet = { reps: '', weight: '' };
        setExtraSets([...extraSets, newExtraSet]);

        setTimeout(() => {
            const newIndex = sets.length + extraSets.length;
            inputRefs.current[newIndex]?.focus();
            scrollToInput(newIndex);
        }, 100);
    };

    const removeExtraSet = (extraSetIndex: number) => {
        const newExtraSets = extraSets.filter((_, index) => index !== extraSetIndex);
        setExtraSets(newExtraSets);
    };

    const hasChanges = () => {
        // Check if current sets differ from initial snapshots
        const currentSetsStr = JSON.stringify(sets);
        const currentExtraSetsStr = JSON.stringify(extraSets);
        const initialSetsStr = JSON.stringify(initialSetsSnapshot);
        const initialExtraSetsStr = JSON.stringify(initialExtraSetsSnapshot);

        const setsChanged = currentSetsStr !== initialSetsStr;
        const extraSetsChanged = currentExtraSetsStr !== initialExtraSetsStr;
        const result = setsChanged || extraSetsChanged;

        return result;
    };

    const canSave = () => {
        // Must have changes
        const hasChangesResult = hasChanges();

        if (!hasChangesResult) {
            return false;
        }

        // Check if exercise data actually changed (using same logic as handleSave)

        const setsChanged = sets.some((set, index) => {
            if (index >= initialSetsSnapshot.length) {
                return false;
            }
            const changed = set.reps !== initialSetsSnapshot[index]?.reps || set.weight !== initialSetsSnapshot[index]?.weight;
            return changed;
        });

        const extraSetsDataChanged = extraSets.some((set, index) => {
            if (index >= initialExtraSetsSnapshot.length) {
                return false;
            }
            const changed = set.reps !== initialExtraSetsSnapshot[index]?.reps || set.weight !== initialExtraSetsSnapshot[index]?.weight;
            return changed;
        });

        const exerciseDataChanged = setsChanged || extraSetsDataChanged;

        // Check if set structure changed
        const initialExtraSetCount = initialExtraSetsSnapshot.length;
        const currentExtraSetCount = extraSets.length;
        const setStructureChanged = initialExtraSetCount !== currentExtraSetCount;

        // For exercise data changes, ensure we have valid sets
        if (exerciseDataChanged) {
            const allSets = [...sets, ...extraSets];
            const validSets = allSets.filter((set) => parseInt(set.reps) > 0 && (parseInt(set.weight) >= 0 || set.weight === ''));
            const hasValidSets = validSets.length > 0;

            if (hasValidSets) {
                return true;
            }
        }

        // Allow save if only set structure changed (no validation needed for structure changes)
        if (setStructureChanged && !exerciseDataChanged) {
            return true;
        }

        return false;
    };

    const handleClose = () => {
        Keyboard.dismiss();
        onClose();
        setActiveTab('log');
        setSets([]);
        setExtraSets([]);
        setInitialSetsSnapshot([]);
        setInitialExtraSetsSnapshot([]);
        setError('');
        setEditingLog(null);
        setShowSuccess(null);
    };

    const handleBackFromEdit = () => {
        setEditingLog(null);
        setActiveTab('history');

        const setsData = loadSetsData();
        setSets(setsData.sets);
        setExtraSets(setsData.extraSets);
        setInitialSetsSnapshot(JSON.parse(JSON.stringify(setsData.sets)));
        setInitialExtraSetsSnapshot(JSON.parse(JSON.stringify(setsData.extraSets)));

        setSelectedDate(new Date());
    };

    const renderSuccessAnimation = () => {
        if (!showSuccess?.visible) {
            return null;
        }

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
    const getSuccessMessage = () => {
        // If editing an existing log
        if (editingLog) {
            return 'Exercise log updated';
        }

        // For new logs, check what type of change was made
        const allCurrentSets = [...sets, ...extraSets];
        const hasActualExerciseData = allCurrentSets.some((set) => parseInt(set.reps) > 0 && set.weight && set.weight !== '');

        // Check if only the set structure changed (extra sets added/removed)
        const initialExtraSetCount = initialExtraSetsSnapshot.length;
        const currentExtraSetCount = extraSets.length;
        const extraSetsChanged = initialExtraSetCount !== currentExtraSetCount;

        // Check if actual exercise data changed (using same logic as handleSave)
        const setsChanged = sets.some((set, index) => {
            if (index >= initialSetsSnapshot.length) return false;
            return set.reps !== initialSetsSnapshot[index]?.reps || set.weight !== initialSetsSnapshot[index]?.weight;
        });

        const extraSetsDataChanged = extraSets.some((set, index) => {
            if (index >= initialExtraSetsSnapshot.length) return false;
            return set.reps !== initialExtraSetsSnapshot[index]?.reps || set.weight !== initialExtraSetsSnapshot[index]?.weight;
        });

        const exerciseDataChanged = setsChanged || extraSetsDataChanged;

        // Determine appropriate message
        let message;
        if (exerciseDataChanged && hasActualExerciseData) {
            message = 'Exercise logged';
        } else if (extraSetsChanged && !exerciseDataChanged) {
            message = currentExtraSetCount > initialExtraSetCount ? 'Additional sets added' : 'Additional sets removed';
        } else if (exerciseDataChanged && !hasActualExerciseData) {
            message = 'Exercise logged';
        } else {
            message = 'Exercise logged';
        }

        return message;
    };

    const handleSave = async () => {
        try {
            isSavingRef.current = true; // Prevent snapshot resets during save
            setIsSubmitting(true);
            setError('');

            const weightUnit: 'kgs' | 'lbs' = liftWeightPreference === 'lbs' ? 'lbs' : 'kgs';
            const allSets = [...sets, ...extraSets];

            const validSets = allSets
                .filter((set) => parseInt(set.reps) > 0)
                .map((set, index) => ({
                    SetNumber: index + 1,
                    Reps: parseInt(set.reps),
                    Weight: parseWeightForStorage(set.weight, weightUnit),
                    Timestamp: format(new Date(), 'HH:mm:ss'),
                }));

            // Check if exercise data actually changed (not just exists)
            // Only compare sets that existed initially - don't count new empty sets as "data changed"
            const setsChanged = sets.some((set, index) => {
                if (index >= initialSetsSnapshot.length) {
                    return false;
                }
                const changed = set.reps !== initialSetsSnapshot[index]?.reps || set.weight !== initialSetsSnapshot[index]?.weight;
                return changed;
            });

            const extraSetsDataChanged = extraSets.some((set, index) => {
                if (index >= initialExtraSetsSnapshot.length) {
                    return false;
                }
                const changed = set.reps !== initialExtraSetsSnapshot[index]?.reps || set.weight !== initialExtraSetsSnapshot[index]?.weight;
                return changed;
            });

            const exerciseDataChanged = setsChanged || extraSetsDataChanged;

            // Check if we have actual exercise data AND it changed
            const hasExerciseData = validSets.length > 0;
            const shouldSaveExerciseData = hasExerciseData && exerciseDataChanged;

            // Check if we're only modifying set structure
            const initialExtraSetCount = initialExtraSetsSnapshot.length;
            const currentExtraSetCount = extraSets.length;
            const setStructureChanged = initialExtraSetCount !== currentExtraSetCount;

            // If no exercise data changes and no set structure changes, show error
            if (!exerciseDataChanged && !setStructureChanged) {
                setError('Please enter at least one valid set');
                isSavingRef.current = false; // Reset flag before early return
                return;
            }

            // Save exercise progress only if exercise data actually changed
            if (shouldSaveExerciseData) {
                await dispatch(
                    saveExerciseProgressAsync({
                        exerciseId: exercise.ExerciseId,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                        sets: validSets,
                    }),
                ).unwrap();
            }

            // Handle set modifications (only for today's logs, not when editing past logs)
            if (!editingLog && programId) {
                const today = format(new Date(), 'yyyy-MM-dd');

                // Find ANY temporary modification for today (more robust search)
                const currentExistingMod =
                    existingModification ||
                    userExerciseSetModifications.find(
                        (mod) =>
                            mod.ExerciseId === exercise.ExerciseId && mod.ProgramId === programId && mod.IsTemporary === true && mod.TemporaryDate === today,
                    );

                if (extraSets.length > 0) {
                    // User has extra sets
                    if (currentExistingMod) {
                        // Update existing modification if the additional sets count changed
                        if (currentExistingMod.AdditionalSets !== extraSets.length) {
                            await dispatch(
                                updateExerciseSetModificationAsync({
                                    modificationId: currentExistingMod.ModificationId,
                                    updates: {
                                        additionalSets: extraSets.length,
                                        isTemporary: true,
                                        temporaryDate: today,
                                    },
                                }),
                            ).unwrap();
                        }
                    } else {
                        // Create new temporary modification only if none exists
                        await dispatch(
                            createExerciseSetModificationAsync({
                                exerciseId: exercise.ExerciseId,
                                programId: programId,
                                originalSets: exercise.Sets ?? 0,
                                additionalSets: extraSets.length,
                                isTemporary: true,
                                temporaryDate: today,
                            }),
                        ).unwrap();
                    }
                } else if (currentExistingMod && currentExistingMod.AdditionalSets > 0) {
                    // User removed all extra sets, delete the modification
                    await dispatch(
                        deleteExerciseSetModificationAsync({
                            modificationId: currentExistingMod.ModificationId,
                        }),
                    ).unwrap();
                }
            }

            // Show success and close - this will now show for both exercise logging and set modifications
            const successMessage = getSuccessMessage();

            setShowSuccess({
                message: successMessage,
                visible: true,
            });

            setTimeout(() => {
                isSavingRef.current = false; // Reset the saving flag after success animation
                handleClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error in handleSave:', err);
            const serverErrorMessage = err?.errorMessage || 'Failed to save exercise progress';
            setError(serverErrorMessage);
            setActiveTab('log');
            isSavingRef.current = false; // Reset flag on error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteLog = async () => {
        if (!editingLog) return;

        try {
            setIsSubmitting(true);
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
                    const setsData = loadSetsData();
                    setSets(setsData.sets);
                    setExtraSets(setsData.extraSets);
                    setInitialSetsSnapshot(JSON.parse(JSON.stringify(setsData.sets)));
                    setInitialExtraSetsSnapshot(JSON.parse(JSON.stringify(setsData.extraSets)));
                    setActiveTab('log');
                } else {
                    const setsData = loadSetsData();
                    setSets(setsData.sets);
                    setExtraSets(setsData.extraSets);
                    setInitialSetsSnapshot(JSON.parse(JSON.stringify(setsData.sets)));
                    setInitialExtraSetsSnapshot(JSON.parse(JSON.stringify(setsData.extraSets)));
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

    const renderHeader = () => {
        const canSaveResult = canSave();

        return (
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

                <TouchableOpacity onPress={handleSave} disabled={!canSaveResult || isSubmitting} style={styles.headerButton}>
                    {isSubmitting ? (
                        <ActivityIndicator size='small' color={themeColors.text} />
                    ) : (
                        <Icon name='check' size={24} color={canSaveResult ? themeColors.text : lightenColor(themeColors.subText, 0.8)} />
                    )}
                </TouchableOpacity>
            </ThemedView>
        );
    };

    const renderTabs = () => (
        <View style={styles.tabs}>
            <TouchableOpacity
                activeOpacity={1}
                style={[styles.tab, activeTab === 'log' && { borderBottomColor: themeColors.text }]}
                onPress={() => {
                    if (!editingLog) {
                        setActiveTab('log');
                        const setsData = loadSetsData();
                        setSets(setsData.sets);
                        setExtraSets(setsData.extraSets);
                        setInitialSetsSnapshot(JSON.parse(JSON.stringify(setsData.sets)));
                        setInitialExtraSetsSnapshot(JSON.parse(JSON.stringify(setsData.extraSets)));
                        setSelectedDate(new Date());
                        focusFirstEmptySet();
                        setError('');
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
                        setError('');
                    }
                }}
            >
                <ThemedText type='button'>History</ThemedText>
            </TouchableOpacity>
        </View>
    );

    const renderSetRow = (set: SetInput, index: number) => {
        const isExtraSet = index >= sets.length;
        const extraSetIndex = index - sets.length;
        const allSets = [...sets, ...extraSets];
        const isLastRow = index === allSets.length - 1;

        return (
            <View key={index} style={styles.setRow}>
                {/* Remove button for extra sets OR spacer for regular sets */}
                {isExtraSet ? (
                    <TouchableOpacity
                        onPress={() => removeExtraSet(extraSetIndex)}
                        style={styles.removeSetButtonLeft}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    >
                        <Icon name='close' size={16} color={themeColors.red} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.removeSetButtonLeft} />
                )}

                {/* Set number */}
                <View style={styles.setNumberContainer}>
                    <ThemedText type='buttonSmall' style={[styles.setNumber, isExtraSet && { color: themeColors.text }]}>
                        #{index + 1}
                    </ThemedText>
                </View>

                {/* Weight input */}
                <View style={styles.setInputContainer}>
                    <TextInput
                        ref={(el) => (inputRefs.current[index] = el)}
                        style={[styles.input, { color: themeColors.text }, isExtraSet && { borderColor: themeColors.text }]}
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

                {/* Reps input */}
                <View style={styles.setInputContainer}>
                    <TextInput
                        style={[styles.input, { color: themeColors.text }, isExtraSet && { borderColor: themeColors.text }]}
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

                {/* Add set button for last row (only when not editing) */}
                {isLastRow && !editingLog ? (
                    <TouchableOpacity onPress={addExtraSet} style={styles.addSetIconButton} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                        <Icon name='add' size={18} color={themeColors.tipIcon} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.addSetIconButton} />
                )}
            </View>
        );
    };

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
                    {/* <ThemedText type='body' style={styles.dateText}>
                        {format(selectedDate, 'dd/MM/yyyy')}
                    </ThemedText> */}

                    <ScrollView
                        ref={scrollViewRef}
                        keyboardShouldPersistTaps='always'
                        keyboardDismissMode='none'
                        showsVerticalScrollIndicator={true}
                        indicatorStyle='black'
                        contentContainerStyle={styles.scrollContent}
                    >
                        {showDeleteConfirm && editingLog ? (
                            renderDeleteConfirmation()
                        ) : (
                            <>
                                <View style={styles.setsContainer}>{[...sets, ...extraSets].map((set, index) => renderSetRow(set, index))}</View>

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

                        const logSets = log.Sets.map((set) => ({
                            reps: set.Reps.toString(),
                            weight:
                                liftWeightPreference === 'lbs'
                                    ? formatWeightForDisplay(set.Weight, 'lbs').split(' ')[0]
                                    : formatWeightForDisplay(set.Weight, 'kgs').split(' ')[0],
                        }));

                        const originalSetsCount = exercise.Sets ?? 0;
                        const newSets = logSets.slice(0, originalSetsCount);
                        const newExtraSets = logSets.slice(originalSetsCount);

                        setSets(newSets);
                        setExtraSets(newExtraSets);
                        setInitialSetsSnapshot(JSON.parse(JSON.stringify(newSets)));
                        setInitialExtraSetsSnapshot(JSON.parse(JSON.stringify(newExtraSets)));
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
        let logs: ExerciseLog[] = [];

        if (isTrackedLift && liftHistory[exercise.ExerciseId]) {
            logs = Object.values(liftHistory[exercise.ExerciseId]);
        } else if (!isTrackedLift && recentLogs[exercise.ExerciseId]) {
            logs = Object.values(recentLogs[exercise.ExerciseId]);
        }

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
            <ScrollView
                style={styles.historyContainer}
                showsVerticalScrollIndicator={true}
                indicatorStyle='black'
                contentContainerStyle={styles.historyContent}
            >
                {sortedLogs.map((log) => (
                    <React.Fragment key={`${log.Date}-${log.CreatedAt}`}>{renderHistoryItem(log)}</React.Fragment>
                ))}
            </ScrollView>
        );
    };

    return (
        <BottomSheet
            visible={visible}
            onClose={handleClose}
            style={{ height: '100%', maxHeight: '90%', paddingRight: 0 }}
            disableBackdropPress={activeTab === 'log'}
        >
            {renderHeader()}
            {!editingLog && renderTabs()}
            {activeTab === 'log' ? renderLogTab() : renderHistoryTab()}
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.SM,
        paddingRight: Spaces.MD,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerButton: {
        minWidth: 40,
        alignItems: 'center',
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: Spaces.SM,
        paddingRight: Spaces.LG,
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
        marginTop: Spaces.MD,
        paddingBottom: Spaces.SM,
        paddingHorizontal: Spaces.SM,
    },
    logContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Platform.OS === 'ios' ? 120 : 180,
        paddingTop: Spaces.LG,
    },
    setsContainer: {
        marginTop: Spaces.XS,
    },
    setRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spaces.MD,
        paddingRight: Spaces.LG,
    },
    setNumberContainer: {
        width: 26,
        alignItems: 'center',
    },
    setNumber: {
        opacity: 0.7,
        paddingVertical: Spaces.SM,
    },
    removeSetButtonLeft: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spaces.SM + Spaces.XXS,
    },
    setInputContainer: {
        flex: 1,
        marginHorizontal: Spaces.SM,
    },
    input: {
        height: 40,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.XS,
        paddingHorizontal: Spaces.MD,
        textAlign: 'center',
    },
    inputLabel: {
        textAlign: 'center',
        marginTop: Spaces.XS,
        opacity: 0.7,
    },
    addSetIconButton: {
        width: 24,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spaces.SM,
    },
    errorText: {
        textAlign: 'center',
        marginTop: Spaces.MD,
        paddingHorizontal: Spaces.SM,
    },
    historyContainer: {
        flex: 1,
    },
    historyContent: {
        padding: Spaces.SM,
    },
    historyTile: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        marginVertical: Spaces.XS,
        borderRadius: Spaces.SM,
        marginRight: Spaces.MD,
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
        paddingHorizontal: Spaces.LG,
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
        padding: Spaces.MD,
        paddingHorizontal: Spaces.SM,
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
        paddingHorizontal: Spaces.SM,
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
