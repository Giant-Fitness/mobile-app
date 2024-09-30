// types/userTypes.ts

export interface UserProgramProgress {
    UserId: string;
    ProgramId: number;
    CurrentDay: number;
    CompletedDays: string[];
    StartAt: string;
    LastActivityAt: string;
}
