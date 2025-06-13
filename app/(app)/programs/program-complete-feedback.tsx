// app/(app)/programs/program-complete-feedback.tsx

import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';

import FeedbackForm, { FeedbackFormResult } from '@/components/feedback/FeedbackForm';
import { OverallRatingStep } from '@/components/feedback/programs/OverallRatingStep';
import { GoalsStep } from '@/components/feedback/programs/GoalsStep';
import { RecommendStep } from '@/components/feedback/programs/RecommendStep';
import { FavoriteAspectsStep } from '@/components/feedback/programs/FavoriteAspectsStep';
import { DifficultyStep } from '@/components/feedback/programs/DifficultyStep';
import { ProgramCompleteData } from '@/types/feedbackTypes';
import { AppDispatch, RootState } from '@/store/store';
import { sendProgramCompleteFeedbackAsync } from '@/store/feedback/thunks';
import { trigger } from 'react-native-haptic-feedback';

export default function ProgramCompleteFeedbackScreen() {
    const router = useRouter();
    const { programId } = useLocalSearchParams<{ programId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.user);

    const initialData: ProgramCompleteData = {
        OverallRating: 0,
        DifficultyRating: 0,
        FavoriteAspects: [],
        WouldRecommend: true,
        AchievedGoals: true,
    };

    const validate = (step: number, data: ProgramCompleteData) => {
        switch (step) {
            case 1: // Goals
                return typeof data.AchievedGoals === 'boolean';
            case 2: // Difficulty
                return data.DifficultyRating > 0;
            case 3: // Overall Rating
                return data.OverallRating > 0;
            case 4: // Recommend
                return typeof data.WouldRecommend === 'boolean';
            case 5: // Favorite Aspects
                return data.FavoriteAspects.length > 0;
            default:
                return true;
        }
    };

    const handleSubmit = async ({ data }: FeedbackFormResult<ProgramCompleteData>) => {
        if (user?.UserId && programId) {
            trigger('notificationSuccess');
            await dispatch(
                sendProgramCompleteFeedbackAsync({
                    userId: user.UserId,
                    programId: programId,
                    feedback: data,
                }),
            ).unwrap();
        }
        trigger('impactHeavy');
        router.replace('/(app)/programs/program-end-splash');
    };

    const handleSkip = async ({ data }: FeedbackFormResult<ProgramCompleteData>) => {
        if (user?.UserId && programId) {
            await dispatch(
                sendProgramCompleteFeedbackAsync({
                    userId: user.UserId,
                    programId: programId,
                    feedback: data,
                }),
            ).unwrap();
        }
        router.replace('/(app)/programs/program-end-splash');
    };

    return (
        <FeedbackForm<ProgramCompleteData>
            steps={[GoalsStep, DifficultyStep, OverallRatingStep, RecommendStep, FavoriteAspectsStep]}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            initialData={initialData}
            validate={validate}
        />
    );
}
