// components/programs/ProgramWeekRow.tsx

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { ProgramDay, UserProgramProgress } from '@/type/types';
import { ProgramDayOverviewCard } from '@/components/programs/ProgramDayOverviewCard';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

interface ProgramWeekRowProps {
    week: (ProgramDay | null)[];
    onDayPress: (dayId: string) => void;
    userProgramProgress: UserProgramProgress | null;
    isEnrolled: boolean;
}

export const ProgramWeekRow: React.FC<ProgramWeekRowProps> = ({ week, onDayPress, userProgramProgress, isEnrolled = false }) => {
    return (
        <View style={styles.weekContainer}>
            {week.map((day, index) => {
                if (day) {
                    return (
                        <ProgramDayOverviewCard
                            key={day.DayId}
                            day={day}
                            onPress={() => onDayPress(day.DayId)}
                            userProgramProgress={userProgramProgress}
                            isEnrolled={isEnrolled}
                        />
                    );
                } else {
                    return <View key={`empty-${index}`} style={[styles.emptyDay]} />;
                }
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    weekContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spaces.XS,
    },
    emptyDay: {
        height: Sizes.dayTile,
        width: Sizes.dayTile,
        marginHorizontal: 1,
    },
});
