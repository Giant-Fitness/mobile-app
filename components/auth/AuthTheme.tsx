// components/auth/AuthTheme.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Theme } from '@aws-amplify/ui-react-native';
import { StyleSheet } from 'react-native';
import { Spaces } from '@/constants/Spaces';

export const useAuthTheme = (): Theme => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return {
        tokens: {
            colors: {
                font: {
                    primary: themeColors.text,
                    secondary: themeColors.subText,
                    interactive: themeColors.accent,
                    disabled: themeColors.systemBorderColor,
                    inverse: themeColors.background,
                },
                background: {
                    primary: themeColors.background,
                    secondary: themeColors.backgroundSecondary,
                    tertiary: themeColors.backgroundTertiary,
                },
                brand: {
                    primary: {
                        10: themeColors.accent,
                        20: themeColors.accent,
                        40: themeColors.accent,
                        60: themeColors.accent,
                        80: themeColors.accent,
                        90: themeColors.accent,
                        100: themeColors.accent,
                    },
                },
                border: {
                    primary: themeColors.systemBorderColor,
                    secondary: themeColors.backgroundSecondary,
                    tertiary: themeColors.backgroundTertiary,
                    pressed: themeColors.subText,
                    focus: themeColors.accent,
                    error: themeColors.red,
                },
            },
            borderWidths: {
                small: '1px',
                medium: '2px',
                large: '4px',
            },
            fontSizes: {
                xxs: '12px',
                xs: '13px',
                small: '14px',
                medium: '16px',
                large: '18px',
                xl: '20px',
                xxl: '24px',
                xxxl: '32px',
            },
            fontWeights: {
                lighter: '200',
                light: '300',
                normal: '400',
                semibold: '600',
                bold: '700',
                bolder: '900',
            },
            opacities: {
                0: '0',
                10: '0.1',
                20: '0.2',
                30: '0.3',
                40: '0.4',
                50: '0.5',
                60: '0.6',
                70: '0.7',
                80: '0.8',
                90: '0.9',
                100: '1',
            },
            radii: {
                xs: '4px',
                small: '8px',
                medium: '12px',
                large: '16px',
                xl: '24px',
                xxl: '32px',
                xxxl: '48px',
            },
            space: {
                xs: '4px',
                small: '8px',
                medium: '16px',
                large: '24px',
                xl: '32px',
                xxl: '48px',
                xxxl: '64px',
            },
            time: {
                short: '100ms',
                medium: '250ms',
                long: '500ms',
            },
        },
        components: {
            button: {
                container: {
                    width: '95%',
                    paddingVertical: Spaces.MD,
                    paddingHorizontal: Spaces.LG,
                    borderRadius: Spaces.XXXL,
                    alignItems: 'center',
                    alignSelf: 'center',
                    justifyContent: 'center',
                },
                containerPrimary: {
                    backgroundColor: themeColors.containerHighlight,
                },
                containerDefault: {
                    backgroundColor: themeColors.background,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: themeColors.systemBorderColor,
                },
                containerLink: {
                    backgroundColor: 'transparent',
                },
                disabled: {
                    opacity: 0.8,
                },
                pressed: {
                    opacity: 0.9,
                },
                text: {
                    fontSize: 16,
                    fontWeight: '400',
                },
                textPrimary: {
                    color: themeColors.highlightContainerText,
                },
                textDefault: {
                    color: themeColors.text,
                },
                textLink: {
                    fontSize: 14,
                    color: themeColors.subText,
                },
            },
            textField: {
                container: {
                    width: '95%', // Match button width
                    marginBottom: Spaces.MD,
                    alignSelf: 'center', // Center the container
                },
                field: {
                    paddingVertical: Spaces.SM + Spaces.XS,
                    paddingHorizontal: Spaces.LG,
                    fontSize: 14,
                    color: themeColors.text,
                },
                fieldContainer: {
                    backgroundColor: themeColors.background,
                    borderWidth: 0,
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderColor: themeColors.systemBorderColor,
                    borderRadius: Spaces.SM,
                },
                error: {
                    borderColor: themeColors.red,
                },
                disabled: {
                    opacity: 0.5,
                },
                label: {
                    color: themeColors.subText,
                    fontSize: 14,
                    marginBottom: Spaces.XS,
                },
            },
            passwordField: {
                container: {
                    width: '95%',
                    marginBottom: Spaces.MD,
                    alignSelf: 'center',
                },
                field: {
                    flex: 1,
                    paddingVertical: Spaces.SM + Spaces.XS,
                    paddingHorizontal: Spaces.LG,
                    fontSize: 14,
                    color: themeColors.subTextSecondary,
                },
                fieldContainer: {
                    backgroundColor: themeColors.background,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: themeColors.systemBorderColor,
                    borderRadius: Spaces.SM,
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: '100%',
                },
                error: {
                    borderColor: themeColors.red,
                },
                disabled: {
                    opacity: 0.5,
                },
                label: {
                    color: themeColors.subText,
                    fontSize: 14,
                    marginBottom: Spaces.XS,
                },
            },
            errorMessage: {
                container: {
                    width: '95%', // Match field width
                    marginTop: Spaces.XS,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center', // Center the container
                },
                icon: {
                    width: 16,
                    height: 16,
                    tintColor: themeColors.red,
                    marginRight: Spaces.XS,
                },
                label: {
                    color: themeColors.red,
                    fontSize: 12,
                },
            },
        },
    };
};
