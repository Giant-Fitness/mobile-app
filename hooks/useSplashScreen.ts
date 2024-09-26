// hooks/useSplashScreen.ts

// hooks/useSplashScreen.ts
import { useState, useEffect, useRef } from 'react';
import { REQUEST_STATE } from '@/constants/requestStates';

interface UseSplashScreenProps {
    dataLoadedState: REQUEST_STATE;
}

export const useSplashScreen = ({ dataLoadedState }: UseSplashScreenProps) => {
    const [showSplash, setShowSplash] = useState(dataLoadedState !== REQUEST_STATE.FULFILLED);
    const [dataLoaded, setDataLoaded] = useState(dataLoadedState === REQUEST_STATE.FULFILLED);
    const splashStartTime = useRef<number | null>(null);
    const initialRender = useRef(true);

    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            if (dataLoadedState === REQUEST_STATE.FULFILLED) {
                setShowSplash(false);
                return;
            }
        }

        if (dataLoadedState === REQUEST_STATE.IDLE || dataLoadedState === REQUEST_STATE.PENDING) {
            splashStartTime.current = Date.now();
            setShowSplash(true);
            setDataLoaded(false);
        } else if (dataLoadedState === REQUEST_STATE.FULFILLED) {
            setDataLoaded(true);
        }
    }, [dataLoadedState]);

    useEffect(() => {
        if (dataLoaded && showSplash) {
            const currentTime = Date.now();
            const elapsedTime = splashStartTime.current ? currentTime - splashStartTime.current : 0;
            const remainingTime = Math.max(0, 3000 - elapsedTime);
            setTimeout(() => {
                setShowSplash(false);
            }, remainingTime);
        }
    }, [dataLoaded, showSplash]);

    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    return {
        showSplash,
        dataLoaded,
        handleSplashComplete,
    };
};
