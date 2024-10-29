// components/auth/AuthTheme.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export const useAuthTheme = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return {
        tokens: {
            colors: {
                background: {
                    primary: themeColors.background,
                    secondary: themeColors.backgroundSecondary,
                },
                brand: {
                    primary: {
                        10: themeColors.accent + '19',
                        20: themeColors.accent + '33',
                        40: themeColors.accent + '66',
                        60: themeColors.accent + '99',
                        80: themeColors.accent + 'CC',
                        90: themeColors.accent + 'E6',
                        100: themeColors.accent,
                    },
                },
                font: {
                    interactive: themeColors.accent,
                    primary: themeColors.text,
                    secondary: themeColors.subText,
                    disabled: themeColors.systemBorderColor,
                },
                border: {
                    primary: themeColors.systemBorderColor,
                    secondary: themeColors.backgroundSecondary,
                    pressed: themeColors.subText,
                },
            },
            components: {
                button: {
                    primary: {
                        backgroundColor: themeColors.accent,
                        color: themeColors.background,
                    },
                    secondary: {
                        backgroundColor: themeColors.background,
                        color: themeColors.text,
                    },
                },
                fieldcontrol: {
                    small: {
                        borderWidth: '1px',
                        fontSize: '14px',
                    },
                    large: {
                        borderWidth: '2px',
                        fontSize: '18px',
                    },
                },
            },
        },
    };
};
