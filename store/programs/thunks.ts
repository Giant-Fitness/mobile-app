// store/programs/thunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import ProgramService from '@/store/programs/service';
import { Program, ProgramDay } from '@/types';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { cacheService, CacheTTL } from '@/utils/cache';

export const getAllProgramsAsync = createAsyncThunk<Program[], { forceRefresh?: boolean; useCache?: boolean } | void>(
    'programs/getAllPrograms',
    async (args = {}, { getState }) => {
        const { forceRefresh = false, useCache = true } = typeof args === 'object' ? args : {};

        const state = getState() as RootState;

        // If programs are already loaded and not forcing refresh, return them
        if (state.programs.allProgramsState === REQUEST_STATE.FULFILLED && !forceRefresh) {
            return Object.values(state.programs.programs);
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cached = await cacheService.get<Program[]>('all_programs');
            const isExpired = await cacheService.isExpired('all_programs');

            if (cached && !isExpired) {
                console.log('Loaded programs from cache');
                return cached;
            }
        }

        // Load from API
        console.log('Loading programs from API');
        const programs = await ProgramService.getAllPrograms();

        // Cache the result if useCache is enabled
        if (useCache) {
            await cacheService.set('all_programs', programs, CacheTTL.VERY_LONG);
        }

        return programs;
    },
);

export const getProgramAsync = createAsyncThunk<Program | undefined, { programId: string; forceRefresh?: boolean; useCache?: boolean }, { state: RootState }>(
    'programs/getProgram',
    async ({ programId, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
        const state = getState();
        const existingProgram = state.programs.programs[programId];

        // If already exists and not forcing refresh, return it
        if (existingProgram && !forceRefresh) {
            return existingProgram;
        }

        // Try cache first if enabled and not forcing refresh
        if (useCache && !forceRefresh) {
            const cacheKey = `program_${programId}`;
            const cached = await cacheService.get<Program>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                console.log(`Loaded program ${programId} from cache`);
                return cached;
            }
        }

        // Load from API
        console.log(`Loading program ${programId} from API`);
        const program = await ProgramService.getProgram(programId);
        if (!program) {
            return rejectWithValue('Program not found.');
        }

        // Cache the result if useCache is enabled
        if (useCache) {
            const cacheKey = `program_${programId}`;
            await cacheService.set(cacheKey, program, CacheTTL.VERY_LONG);
        }

        return program;
    },
);

export const getAllProgramDaysAsync = createAsyncThunk<ProgramDay[], { programId: string; forceRefresh?: boolean; useCache?: boolean }, { state: RootState }>(
    'programs/getAllProgramDays',
    async ({ programId, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const existingDays = state.programs.programDays[programId];
            const expectedDayCount = state.programs.programs[programId]?.Days;

            // If days are already loaded and not forcing refresh, return them
            if (!forceRefresh && existingDays && expectedDayCount && Object.keys(existingDays).length === expectedDayCount) {
                return Object.values(existingDays);
            }

            // Try cache first if enabled and not forcing refresh
            if (useCache && !forceRefresh) {
                const cacheKey = `program_days_${programId}`;
                const cached = await cacheService.get<ProgramDay[]>(cacheKey);
                const isExpired = await cacheService.isExpired(cacheKey);

                if (cached && !isExpired) {
                    console.log(`Loaded program days for ${programId} from cache`);
                    return cached;
                }
            }

            // Load from API
            console.log(`Loading program days for ${programId} from API`);
            const programDays = await ProgramService.getProgramDaysAll(programId);
            if (!programDays || programDays.length === 0) {
                return rejectWithValue('No program days found.');
            }

            // Cache the result if useCache is enabled
            if (useCache) {
                const cacheKey = `program_days_${programId}`;
                await cacheService.set(cacheKey, programDays, CacheTTL.VERY_LONG);
            }

            return programDays;
        } catch (error) {
            console.log(error);
            return rejectWithValue('Error fetching program days.');
        }
    },
);

export const getProgramDayAsync = createAsyncThunk<
    ProgramDay,
    { programId: string; dayId: string; forceRefresh?: boolean; useCache?: boolean },
    { state: RootState }
