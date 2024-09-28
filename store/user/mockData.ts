// store/user/mockData.ts

import { UserProgramProgress } from '@/types';

// Sample user program progress
const sampleUserProgress: UserProgramProgress = {
    UserId: 'user1',
    ProgramId: 'program1',
    CurrentDay: '4',
    CompletedDays: ['1', '2', '3'],
    StartAt: '2024-07-01',
    LastActivityAt: '2024-07-05',
};

export { sampleUserProgress };
