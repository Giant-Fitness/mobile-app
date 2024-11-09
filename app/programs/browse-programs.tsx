// app/programs/browse-programs.tsx

import React, { useEffect, useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { AppDispatch, RootState } from '@/store/store';
import { getAllProgramsAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { useProgramData } from '@/hooks/useProgramData';

const MemoizedProgramCard = React.memo(ProgramCard);

export default function BrowseProgramsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const { userProgramProgress, userRecommendations } = useProgramData();
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
        // Hide header immediately
        const hideHeader = () => {
            navigation.setOptions({ headerShown: false });
        };

        // Run immediately and after a small delay
        hideHeader();
        const timer = setTimeout(hideHeader, 1);

        // Fetch data
        fetchData();

        return () => {
            clearTimeout(timer);
            // Optional: restore header on unmount
            navigation.setOptions({ headerShown: true });
        };
    }, [navigation, fetchData]);

    const navigateToProgramOverview = useCallback(
        (programId: string) => {
            navigation.navigate('programs/program-overview', {
                programId: programId,
            });
        },
        [navigation],
    );

    const keyExtractor = useCallback((item: any) => item.ProgramId, []);

    const renderItem = useCallback(
        ({ item }: { item: any }) => (
            <MemoizedProgramCard
                program={item}
                isActive={false}
                onPress={() => navigateToProgramOverview(item.ProgramId)}
                activeProgramUser={userProgramProgress?.ProgramId}
                recommendedProgram={item.ProgramId === userRecommendations?.RecommendedProgramID}
            />
        ),
        [userProgramProgress, userRecommendations, navigateToProgramOverview],
    );

    const renderHeader = useMemo(() => {
        const activeProgram = userProgramProgress?.ProgramId ? programs[userProgramProgress.ProgramId] : null;
        const recommendedProgram = !activeProgram && userRecommendations?.RecommendedProgramID ? programs[userRecommendations.RecommendedProgramID] : null;

        return (
            <View>
                <ThemedView style={[styles.infoContainer, { backgroundColor: themeColors.tipBackground }, { marginTop: Sizes.headerHeight + Spaces.LG }]}>
                    <ThemedText type='bodySmall' style={[styles.infoText, { color: themeColors.tipText }]}>
                        Follow these structured, multi-week adventures to unlock your full potential!
                    </ThemedText>
                </ThemedView>
                {activeProgram && (
                    <View style={styles.topProgramContainer}>
                        <MemoizedProgramCard
                            program={activeProgram}
                            isActive={true}
                            onPress={() => navigateToProgramOverview(activeProgram.ProgramId)}
                            activeProgramUser={userProgramProgress?.ProgramId}
                            recommendedProgram={false}
                        />
                    </View>
                )}
                {recommendedProgram && (
                    <View style={styles.topProgramContainer}>
                        <MemoizedProgramCard
                            program={recommendedProgram}
                            isActive={false}
                            onPress={() => navigateToProgramOverview(recommendedProgram.ProgramId)}
                            activeProgramUser={userProgramProgress?.ProgramId}
                            recommendedProgram={true}
                        />
                    </View>
                )}
            </View>
        );
    }, [insets.top, themeColors.subText, programs, userProgramProgress, userRecommendations, navigateToProgramOverview]);

    const programList = useMemo(() => {
        const topProgramId = userProgramProgress?.ProgramId || userRecommendations?.RecommendedProgramID;
        return Object.values(programs).filter((program) => program.ProgramId !== topProgramId);
    }, [programs, userProgramProgress, userRecommendations]);

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={allProgramsState === REQUEST_STATE.FULFILLED} />;
    }

    return (
        <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader disableColorChange={true} title='Browse' headerBackground={themeColors.background} />
            <FlatList
                data={programList}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={[
                    styles.contentContainer,
                    { backgroundColor: themeColors.background },
                    (userProgramProgress?.ProgramId || userRecommendations?.RecommendedProgramID) && { paddingBottom: Spaces.XXL },
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
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.XL,
        marginHorizontal: 0,
        borderRadius: Spaces.SM,
    },
    infoText: {
        textAlign: 'center',
    },
    topProgramContainer: {},
});
