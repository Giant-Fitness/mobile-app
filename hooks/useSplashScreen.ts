// hooks/useSplashScreen.ts

// hooks/useSplashScreen.ts
import { REQUEST_STATE } from '@/constants/requestStates';
import { useEffect, useRef, useState } from 'react';

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
        } else if (dataLoadedState === REQUEST_STATE.REJECTED) {
            const timeElapsed = splashStartTime.current ? Date.now() - splashStartTime.current : 0;
            const remainingTime = Math.max(0, 3000 - timeElapsed);
            setTimeout(() => {
                setShowSplash(false);
            }, remainingTime);
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
