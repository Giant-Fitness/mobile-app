// app/programs/browse-programs.tsx

import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getUserProgramProgressAsync } from '@/store/user/thunks';
import { getAllProgramsAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { BasicSplash } from '@/components/base/BasicSplash';

export default function BrowseProgramsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();

    const { userProgramProgress, userProgramProgressState } = useSelector((state: RootState) => state.user);
    const { programs, allProgramsState } = useSelector((state: RootState) => state.programs);

    useEffect(() => {
        if (allProgramsState === REQUEST_STATE.IDLE) {
            dispatch(getAllProgramsAsync());
        }
    }, [dispatch, allProgramsState]);

    if (allProgramsState !== REQUEST_STATE.FULFILLED) {
        return <BasicSplash />;
    }

    return (
        <ScrollView style={[styles.scrollContainer, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.infoContainer}>
                <ThemedText type='bodyXSmall' style={[styles.infoText, { color: themeColors.subText }]}>
                    Programs are multi-week routines, designed to help you achieve your goals
                </ThemedText>
            </ThemedView>

            {Object.values(programs).map((program) => (
                <TouchableOpacity key={program.ProgramId} style={styles.programItem}>
                    <ThemedText style={styles.programName}>
                        {program.ProgramName}
                        {program.ProgramId === userProgramProgress?.ProgramId && ' (Current)'}
                    </ThemedText>
                    <ThemedText style={styles.programDescription}>{program.Description}</ThemedText>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
    },
    infoContainer: {
        paddingTop: Spaces.LG,
        paddingBottom: Spaces.MD,
        marginHorizontal: Spaces.XXXL,
    },
    infoText: {
        textAlign: 'center',
    },
    programItem: {
        padding: Spaces.MD,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    programName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    programDescription: {
        fontSize: 14,
        marginTop: Spaces.SM,
    },
});
