// components/programs/ProgramMonthView.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgramDay, UserProgramProgress } from '@/types';
import { ProgramWeekRow } from '@/components/programs/ProgramWeekRow';
import { Spaces } from '@/constants/Spaces';

interface ProgramMonthViewProps {
    weeks: ProgramDay[][];
    onDayPress: (dayId: string) => void;
    userProgramProgress: UserProgramProgress | null;
    isEnrolled: boolean;
}

export const ProgramMonthView: React.FC<ProgramMonthViewProps> = ({ weeks, onDayPress, userProgramProgress, isEnrolled = false }) => {
    return (
        <View style={styles.monthContainer}>
            {weeks.map((week, index) => (
                <ProgramWeekRow key={index} week={week} onDayPress={onDayPress} userProgramProgress={userProgramProgress} isEnrolled={isEnrolled} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    monthContainer: {
        paddingHorizontal: Spaces.MD,
    },
});
