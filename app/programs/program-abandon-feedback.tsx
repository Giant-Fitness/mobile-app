// app/programs/program-abandon-feedback.tsx

import React, { useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';

import FeedbackForm, { FeedbackFormResult } from '@/components/feedback/FeedbackForm';
import { ReasonStep } from '@/components/feedback/programs/AbandonReasonStep';
import { DifficultyStep } from '@/components/feedback/programs/DifficultyStep';
import { ImprovementsStep } from '@/components/feedback/programs/ImprovementStep';
import { ProgramAbandonData } from '@/types/feedbackTypes';
import { AppDispatch, RootState } from '@/store/store';
import { sendProgramAbandonFeedbackAsync } from '@/store/feedback/thunks';

type ProgramAbandonFeedbackScreenParams = {
    programId: string;
};

export default function ProgramAbandonFeedbackScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute<RouteProp<Record<string, ProgramAbandonFeedbackScreenParams>, string>>();
    const { programId } = route.params;

    const { user } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        navigation.setOptions({ headerShown: false, gestureEnabled: false });
    }, [navigation]);

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

    const handleSubmit = async ({ data, lastCompletedStep }: FeedbackFormResult<ProgramAbandonData>) => {
        if (user?.UserId && programId) {
            await dispatch(sendProgramAbandonFeedbackAsync({ userId: user.UserId, programId: programId, feedback: data })).unwrap();
        }
        navigation.navigate('programs/program-end-splash' as never);
    };

    const handleSkip = async ({ data, lastCompletedStep }: FeedbackFormResult<ProgramAbandonData>) => {
        if (user?.UserId && programId) {
            await dispatch(sendProgramAbandonFeedbackAsync({ userId: user.UserId, programId: programId, feedback: data })).unwrap();
        }
        navigation.navigate('programs/program-end-splash' as never);
    };

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
