// components/progress/TrainingProgressCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProgramProgress } from '@/types';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

import { LinearProgressBar } from '../charts/LinearProgressBar';

interface TrainingProgressCardProps {
    activeProgram: any;
    userProgramProgress: UserProgramProgress;
    onPress: () => void;
    style?: any;
}

export const TrainingProgressCard: React.FC<TrainingProgressCardProps> = ({ activeProgram, userProgramProgress, onPress, style = {} }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handlePress = () => {
        trigger('impactLight');
        onPress();
    };

    // Calculate training progress data
    const totalDays = activeProgram?.Days || 0;
    const completedDays = userProgramProgress?.CompletedDays?.length || 0;
    const remainingDays = Math.max(0, totalDays - completedDays);

    // Calculate percentage
    const progressPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    // Calculate subtitle text
    const getSubtitleText = () => {
        if (remainingDays === 0 && totalDays > 0) {
            return 'Program completed!';
        } else if (remainingDays === 1) {
            return '1 day left';
        } else if (remainingDays > 1) {
            return `${remainingDays} days left`;
        } else if (totalDays === 0) {
            return 'No active program';
        } else {
            return `${completedDays}/${totalDays} days`;
        }
    };

    // Common divider styling for consistent placement
    const dividerStyle = [
        styles.divider,
        {
            borderBottomColor: themeColors.systemBorderColor,
            borderBottomWidth: StyleSheet.hairlineWidth,
        },
    ];

    return (
        <TouchableOpacity
            style={[
                styles.card,
                styles.shadowContainer,
                {
                    backgroundColor: themeColors.background,
                },
                style,
            ]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <ThemedText type='button'>Program Progress</ThemedText>
                    <ThemedText type='bodySmall' style={[styles.subtitle, { color: themeColors.subText }]}>
                        {getSubtitleText()}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.progressContainer}>
                <LinearProgressBar current={completedDays} goal={totalDays} color={themeColors.slateBlue} backgroundColor={themeColors.slateBlueTransparent} />
            </View>

            <View style={dividerStyle} />
            <View style={styles.footerContainer}>
                <ThemedText type='overline' style={[{ color: themeColors.subText }]}>
                    {progressPercentage}%
                </ThemedText>
                <Icon name='chevron-forward' size={14} color={themeColors.subText} style={{ marginTop: Spaces.XXS }} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    footerContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    card: {
        borderRadius: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleContainer: {
        flex: 1,
    },
    subtitle: {
        marginBottom: Spaces.MD,
    },
    progressContainer: {
        marginBottom: Spaces.SM,
    },
    divider: {
        marginTop: Spaces.SM,
        marginBottom: Spaces.XS,
        width: '100%',
        alignSelf: 'center',
    },
});
