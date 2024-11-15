// app/(app)/programs/program-abandon-feedback.tsx

import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';

import FeedbackForm, { FeedbackFormResult } from '@/components/feedback/FeedbackForm';
import { ReasonStep } from '@/components/feedback/programs/AbandonReasonStep';
import { DifficultyStep } from '@/components/feedback/programs/DifficultyStep';
import { ImprovementsStep } from '@/components/feedback/programs/ImprovementStep';
import { ProgramAbandonData } from '@/types/feedbackTypes';
import { AppDispatch, RootState } from '@/store/store';
import { sendProgramAbandonFeedbackAsync } from '@/store/feedback/thunks';
import { BackHandler } from 'react-native';

export default function ProgramAbandonFeedbackScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ programId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Return true to prevent default behavior
            return true;
        });

        return () => backHandler.remove();
    }, []);

    // Add type safety and default handling for programId
    const programId = typeof params.programId === 'string' ? params.programId : '';

    const initialData: ProgramAbandonData = {
        TerminationReason: '',
        DifficultyRating: 0,
        Improvements: [],
    };

    const validate = (step: number, data: ProgramAbandonData) => {
        switch (step) {
            case 1:
                return data.TerminationReason !== '' && (data.TerminationReason !== 'other' || !!data.reasonDetails);
            case 2:
                return data.DifficultyRating > 0;
            default:
                return true;
        }
    };

    const handleSubmit = async ({ data }: FeedbackFormResult<ProgramAbandonData>) => {
        if (user?.UserId && programId) {
            try {
                await dispatch(
                    sendProgramAbandonFeedbackAsync({
                        userId: user.UserId,
                        programId: programId,
                        feedback: data,
                    }),
                ).unwrap();
                router.replace('/(app)/programs/program-end-splash');
            } catch (error) {
                console.error('Error submitting feedback:', error);
                // Handle error appropriately
            }
        } else {
            console.warn('Missing user ID or program ID', { userId: user?.UserId, programId });
        }
    };

    const handleSkip = async ({ data }: FeedbackFormResult<ProgramAbandonData>) => {
        if (user?.UserId && programId) {
            try {
                await dispatch(
                    sendProgramAbandonFeedbackAsync({
                        userId: user.UserId,
                        programId: programId,
                        feedback: data,
                    }),
                ).unwrap();
                router.replace('/(app)/programs/program-end-splash');
            } catch (error) {
                console.error('Error submitting feedback:', error);
                // Handle error appropriately
            }
        }
    };

    // Add a guard clause for missing programId
    if (!programId) {
        return null; // or some error UI
    }

    return (
        <FeedbackForm<ProgramAbandonData>
            steps={[ReasonStep, DifficultyStep, ImprovementsStep]}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            initialData={initialData}
            validate={validate}
        />
    );
}
