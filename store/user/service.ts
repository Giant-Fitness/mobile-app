// store/user/service.ts

import { UserProgramProgress, User } from '@/types';
import { sampleUserProgress, sampleUser } from '@/store/user/mockData';
import axios from 'axios';

const API_BASE_URL = 'https://r5oibllip9.execute-api.ap-south-1.amazonaws.com/prod';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a random delay between 200ms and 1000ms
const simulateNetworkDelay = async () => {
    const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
    await delay(randomDelay);
};

const getUser = async (): Promise<User> => {
    console.log('service: getUser');
    await simulateNetworkDelay();
    return sampleUser;
};

const getUserProgramProgress = async (userId: string): Promise<UserProgramProgress> => {
    console.log('service: getUserProgramProgress');
    try {
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/programprogress`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.programProgress;
    } catch (error) {
        console.error(`Error fetching programprogress for user ${userId}:`, error);
        throw error;
    }
};

const completeDay = async (userId: string, dayId: string): Promise<UserProgramProgress> => {
    console.log('service: completeDay');
    try {
        const response = await axios.put(
            `${API_BASE_URL}/users/${userId}/programprogress/complete-day`,
            { dayId },
            {
                timeout: 10000, // 10 seconds timeout
                timeoutErrorMessage: 'Request timed out after 10 seconds',
            },
        );

        let programProgress;
        if (typeof response.data === 'string') {
            const parsedData = JSON.parse(response.data);
            programProgress = parsedData.body ? JSON.parse(parsedData.body).programProgress : parsedData.programProgress;
        } else if (response.data.body && typeof response.data.body === 'string') {
            programProgress = JSON.parse(response.data.body).programProgress;
        } else {
            programProgress = response.data.body ? response.data.body.programProgress : response.data.programProgress;
        }

        if (!programProgress) {
            throw new Error('Program progress not found in response');
        }
        return programProgress;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                console.error('Request timed out:', error.message);
            } else {
                console.error('Axios error:', error.message);
                console.error('Response:', error.response ? JSON.stringify(error.response.data, null, 2) : 'No response');
            }
        } else {
            console.error('Unknown error:', error);
        }
        throw error;
    }
};

export default {
    getUserProgramProgress,
    getUser,
    completeDay,
};
