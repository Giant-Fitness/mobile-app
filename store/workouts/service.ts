// store/workouts/service.ts

import { Workout } from '@/types';
import { sampleWorkouts } from '@/store/workouts/mockData';

// Utility function to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Simulate a random delay between 200ms and 1000ms
const simulateNetworkDelay = async () => {
    const randomDelay = Math.floor(Math.random() * (1000 - 200 + 1) + 200);
    await delay(randomDelay);
};

const getAllWorkouts = async (): Promise<Workout[]> => {
    console.log('service: getAllWorkouts');
    await simulateNetworkDelay();
    return sampleWorkouts;
};

const getWorkout = async (workoutId: string): Promise<Workout | undefined> => {
    console.log('service: getWorkout');
    await simulateNetworkDelay();
    return sampleWorkouts.find((workout) => workout.WorkoutId === workoutId);
};

export default {
    getAllWorkouts,
    getWorkout,
};
