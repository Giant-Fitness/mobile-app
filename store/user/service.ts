// store/user/service.ts

import { UserProgramProgress, User, UserRecommendations, UserFitnessProfile, UserWeightMeasurement } from '@/types';
import axios, { AxiosInstance } from 'axios';
import { authService } from '@/utils/auth';

const API_BASE_URL = 'https://r5oibllip9.execute-api.ap-south-1.amazonaws.com/prod';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Create axios instance with interceptors
const createAuthenticatedAxios = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        timeoutErrorMessage: 'Request timed out after 10 seconds',
    });

    // Add auth token to requests
    instance.interceptors.request.use(async (config) => {
        const token = await authService.getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return instance;
};

const api = createAuthenticatedAxios();

// Helper to handle API response parsing
const parseResponse = (response: any) => {
    if (typeof response.data === 'string') {
        const parsedData = JSON.parse(response.data);
        return parsedData.body ? JSON.parse(parsedData.body) : parsedData;
    } else if (response.data.body && typeof response.data.body === 'string') {
        return JSON.parse(response.data.body);
    }
    return response.data.body || response.data;
};

// Error handling helper
const handleAxiosError = (error: any) => {
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
};

const getUser = async (): Promise<User> => {
    console.log('service: getUser');
    const userId = await authService.getUserId();
    // const userId = 'c1e39dca-a0e1-702b-1b39-1dcc09779731'

    try {
        const response = await api.get(`/users/${userId}`);
        const parsedBody = parseResponse(response);
        return parsedBody.user;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
    }
};

const getUserFitnessProfile = async (userId: string): Promise<UserFitnessProfile> => {
    console.log('service: getUserFitnessProfile');
    try {
        // const userId = await authService.getUserId();
        if (!userId) throw new Error('No user ID found');

        const response = await api.get(`/users/${userId}/fitnessprofile`);
        const result = parseResponse(response);

        if (!result.userFitnessProfile) {
            throw new Error('Invalid response format');
        }

        return result.userFitnessProfile;
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};

const updateUserFitnessProfile = async (
    userId: string,
    userFitnessProfile: UserFitnessProfile,
): Promise<{ user: User; userRecommendations: UserRecommendations; userFitnessProfile: UserFitnessProfile }> => {
    console.log('service: updateUserFitnessProfile');
    try {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}/fitnessprofile`, userFitnessProfile, {
            timeout: 10000,
            timeoutErrorMessage: 'Request timed out after 10 seconds',
        });

        let result;
        if (typeof response.data === 'string') {
            const parsedData = JSON.parse(response.data);
            result = parsedData.body ? JSON.parse(parsedData.body) : parsedData;
        } else if (response.data.body && typeof response.data.body === 'string') {
            result = JSON.parse(response.data.body);
        } else {
            result = response.data.body || response.data;
        }

        if (!result.user || !result.userRecommendations || !result.userFitnessProfile) {
            throw new Error('Invalid response format');
        }

        return {
            user: result.user,
            userRecommendations: result.userRecommendations,
            userFitnessProfile: result.userFitnessProfile,
        };
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

const getUserRecommendations = async (userId: string): Promise<UserRecommendations> => {
    console.log('service: getUserRecommendations');
    try {
        const response = await axios.get(`${API_BASE_URL}/recommendations/personalized/${userId}`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.userRecommendations;
    } catch (error) {
        console.error(`Error fetching recommendations for user ${userId}:`, error);
        throw error;
    }
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

        let programProgress, programCompleted;
        if (typeof response.data === 'string') {
            const parsedData = JSON.parse(response.data);
            programProgress = parsedData.body ? JSON.parse(parsedData.body).programProgress : parsedData.programProgress;
            programCompleted = parsedData.body ? JSON.parse(parsedData.body).programCompleted : parsedData.programCompleted;
        } else if (response.data.body && typeof response.data.body === 'string') {
            programProgress = JSON.parse(response.data.body).programProgress;
            programCompleted = JSON.parse(response.data.body).programCompleted;
        } else {
            programProgress = response.data.body ? response.data.body.programProgress : response.data.programProgress;
            programCompleted = response.data.body ? response.data.body.programCompleted : response.data.programCompleted;
        }

        if (!programProgress) {
            throw new Error('Program progress not found in response');
        }

        if (!programCompleted) {
            return programProgress;
        } else {
            return {};
        }
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

const uncompleteDay = async (userId: string, dayId: string): Promise<UserProgramProgress> => {
    console.log('service: uncompleteDay');
    try {
        const response = await axios.put(
            `${API_BASE_URL}/users/${userId}/programprogress/uncomplete-day`,
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

const endProgram = async (userId: string): Promise<UserProgramProgress> => {
    console.log('service: endProgram');
    try {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}/programprogress/end`, {
            timeout: 10000, // 10 seconds timeout
            timeoutErrorMessage: 'Request timed out after 10 seconds',
        });

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

const startProgram = async (userId: string, programId: string): Promise<UserProgramProgress> => {
    console.log('service: startProgram');
    try {
        const response = await axios.post(
            `${API_BASE_URL}/users/${userId}/programprogress`,
            { programId },
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

const resetProgram = async (userId: string): Promise<UserProgramProgress> => {
    console.log('service: resetProgram');
    try {
        const response = await axios.put(`${API_BASE_URL}/users/${userId}/programprogress/reset`, {
            timeout: 10000, // 10 seconds timeout
            timeoutErrorMessage: 'Request timed out after 10 seconds',
        });

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

const getWeightMeasurements = async (userId: string): Promise<UserWeightMeasurement[]> => {
    console.log('service: getWeightMeasurements');
    try {
        const response = await api.get(`/users/${userId}/weight-measurements`);
        const result = parseResponse(response);
        return result.measurements || [];
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};

const logWeightMeasurement = async (userId: string, weight: number, measurementTimestamp?: string): Promise<UserWeightMeasurement> => {
    console.log('service: logWeightMeasurement');
    try {
        const payload = {
            weight,
            ...(measurementTimestamp && { measurementTimestamp }),
        };
        const response = await api.post(`/users/${userId}/weight-measurements`, payload);
        const result = parseResponse(response);
        return result.measurements;
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};

const updateWeightMeasurement = async (userId: string, timestamp: string, weight: number): Promise<UserWeightMeasurement> => {
    console.log('service: updateWeightMeasurement');
    try {
        const query = `/users/${userId}/weight-measurements/${timestamp}`;
        const response = await api.put(query, { weight });
        const result = parseResponse(response);
        return result.measurement;
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};

const deleteWeightMeasurement = async (userId: string, timestamp: string): Promise<void> => {
    console.log('service: deleteWeightMeasurement');
    try {
        await api.delete(`/users/${userId}/weight-measurements/${timestamp}`);
    } catch (error) {
        handleAxiosError(error);
        throw error;
    }
};

export default {
    getUser,
    getUserFitnessProfile,
    updateUserFitnessProfile,
    getUserRecommendations,
    getUserProgramProgress,
    completeDay,
    uncompleteDay,
    endProgram,
    startProgram,
    resetProgram,
    getWeightMeasurements,
    logWeightMeasurement,
    updateWeightMeasurement,
    deleteWeightMeasurement,
};
