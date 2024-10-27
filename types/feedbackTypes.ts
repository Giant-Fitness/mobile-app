// types/feedbackTypes.ts

export interface ProgramAbandonData {
    TerminationReason: string;
    reasonDetails?: string;
    DifficultyRating: number;
    Improvements: string[];
    additionalFeedback?: string;
}
