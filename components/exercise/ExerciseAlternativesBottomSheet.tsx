// components/exercise/ExerciseAlternativesBottomSheet.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import LottieView from 'lottie-react-native';
import { BottomSheet } from '@/components/overlays/BottomSheet';
import { ThemedText } from '@/components/base/ThemedText';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { TextButton } from '@/components/buttons/TextButton';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Exercise, ExerciseAlternative } from '@/types';
import ExercisesService from '@/store/exercises/service';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { createExerciseSubstitutionAsync, deleteExerciseSubstitutionAsync, getUserExerciseSubstitutionsAsync } from '@/store/user/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { format } from 'date-fns';
import { CenteredModal } from '@/components/overlays/CenteredModal';

interface ExerciseAlternativesBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    exercise: Exercise;
    programId?: string;
}

type SubstitutionTypeOption = 'temporary' | 'permanent';

export const ExerciseAlternativesBottomSheet: React.FC<ExerciseAlternativesBottomSheetProps> = ({ visible, onClose, exercise, programId }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme as 'light' | 'dark'];
    const dispatch = useDispatch<AppDispatch>();

    // Local state
    const [alternatives, setAlternatives] = useState<ExerciseAlternative[]>([]);
    const [loadingAlternatives, setLoadingAlternatives] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedAlternative, setSelectedAlternative] = useState<ExerciseAlternative | null>(null);
    const [showSuccess, setShowSuccess] = useState<{ message: string; visible: boolean } | null>(null);
    const [showSubstitutionTypeModal, setShowSubstitutionTypeModal] = useState(false);

    // Redux state
    const { userExerciseSubstitutions, userExerciseSubstitutionsState } = useSelector((state: RootState) => state.user);

    // Find existing substitution for this exercise
    const existingSubstitution = userExerciseSubstitutions.find(
        (sub) => sub.OriginalExerciseId === exercise.ExerciseId && (sub.ProgramId === programId || sub.ProgramId === null),
    );

    // Reset success animation state when sheet becomes invisible
    useEffect(() => {
        if (!visible && showSuccess?.visible) {
            setShowSuccess(null);
        }
    }, [visible]);

    // Load substitutions when component mounts or becomes visible
    useEffect(() => {
        if (visible) {
            // Load user's substitutions if they haven't been loaded yet
            if (userExerciseSubstitutionsState !== REQUEST_STATE.FULFILLED) {
                dispatch(getUserExerciseSubstitutionsAsync());
            }

            // Fetch alternatives
            fetchAlternatives();

            // Reset success animation state when sheet becomes visible
            setShowSuccess(null);
        }
    }, [visible, exercise.ExerciseId, dispatch]);

    // Set selected alternative based on existing substitution
    useEffect(() => {
        if (visible && existingSubstitution && alternatives.length > 0) {
            const substitute = alternatives.find((alt) => alt.ExerciseId === existingSubstitution.SubstituteExerciseId);

            if (substitute) {
                setSelectedAlternative(substitute);
            }
        } else if (visible && !existingSubstitution) {
            setSelectedAlternative(null);
        }
    }, [visible, existingSubstitution, alternatives]);

    const fetchAlternatives = async () => {
        try {
            setLoadingAlternatives(true);
            setError(null);

            // Fetch alternatives from the service
            const result = await ExercisesService.getExerciseAlternatives(exercise.ExerciseId);

            // Sort by match score and limit to 10
            const sortedAlternatives = result.sort((a, b) => b.MatchScore - a.MatchScore).slice(0, 10);

            setAlternatives(sortedAlternatives);
        } catch (err) {
            setError('Failed to load exercise alternatives. Please try again.');
            console.error('Error fetching alternatives:', err);
        } finally {
            setLoadingAlternatives(false);
        }
    };

    const handleSelectAlternative = (alternative: ExerciseAlternative) => {
        setSelectedAlternative(alternative);
    };

    const handleSwapClick = () => {
        if (!selectedAlternative) return;

        // If there's no existing substitution or the selected alternative is different from the current substitution
        if (!existingSubstitution || existingSubstitution.SubstituteExerciseId !== selectedAlternative.ExerciseId) {
            setShowSubstitutionTypeModal(true);
        } else {
            // User selected the same exercise that's already substituted - just close
            onClose();
        }
    };

    const handleCreateSubstitution = async (type: SubstitutionTypeOption) => {
        if (!selectedAlternative || !programId) return;

        setShowSubstitutionTypeModal(false);

        try {
            // Prepare substitution data
            const today = format(new Date(), 'yyyy-MM-dd');
            const substitutionData = {
                originalExerciseId: exercise.ExerciseId,
                substituteExerciseId: selectedAlternative.ExerciseId,
                programId: programId,
                isTemporary: type === 'temporary',
                temporaryDate: type === 'temporary' ? today : null,
            };

            // If there's an existing substitution, delete it first
            if (existingSubstitution) {
                await dispatch(
                    deleteExerciseSubstitutionAsync({
                        substitutionId: existingSubstitution.SubstitutionId,
                    }),
                );
            }

            // Create the new substitution
            await dispatch(createExerciseSubstitutionAsync(substitutionData));

            // Show success animation
            setShowSuccess({
                message: `Exercise swapped ${type === 'temporary' ? 'for today' : 'for entire program'}`,
                visible: true,
            });

            // Set a timeout to close the sheet after showing the success message
            setTimeout(() => {
                // Important: Reset the success state and then close the sheet
                setShowSuccess(null);
                onClose();
            }, 1500);
        } catch (error) {
            setError('Failed to create substitution. Please try again.');
            console.error('Error creating substitution:', error);
        }
    };

    const handleRevertToOriginal = async () => {
        if (!existingSubstitution) return;

        try {
            // Delete the existing substitution
            await dispatch(
                deleteExerciseSubstitutionAsync({
                    substitutionId: existingSubstitution.SubstitutionId,
                }),
            );

            // Show success animation
            setShowSuccess({
                message: 'Exercise reverted to original',
                visible: true,
            });

            // Set a timeout to close the sheet after showing the success message
            setTimeout(() => {
                // Important: Reset the success state and then close the sheet
                setShowSuccess(null);
                onClose();
            }, 1500);
        } catch (error) {
            setError('Failed to revert exercise. Please try again.');
            console.error('Error reverting substitution:', error);
        }
    };

    // Calculate color for match indicator
    const getMatchColor = (score: number) => {
        if (score >= 80) return '#4CAF50'; // Green for high matches
        if (score >= 70) return '#FFC107'; // Yellow for medium matches
        return '#FF9800'; // Orange for lower matches
    };

    // Handle proper sheet closing
    const handleSheetClose = () => {
        // Reset success state
        setShowSuccess(null);
        // Call the parent's onClose handler
        onClose();
    };

    // Render the header with close button
    const renderHeader = () => (
        <View style={[styles.header, { borderBottomColor: themeColors.systemBorderColor }]}>
            <TouchableOpacity onPress={handleSheetClose} style={styles.closeButton} hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Icon name='close' size={20} color={themeColors.text} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <ThemedText type='title'>Substitute</ThemedText>
                <ThemedText type='bodySmall' style={styles.headerSubtitle}>
                    {exercise.ExerciseName}
                </ThemedText>
            </View>
        </View>
    );

    // Render the current exercise section
    // const renderCurrentExercise = () => (
    //     <ThemedView style={styles.currentExerciseContainer}>
    //         <ThemedView
    //             style={[
    //                 styles.currentExerciseCard,
    //                 {
    //                     backgroundColor: existingSubstitution ? themeColors.tipBackground : themeColors.background,
    //                     borderColor: existingSubstitution ? themeColors.systemBorderColor : themeColors.systemBorderColor,
    //                 },
    //             ]}
    //         >
    //             <ThemedText type='button'>{exercise.ExerciseName}</ThemedText>
    //             {existingSubstitution && (
    //                 <View style={styles.substitutedIndicator}>
    //                     <View style={[styles.checkIconContainer, { backgroundColor: '#4CAF50' }]}>
    //                         <Icon name='check' size={14} color='#fff' />
    //                     </View>
    //                     <ThemedText type='bodySmall' style={styles.substitutedText}>
    //                         Substituted
    //                     </ThemedText>
    //                 </View>
    //             )}
    //         </ThemedView>
    //     </ThemedView>
    // );

    // Render an individual alternative item
    const renderAlternativeItem = ({ item }: { item: ExerciseAlternative }) => {
        const isSelected = selectedAlternative?.ExerciseId === item.ExerciseId;
        const matchScore = Math.round(item.MatchScore);
        const matchColor = getMatchColor(matchScore);

        return (
            <TouchableOpacity
                style={[
                    styles.alternativeCard,
                    {
                        backgroundColor: isSelected ? themeColors.tangerineTransparent : themeColors.background,
                        borderColor: isSelected ? themeColors.tangerineSolid : themeColors.systemBorderColor,
                    },
                ]}
                onPress={() => handleSelectAlternative(item)}
                activeOpacity={0.7}
            >
                <View style={styles.matchScoreContainer}>
                    <View style={styles.alternativeContent}>
                        <ThemedText type='button' style={styles.exerciseName} numberOfLines={2}>
                            {item.ExerciseName}
                        </ThemedText>

                        <View style={styles.matchScoreRow}>
                            <View style={[styles.matchIndicator, { backgroundColor: matchColor }]} />
                            <ThemedText type='caption' style={styles.matchText}>
                                Match: {matchScore}%
                            </ThemedText>
                        </View>
                    </View>

                    {isSelected && (
                        <View style={[styles.selectedIndicator]}>
                            <Icon name='check' size={14} color={themeColors.tangerineSolid} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    // Render success message with animation
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

    // Render loading state
    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color={themeColors.buttonPrimary} />
            <ThemedText type='body' style={styles.loadingText}>
                Finding alternatives...
            </ThemedText>
        </View>
    );

    // Render error state
    const renderError = () => (
        <View style={styles.errorContainer}>
            <Icon name='alert-circle' size={40} color={themeColors.red} />
            <ThemedText type='body' style={styles.errorText}>
                {error}
            </ThemedText>
            <TextButton text='Try Again' onPress={fetchAlternatives} style={styles.retryButton} />
        </View>
    );

    // Render the substitution type modal
    const renderSubstitutionTypeModal = () => (
        <CenteredModal visible={showSubstitutionTypeModal} onClose={() => setShowSubstitutionTypeModal(false)}>
            <View style={styles.modalContainer}>
                <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowSubstitutionTypeModal(false)}
                    hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
                >
                    <Icon name='close' size={20} color={themeColors.text} />
                </TouchableOpacity>
                <View style={[styles.iconContainer, { backgroundColor: themeColors.tipBackground }]}>
                    <Icon name='swap' color={themeColors.tipIcon} size={24} />
                </View>
                <ThemedText type='title' style={styles.modalTitle}>
                    Substitution type
                </ThemedText>
                <ThemedText type='bodySmall' style={styles.modalMessage}>
                    How would you like to substitute this exercise?
                </ThemedText>
                <View style={styles.modalButtonContainer}>
                    <TextButton
                        text='Just for today'
                        onPress={() => handleCreateSubstitution('temporary')}
                        style={[
                            styles.modalButton,
                            {
                                backgroundColor: themeColors.background,
                                borderWidth: 1,
                                borderColor: themeColors.systemBorderColor,
                            },
                        ]}
                        textType='bodyXSmall'
                        textStyle={[styles.buttonTextStyle, { color: themeColors.text }]}
                    />
                    <TextButton
                        text='For entire program'
                        onPress={() => handleCreateSubstitution('permanent')}
                        style={styles.modalButton}
                        textType='bodyXSmall'
                        textStyle={styles.buttonTextStyle}
                    />
                </View>
            </View>
        </CenteredModal>
    );

    const isSwapLoading = userExerciseSubstitutionsState === REQUEST_STATE.PENDING;

    // Determine if swap button should be enabled
    const isSwapEnabled = selectedAlternative && (!existingSubstitution || existingSubstitution.SubstituteExerciseId !== selectedAlternative.ExerciseId);

    return (
        <BottomSheet visible={visible} onClose={handleSheetClose} style={{ height: '90%', maxHeight: '90%' }}>
            {renderHeader()}

            {showSuccess?.visible ? (
                renderSuccessAnimation()
            ) : (
                <>
                    {/* {renderCurrentExercise()} */}

                    {/* Loading, Error or Results */}
                    {loadingAlternatives ? (
                        renderLoading()
                    ) : error ? (
                        renderError()
                    ) : (
                        <FlatList
                            key='grid-view'
                            data={alternatives}
                            renderItem={renderAlternativeItem}
                            keyExtractor={(item) => item.ExerciseId}
                            contentContainerStyle={styles.alternativesList}
                            numColumns={2}
                            columnWrapperStyle={styles.gridRow}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <ThemedText type='body' style={styles.emptyText}>
                                        No alternatives available for this exercise.
                                    </ThemedText>
                                </View>
                            }
                        />
                    )}

                    {/* Action Buttons */}
                    {!loadingAlternatives && !error && !showSuccess?.visible && (
                        <View style={styles.buttonContainer}>
                            {existingSubstitution && (
                                <TextButton
                                    text='Reset'
                                    size='LG'
                                    onPress={handleRevertToOriginal}
                                    style={[styles.revertButton, { borderRadius: Spaces.LG }]}
                                    textStyle={{ color: themeColors.buttonPrimary }}
                                    loading={isSwapLoading}
                                    disabled={isSwapLoading}
                                />
                            )}

                            <PrimaryButton
                                text='Swap'
                                size='LG'
                                onPress={handleSwapClick}
                                style={[styles.swapButton, { borderRadius: Spaces.LG }]}
                                disabled={!isSwapEnabled || isSwapLoading}
                                loading={isSwapLoading}
                            />
                        </View>
                    )}
                </>
            )}

            {renderSubstitutionTypeModal()}
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spaces.MD,
        borderBottomWidth: StyleSheet.hairlineWidth,
        position: 'relative',
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerSubtitle: {
        marginTop: Spaces.XS,
        textAlign: 'center',
        opacity: 0.7,
        fontSize: Sizes.fontSizeSmall,
    },
    closeButton: {
        padding: Spaces.XS,
        position: 'absolute',
        top: Spaces.MD,
        left: Spaces.MD,
        zIndex: 10,
    },
    currentExerciseContainer: {
        marginHorizontal: Spaces.MD,
        marginVertical: Spaces.MD,
    },
    currentExerciseCard: {
        padding: Spaces.MD,
        borderRadius: Spaces.LG,
        borderWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    substitutedIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkIconContainer: {
        backgroundColor: '#4CAF50',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spaces.XS,
    },
    substitutedText: {
        marginLeft: Spaces.XS,
    },
    loadingContainer: {
        padding: Spaces.XXL,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    loadingText: {
        marginTop: Spaces.MD,
        textAlign: 'center',
    },
    alternativesList: {
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.XL,
    },
    alternativeCard: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: Spaces.SM + Spaces.XS,
        marginBottom: Spaces.MD,
        overflow: 'hidden',
        height: 90,
        flex: 1,
    },
    matchScoreContainer: {
        flex: 1,
        position: 'relative',
    },
    gridRow: {
        justifyContent: 'space-between',
        gap: Spaces.SM,
    },
    alternativeContent: {
        padding: Spaces.SM,
        flex: 1,
        justifyContent: 'space-between',
    },
    exerciseName: {
        marginBottom: Spaces.XS,
    },
    matchScoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spaces.XS,
    },
    matchIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: Spaces.XS,
    },
    matchText: {
        fontSize: 12,
    },
    selectedIndicator: {
        position: 'absolute',
        bottom: Spaces.SM,
        right: Spaces.SM,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        padding: Spaces.XXL,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
    },
    errorContainer: {
        padding: Spaces.XXL,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    errorText: {
        marginTop: Spaces.MD,
        marginBottom: Spaces.LG,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: Spaces.MD,
    },
    buttonContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.XL,
        gap: Spaces.SM,
    },
    revertButton: {
        flex: 1,
        alignSelf: 'center',
    },
    swapButton: {
        flex: 1,
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spaces.XXL,
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
    modalContent: {
        padding: Spaces.LG,
        alignItems: 'center',
        width: '80%',
    },
    modalDescription: {
        marginBottom: Spaces.LG,
        textAlign: 'center',
    },
    optionButton: {
        width: '100%',
        padding: Spaces.MD,
        borderRadius: Spaces.SM,
        borderWidth: 1,
        marginBottom: Spaces.MD,
        alignItems: 'center',
    },
    cancelButton: {
        marginTop: Spaces.SM,
    },
    modalContainer: {
        alignItems: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spaces.MD,
    },
    modalTitle: {
        marginBottom: Spaces.SM,
        textAlign: 'center',
    },
    modalMessage: {
        textAlign: 'center',
        marginBottom: Spaces.LG,
    },
    modalButtonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: Spaces.MD,
    },
    modalButton: {
        flex: 1,
        marginHorizontal: Spaces.XS,
        paddingVertical: Spaces.SM,
        borderRadius: Spaces.MD,
    },
    buttonTextStyle: {
        fontSize: Sizes.fontSizeSmall,
        textAlign: 'center',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10,
    },
});
