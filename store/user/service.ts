// store/user/service.ts

import { UserProgramProgress } from '@/types';
import { sampleUserProgress } from '@/store/user/mockData';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a random delay between 200ms and 1000ms
const simulateNetworkDelay = async () => {
    const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
    await delay(randomDelay);
};

const getUserProgramProgress = async (): Promise<UserProgramProgress> => {
    console.log('service: getUserProgramProgress');
    await simulateNetworkDelay();
    return sampleUserProgress;
};

export default {
    getUserProgramProgress,
};
