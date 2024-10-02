// types/userTypes.ts

export interface User {
    UserId: string;
}

export interface UserProgramProgress {
    UserId: string;
    ProgramId: number;
    CurrentDay: number;
    CompletedDays: string[];
    StartAt: string;
    LastActivityAt: string;
}
