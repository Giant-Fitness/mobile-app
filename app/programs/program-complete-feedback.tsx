// app/programs/program-complete-feedback.tsx

import React, { useEffect } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
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

type ProgramCompleteFeedbackScreenParams = {
    programId: string;
};

export default function ProgramCompleteFeedbackScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();
    const route = useRoute<RouteProp<Record<string, ProgramCompleteFeedbackScreenParams>, string>>();
    const { programId } = route.params;

    const { user } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        const setNavOptions = () => {
            navigation.setOptions({
                headerShown: false,
                gestureEnabled: false,
            });
        };

        // Run immediately and after a small delay
        setNavOptions();
        const timer = setTimeout(setNavOptions, 1);

        return () => {
            clearTimeout(timer);
            // Optional: restore default settings on unmount
            navigation.setOptions({
                headerShown: true,
                gestureEnabled: true,
            });
        };
    }, [navigation]);

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

    const handleSubmit = async ({ data, lastCompletedStep }: FeedbackFormResult<ProgramCompleteData>) => {
        if (user?.UserId && programId) {
            await dispatch(sendProgramCompleteFeedbackAsync({ userId: user.UserId, programId: programId, feedback: data })).unwrap();
        }
        navigation.navigate('programs/program-end-splash' as never);
    };

    const handleSkip = async ({ data, lastCompletedStep }: FeedbackFormResult<ProgramCompleteData>) => {
        if (user?.UserId && programId) {
            await dispatch(sendProgramCompleteFeedbackAsync({ userId: user.UserId, programId: programId, feedback: data })).unwrap();
        }
        navigation.navigate('programs/program-end-splash' as never);
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
