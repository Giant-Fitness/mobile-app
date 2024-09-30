// store/programs/service.ts

import { Program, ProgramDay } from '@/types';
import { sampleProgramDays, mockPrograms } from '@/store/programs/mockData';
import axios from 'axios';

const API_BASE_URL = 'https://5kwqdlbqo5.execute-api.ap-south-1.amazonaws.com/prod';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a random delay between 200ms and 1000ms
const simulateNetworkDelay = async () => {
    const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
    await delay(randomDelay);
};

const getAllPrograms = async (): Promise<Program[]> => {
    console.log('service: getAllPrograms');
    try {
        const response = await axios.get(`${API_BASE_URL}/programs`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.programs || [];
    } catch (error) {
        console.error('Error fetching all programs:', error);
        throw error;
    }
};

const getProgram = async (programId: string): Promise<Program | undefined> => {
    console.log('service: getProgram');
    try {
        const response = await axios.get(`${API_BASE_URL}/programs/${programId}`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.program;
    } catch (error) {
        console.error(`Error fetching program ${programId}:`, error);
        throw error;
    }
};

const getProgramDay = async (programId: string, dayId: string): Promise<ProgramDay | undefined> => {
    console.log('service: getProgramDay');
    try {
        const response = await axios.get(`${API_BASE_URL}/programs/${programId}/days/${dayId}`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.programDay;
    } catch (error) {
        console.error(`Error fetching programDay ${programId} ${dayId}:`, error);
        throw error;
    }
};

const getProgramDaysAll = async (programId: string): Promise<ProgramDay[]> => {
    console.log('service: getProgramDaysAll');
    try {
        const response = await axios.get(`${API_BASE_URL}/programs/${programId}/days`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.programDays || [];
    } catch (error) {
        console.error(`Error fetching programDays ${programId}:`, error);
        throw error;
    }
};

const getProgramDaysFiltered = async (programId: string, dayIds: string[]): Promise<ProgramDay[]> => {
    console.log('service: getProgramDaysFiltered');
    return filteredDays.sort((a, b) => parseInt(a.DayId) - parseInt(b.DayId));
    try {
        const dayIdsString = dayIds.join(',');
        const response = await axios.get(`${API_BASE_URL}/programs/${programId}/days/batch`, {
            params: {
                dayIds: dayIdsString,
            },
        });
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.programDays || [];
    } catch (error) {
        console.error('Error fetching multiple program days:', error);
        throw error;
    }
};

export default {
    getAllPrograms,
    getProgram,
    getProgramDaysAll,
    getProgramDay,
    getProgramDaysFiltered,
};
