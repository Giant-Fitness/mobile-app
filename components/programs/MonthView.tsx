// components/programs/MonthView.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ProgramDay, UserProgramProgress } from '@/type/types';
import WeekRow from '@/components/programs/WeekRow';
import { spacing } from '@/utils/spacing';

interface MonthViewProps {
    weeks: ProgramDay[][];
    onDayPress: (dayId: string) => void;
    userProgramProgress: UserProgramProgress | null;
    isEnrolled: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({ weeks, onDayPress, userProgramProgress, isEnrolled = false }) => {
    return (
        <View style={styles.monthContainer}>
            {weeks.map((week, index) => (
                <WeekRow key={index} week={week} onDayPress={onDayPress} userProgramProgress={userProgramProgress} isEnrolled={isEnrolled} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    monthContainer: {
        paddingHorizontal: spacing.md,
    },
});

export default MonthView;
