// hooks/useThemeColor.ts

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define type for the props object
interface ThemeProps {
    light?: string;
    dark?: string;
}

export function useThemeColor(
    props: ThemeProps,
    colorName: keyof typeof Colors.light, // Use only keyof typeof Colors.light, it's enough for both themes
) {
    const colorScheme = useColorScheme();

    // Safely assign theme as 'light' or 'dark' using a conditional
    const theme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';

    // Explicitly cast theme to 'light' or 'dark'
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    }

    // Access theme color using the ensured type of 'theme'
    return Colors[theme][colorName];
}
