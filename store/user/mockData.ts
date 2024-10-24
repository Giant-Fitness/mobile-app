// store/user/mockData.ts

import { UserProgramProgress, User } from '@/types';

// Sample user
const sampleUser: User = {
    UserId: 'd91c85f4-c493-4d1c-b6bd-d493a3485bba',
    OnboardingStatus: {
        biodata: false,
        fitness: false,
        nutrition: false,
    },
};

// Sample user program progress
const sampleUserProgress: UserProgramProgress = {
    UserId: 'user1',
    ProgramId: '5097e8c0-71a3-438a-bb9c-d190678301be',
    CurrentDay: 4,
    CompletedDays: [1, 2, 3],
    StartAt: '2024-07-01',
    LastActivityAt: '2024-07-05',
};

export { sampleUserProgress, sampleUser };
