// hooks/useSplashScreen.ts

import { REQUEST_STATE } from '@/constants/requestStates';
import { useEffect, useRef, useState } from 'react';

interface UseSplashScreenProps {
    dataLoadedState: REQUEST_STATE;
    minimumDisplayTime?: number;
}

export const useSplashScreen = ({ dataLoadedState, minimumDisplayTime = 3000 }: UseSplashScreenProps) => {
    const [showSplash, setShowSplash] = useState(dataLoadedState !== REQUEST_STATE.FULFILLED);
    const [dataLoaded, setDataLoaded] = useState(dataLoadedState === REQUEST_STATE.FULFILLED);
    const splashStartTime = useRef<number | null>(null);
    const hasLoadedOnceRef = useRef(false); // Track if we've ever loaded successfully
    const initialRender = useRef(true);

    useEffect(() => {
        // Handle initial render
        if (initialRender.current) {
            initialRender.current = false;
            if (dataLoadedState === REQUEST_STATE.FULFILLED) {
                hasLoadedOnceRef.current = true;
                setShowSplash(false);
                setDataLoaded(true);
                return;
            }
            // Start timing for splash
            splashStartTime.current = Date.now();
        }

        // If we've loaded successfully once, never show splash again
        // This prevents splash during background refreshes
        if (hasLoadedOnceRef.current) {
            // Update dataLoaded state but don't show splash
            if (dataLoadedState === REQUEST_STATE.FULFILLED) {
                setDataLoaded(true);
            }
            return;
        }

        // First-time loading states
        if (dataLoadedState === REQUEST_STATE.IDLE || dataLoadedState === REQUEST_STATE.PENDING) {
            if (!splashStartTime.current) {
                splashStartTime.current = Date.now();
            }
            setShowSplash(true);
            setDataLoaded(false);
        } else if (dataLoadedState === REQUEST_STATE.FULFILLED) {
            hasLoadedOnceRef.current = true; // Mark as loaded
            setDataLoaded(true);
        } else if (dataLoadedState === REQUEST_STATE.REJECTED) {
            const timeElapsed = splashStartTime.current ? Date.now() - splashStartTime.current : 0;
            const remainingTime = Math.max(0, minimumDisplayTime - timeElapsed);
            setTimeout(() => {
                setShowSplash(false);
            }, remainingTime);
        }
    }, [dataLoadedState, minimumDisplayTime]);

    // Handle minimum display time
    useEffect(() => {
        if (dataLoaded && showSplash && !hasLoadedOnceRef.current) {
            const currentTime = Date.now();
            const elapsedTime = splashStartTime.current ? currentTime - splashStartTime.current : 0;
            const remainingTime = Math.max(0, minimumDisplayTime - elapsedTime);
            setTimeout(() => {
                setShowSplash(false);
            }, remainingTime);
        }
    }, [dataLoaded, showSplash, minimumDisplayTime]);

    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    return {
        showSplash,
        dataLoaded,
        handleSplashComplete,
    };
};
