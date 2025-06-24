// hooks/useScreenTracking.ts

import { useEffect } from 'react';

import { useGlobalSearchParams, useLocalSearchParams, usePathname } from 'expo-router';

import { usePostHog } from 'posthog-react-native';

type AllowedParams = {
    [key: string]: string[];
};

const ALLOWED_ROUTE_PARAMS: AllowedParams = {
    '/workouts/workout-details': ['workoutId', 'source'],
    '/workouts/all-workouts': ['source'],
    '/programs/program-day': ['programId', 'dayId', 'source'],
    '/programs/program-overview': ['programId', 'source'],
    '/programs/exercise-details': ['exerciseId'],
};

export function useScreenTracking() {
    const pathname = usePathname();
    const localParams = useLocalSearchParams();
    const globalParams = useGlobalSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
        if (!posthog) return;

        // Combine both local and global params
        const params = {
            ...globalParams,
            ...localParams,
        };

        const allowedParams = ALLOWED_ROUTE_PARAMS[pathname] || [];

        const trackedParams = allowedParams.reduce(
            (acc, paramName) => {
                const value = params[paramName];
                if (value !== undefined && value !== '') {
                    acc[paramName] = value;
                }
                return acc;
            },
            {} as Record<string, unknown>,
        );

        posthog.capture('$screen', {
            $screen_name: pathname,
            ...(Object.keys(trackedParams).length > 0 && { route_params: trackedParams }),
        });
        // Set screen name globally for all subsequent events
        posthog.register({
            $screen_name: pathname,
        });
    }, [pathname, localParams, globalParams, posthog]);
}
