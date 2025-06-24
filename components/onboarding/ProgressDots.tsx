// components/onboarding/ProgressDots.tsx

import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProgressDotsProps {
    total: number;
    current: number;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({ total, current }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            {Array.from({ length: total }, (_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        {
                            backgroundColor: themeColors.systemBorderColor,
                            borderColor: themeColors.systemBorderColor,
                            ...(index === current && { backgroundColor: themeColors.text }), // Current dot
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spaces.XL,
    },
    dot: {
        width: Spaces.SM,
        height: Spaces.SM,
        borderRadius: Spaces.SM,
        borderWidth: StyleSheet.hairlineWidth,
    },
});
