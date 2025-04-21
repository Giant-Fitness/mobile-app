// types/exerciseSubstitutionsTypes.ts

/**
 * Represents an exercise substitution created by a user
 */
export interface UserExerciseSubstitution {
    UserId: string;
    SubstitutionId: string;
    OriginalExerciseId: string;
    SubstituteExerciseId: string;
    ProgramId: string | null;
    IsTemporary: boolean;
    TemporaryDate: string | null;
    CreatedAt: string;
    UpdatedAt: string;
}

/**
 * Represents an alternative exercise suggestion from the system
 */
export interface ExerciseAlternative {
    ExerciseId: string;
    ExerciseName: string;
    MatchScore: number; // How well it matches the original (0-100)
    EquipmentRequired: string[];
    MuscleGroups: {
        Primary: string[];
        Secondary: string[];
    };
    Category: string;
}

/**
 * Parameters for creating a new substitution
 */
export interface CreateSubstitutionParams {
    originalExerciseId: string;
    substituteExerciseId: string;
    programId?: string | null;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

/**
 * Parameters for updating an existing substitution
 */
export interface UpdateSubstitutionParams {
    substituteExerciseId: string;
    isTemporary?: boolean;
    temporaryDate?: string | null;
}

/**
 * Parameters for fetching user substitutions
 */
export interface GetSubstitutionsParams {
    programId?: string;
    includeTemporary?: boolean;
    date?: string;
}