>('programs/getProgramDay', async ({ programId, dayId, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    const state = getState();
    // Check if the program day already exists in the state
    const existingDay = state.programs.programDays[programId]?.[dayId];

    // If already exists and not forcing refresh, return it
    if (existingDay && !forceRefresh) {
        return existingDay;
    }

    // Try cache first if enabled and not forcing refresh
    if (useCache && !forceRefresh) {
        const cacheKey = `program_day_${programId}_${dayId}`;
        const cached = await cacheService.get<ProgramDay>(cacheKey);
        const isExpired = await cacheService.isExpired(cacheKey);

        if (cached && !isExpired) {
            console.log(`Loaded program day ${programId}/${dayId} from cache`);
            return cached;
        }
    }

    // Load from API
    console.log(`Loading program day ${programId}/${dayId} from API`);
    const programDay = await ProgramService.getProgramDay(programId, dayId);
    if (!programDay) {
        return rejectWithValue('Program day not found.');
    }

    // Cache the result if useCache is enabled
    if (useCache) {
        const cacheKey = `program_day_${programId}_${dayId}`;
        await cacheService.set(cacheKey, programDay, CacheTTL.VERY_LONG);
    }

    return programDay;
});

export const getMultipleProgramDaysAsync = createAsyncThunk<
    ProgramDay[],
    { programId: string; dayIds: string[]; forceRefresh?: boolean; useCache?: boolean },
    { state: RootState }
>('programs/getMultipleProgramDays', async ({ programId, dayIds, forceRefresh = false, useCache = true }, { getState, rejectWithValue }) => {
    const state = getState();

    // If not forcing refresh, check for existing days in Redux first
    if (!forceRefresh) {
        const existingDays = dayIds.map((dayId) => state.programs.programDays[programId]?.[dayId]).filter((day) => day !== undefined);
        if (existingDays.length === dayIds.length) {
            // If all days exist in the state, return them
            return existingDays as ProgramDay[];
        }
    }

    // Check cache for missing days
    const missingDayIds = forceRefresh ? dayIds : dayIds.filter((dayId) => !state.programs.programDays[programId]?.[dayId]);
    const cachedDays: ProgramDay[] = [];
    const uncachedDayIds: string[] = [];

    if (useCache && !forceRefresh) {
        for (const dayId of missingDayIds) {
            const cacheKey = `program_day_${programId}_${dayId}`;
            const cached = await cacheService.get<ProgramDay>(cacheKey);
            const isExpired = await cacheService.isExpired(cacheKey);

            if (cached && !isExpired) {
                cachedDays.push(cached);
                console.log(`Loaded program day ${programId}/${dayId} from cache`);
            } else {
                uncachedDayIds.push(dayId);
            }
        }
    } else {
        uncachedDayIds.push(...missingDayIds);
    }

    // Fetch uncached days from API
    let fetchedDays: ProgramDay[] = [];
    if (uncachedDayIds.length > 0) {
        try {
            console.log(`Loading program days for ${programId} from API: ${uncachedDayIds.join(', ')}`);
            fetchedDays = await ProgramService.getProgramDaysFiltered(programId, uncachedDayIds);

            // Cache the fetched days if useCache is enabled
            if (useCache) {
                for (const day of fetchedDays) {
                    const cacheKey = `program_day_${programId}_${day.DayId}`;
                    await cacheService.set(cacheKey, day, CacheTTL.VERY_LONG);
                }
            }
        } catch (error) {
            console.log(error);
            return rejectWithValue('Error fetching program days.');
        }
    }

    // Combine existing (from Redux), cached, and newly fetched days
    const existingDays = forceRefresh
        ? []
        : (dayIds.map((dayId) => state.programs.programDays[programId]?.[dayId]).filter((day) => day !== undefined) as ProgramDay[]);
    const allDays = [...existingDays, ...cachedDays, ...fetchedDays];

    if (allDays.length === 0) {
        return rejectWithValue('Program days not found.');
    }

    return allDays;
});
