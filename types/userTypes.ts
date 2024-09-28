// types/userTypes.ts

export interface UserProgramProgress {
    UserId: string;
    ProgramId: string;
    CurrentDay: string;
    CompletedDays: string[];
    StartAt: string;
    LastActivityAt: string;
}
