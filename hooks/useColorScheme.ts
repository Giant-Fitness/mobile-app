// hooks/useColorScheme.ts

import { useColorScheme as useSystemColorScheme } from 'react-native';

export const useColorScheme = () => {
    return 'light' || useSystemColorScheme();
};
