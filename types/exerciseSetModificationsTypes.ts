// types/exerciseSetModificationsTypes.ts

/**
 * Represents an exercise set modification created by a user
 */
export interface UserExerciseSetModification {
    UserId: string;
    ModificationId: string;
    ExerciseId: string;
    ProgramId: string;
    OriginalSets: number;
    AdditionalSets: number;
    IsTemporary: boolean;
    TemporaryDate: string | null;
    CreatedAt: string;
    UpdatedAt: string;
}

/**
 * Parameters for creating a new set modification
 */
export interface CreateSetModificationParams {
    exerciseId: string;
    programId: string;
    originalSets: number;
    additionalSets: number;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

/**
 * Parameters for updating an existing set modification
 */
export interface UpdateSetModificationParams {
    additionalSets: number;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

/**
 * Parameters for fetching user set modifications
 */
export interface GetSetModificationsParams {
    programId?: string;
    includeTemporary?: boolean;
    date?: string;
}
