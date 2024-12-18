// hooks/useScreenTracking.ts

import { useEffect } from 'react';
import { useLocalSearchParams, usePathname, useSegments, useGlobalSearchParams } from 'expo-router';
import { usePostHog } from 'posthog-react-native';

type AllowedParams = {
    [key: string]: string[];
};

const ALLOWED_ROUTE_PARAMS: AllowedParams = {
    '/workouts/workout-details': ['workoutId'],
    '/programs/program-day': ['programId', 'dayId'],
    '/programs/program-overview': ['programId'],
    '/programs/exercise-details': ['exercise'],
};

export function useScreenTracking() {
    const pathname = usePathname();
    const segments = useSegments();
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

        // console.log('Tracking Debug:', {
        //   pathname,
        //   segments,
        //   localParams,
        //   globalParams,
        //   combinedParams: params
        // });

        const allowedParams = ALLOWED_ROUTE_PARAMS[pathname] || [];

        const trackedParams = allowedParams.reduce((acc, paramName) => {
            const value = params[paramName];
            if (value !== undefined && value !== '') {
                acc[paramName] = value;
            }
            return acc;
        }, {} as Record<string, unknown>);

        posthog.capture('$screen', {
            $screen_name: pathname,
            ...(Object.keys(trackedParams).length > 0 && { route_params: trackedParams }),
        });
    }, [pathname, localParams, globalParams, posthog]);
}
