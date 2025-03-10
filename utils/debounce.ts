import { Href, Router } from 'expo-router';

let isNavigating = false;

export const debounce = (router: Router, path: Href<string | object>, debounceTime: number = 1000) => {
    if (!isNavigating) {
        isNavigating = true;
        router.push(path);
        setTimeout(() => {
            isNavigating = false;
        }, debounceTime);
    }
};
