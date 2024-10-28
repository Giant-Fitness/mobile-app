// types/feedbackTypes.ts

export interface ProgramAbandonData {
    TerminationReason: string;
    reasonDetails?: string;
    DifficultyRating: number;
    Improvements: string[];
    additionalFeedback?: string;
}

export interface ProgramCompleteData {
    OverallRating: number;
    DifficultyRating: number;
    AchievedGoals: boolean;
    WouldRecommend: boolean;
    FavoriteAspects: string[];
    additionalFeedback?: string;
}
