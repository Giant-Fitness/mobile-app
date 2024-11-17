// store/programs/service.ts

import { Program, ProgramDay } from '@/types';
import { authApiClient } from '@/utils/api/apiConfig';
import { handleApiError } from '@/utils/api/errorUtils';

const getAllPrograms = async (): Promise<Program[]> => {
    console.log('service: getAllPrograms');
    try {
        const { data } = await authApiClient.get('/programs');
        return data.programs || [];
    } catch (error) {
        throw handleApiError(error, 'GetAllPrograms');
    }
};

const getProgram = async (programId: string): Promise<Program | undefined> => {
    console.log('service: getProgram');
    try {
        const { data } = await authApiClient.get(`/programs/${programId}`);
        return data.program;
    } catch (error) {
        throw handleApiError(error, 'GetProgram');
    }
};

const getProgramDay = async (programId: string, dayId: string): Promise<ProgramDay | undefined> => {
    console.log('service: getProgramDay');
    try {
        const { data } = await authApiClient.get(`/programs/${programId}/days/${dayId}`);
        return data.programDay;
    } catch (error) {
        throw handleApiError(error, 'GetProgramDay');
    }
};

const getProgramDaysAll = async (programId: string): Promise<ProgramDay[]> => {
    console.log('service: getProgramDaysAll');
    try {
        const { data } = await authApiClient.get(`/programs/${programId}/days`);
        return data.programDays || [];
    } catch (error) {
        throw handleApiError(error, 'GetProgramDaysAll');
    }
};

const getProgramDaysFiltered = async (programId: string, dayIds: string[]): Promise<ProgramDay[]> => {
    console.log('service: getProgramDaysFiltered');
    try {
        const { data } = await authApiClient.get(`/programs/${programId}/days/batch`, {
            params: {
                dayIds: dayIds.join(','),
            },
        });
        return data.programDays || [];
    } catch (error) {
        throw handleApiError(error, 'GetProgramDaysFiltered');
    }
};

export default {
    getAllPrograms,
    getProgram,
    getProgramDaysAll,
    getProgramDay,
    getProgramDaysFiltered,
};
