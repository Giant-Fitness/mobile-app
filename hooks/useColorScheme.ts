// hooks/useColorScheme.ts
import { useColorScheme as useSystemColorScheme } from 'react-native';

export const useColorScheme = () => {
    // return useSystemColorScheme(); // This is typically 'light' or 'dark'
    return 'light';
};
