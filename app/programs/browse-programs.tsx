// app/programs/browse-programs.tsx

import React, { useEffect, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getAllProgramsAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { useProgramData } from '@/hooks/useProgramData';

// Wrap ProgramCard with React.memo
const MemoizedProgramCard = React.memo(ProgramCard);

export default function BrowseProgramsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const { userProgramProgress } = useProgramData();
    const { programs, allProgramsState } = useSelector((state: RootState) => state.programs);

    const fetchData = useCallback(async () => {
        if (allProgramsState !== REQUEST_STATE.FULFILLED) {
            await dispatch(getAllProgramsAsync());
        }
    }, [dispatch, allProgramsState]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: allProgramsState,
    });

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        fetchData();
    }, [navigation, fetchData]);

    const navigateToProgramOverview = useCallback((programId: string) => {
        navigation.navigate('programs/program-overview', {
            programId: programId,
        });
    }, [navigation]);

    const keyExtractor = useCallback((item: any) => item.ProgramId, []);

    const renderItem = useCallback(({ item }: { item: any }) => (
        <MemoizedProgramCard
            program={item}
            isActive={item.ProgramId === userProgramProgress?.ProgramId}
            onPress={() => navigateToProgramOverview(item.ProgramId)}
            activeProgramUser={userProgramProgress?.ProgramId}
            recommendedProgram={false}
        />
    ), [userProgramProgress, navigateToProgramOverview]);

    const renderHeader = useMemo(() => (
        <ThemedView style={[styles.infoContainer, { marginTop: Spaces.SM }, userProgramProgress?.ProgramId && { marginTop: insets.top + Spaces.XXL }]}>
            <ThemedText type='bodySmall' style={[styles.infoText, { color: themeColors.subText }]}>
                Level up your fitness! Follow these structured, multi-week adventures to unlock your full potential
            </ThemedText>
        </ThemedView>
    ), [userProgramProgress, insets.top, themeColors.subText]);

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={allProgramsState === REQUEST_STATE.FULFILLED} />;
    }

    return (
        <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.background }]}>
            {userProgramProgress?.ProgramId && <AnimatedHeader disableColorChange={true} title='Browse Programs' headerBackground={themeColors.background} />}
            <FlatList
                data={Object.values(programs)}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={[
                    styles.contentContainer,
                    { backgroundColor: themeColors.background },
                    userProgramProgress?.ProgramId && { paddingBottom: Spaces.XXL },
                ]}
                showsVerticalScrollIndicator={false}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={5}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: Spaces.MD,
        marginHorizontal: Spaces.MD,
    },
    infoContainer: {
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.XL,
        marginHorizontal: Spaces.XXL,
    },
    infoText: {
        textAlign: 'center',
    },
});
