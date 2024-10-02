// store/workouts/service.ts

import { Workout, WorkoutRecommendations } from '@/types';
import { sampleWorkouts, sampleSpotlightRecommendations } from '@/store/workouts/mockData';
import axios from 'axios';

const API_BASE_URL = 'https://r5oibllip9.execute-api.ap-south-1.amazonaws.com/prod';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a random delay between 200ms and 1000ms
const simulateNetworkDelay = async () => {
    const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
    await delay(randomDelay);
};

const getAllWorkouts = async (): Promise<Workout[]> => {
    console.log('service: getAllWorkouts');
    try {
        const response = await axios.get(`${API_BASE_URL}/workouts`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.workouts || [];
    } catch (error) {
        console.error('Error fetching all workouts:', error);
        throw error;
    }
};

const getWorkout = async (workoutId: string): Promise<Workout | undefined> => {
    console.log('service: getWorkout');
    try {
        const response = await axios.get(`${API_BASE_URL}/workouts/${workoutId}`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.workout;
    } catch (error) {
        console.error(`Error fetching workout ${workoutId}:`, error);
        throw error;
    }
};

const getWorkouts = async (workoutIds: string[]): Promise<Workout[]> => {
    console.log('service: getWorkouts');
    try {
        const workoutIdsString = workoutIds.join(',');
        const response = await axios.get(`${API_BASE_URL}/workouts/batch`, {
            params: {
                workoutIds: workoutIdsString,
            },
        });
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody.workouts || [];
    } catch (error) {
        console.error('Error fetching multiple workouts:', error);
        throw error;
    }
};

const getSpotlightWorkouts = async (): Promise<WorkoutRecommendations> => {
    console.log('service: getSpotlightWorkouts');
    try {
        const response = await axios.get(`${API_BASE_URL}/recommendations/workouts/spotlight`);
        const parsedBody = JSON.parse(response.data.body);
        return parsedBody;
    } catch (error) {
        console.error('Error fetching spotlight workouts:', error);
        throw error;
    }
};

export default {
    getAllWorkouts,
    getWorkout,
    getWorkouts,
    getSpotlightWorkouts,
};
