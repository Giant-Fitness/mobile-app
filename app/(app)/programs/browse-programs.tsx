// app/(app)/programs/browse-programs.tsx

import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { ProgramCard } from '@/components/programs/ProgramCard';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProgramData } from '@/hooks/useProgramData';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { getAllProgramsAsync } from '@/store/programs/thunks';
import { AppDispatch, RootState } from '@/store/store';
import { Program } from '@/types/programTypes';
import { darkenColor } from '@/utils/colorUtils';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';
import { useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';

const MemoizedProgramCard = React.memo(ProgramCard);

const ProgramInfo = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.infoContainer, { backgroundColor: themeColors.tealTransparent }]}>
            <View style={styles.infoContentWrapper}>
                <View style={styles.content}>
                    <ThemedText
                        type='title'
                        style={[
                            styles.infoTitle,
                            {
                                color: darkenColor(themeColors.tealSolid, 0.3),
                                marginBottom: Spaces.XS,
                            },
                        ]}
                    >
                        Programs
                    </ThemedText>
                    <ThemedText
                        type='overline'
                        style={[
                            styles.infoText,
                            {
                                color: darkenColor(themeColors.subText, 0.1),
                                lineHeight: 21,
                                fontSize: 13,
                            },
                        ]}
                    >
                        Structured programs designed to help you reach your goals
                    </ThemedText>
                </View>
                <Image
                    source={require('@/assets/images/dumbbell.png')}
                    style={[
                        styles.backgroundImage,
                        {
                            opacity: colorScheme === 'light' ? 0.1 : 0.15,
                            tintColor: themeColors.tealSolid,
                        },
                    ]}
                    resizeMode='contain'
                />
            </View>
        </ThemedView>
    );
};

export default function BrowseProgramsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const scrollY = useSharedValue(0);

    const { userProgramProgress, userRecommendations } = useProgramData();
    const { programs, allProgramsState } = useSelector((state: RootState) => state.programs);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            trigger('virtualKeyRelease');
            await dispatch(getAllProgramsAsync({ forceRefresh: true }));
            setTimeout(() => {
                setRefreshing(false);
            }, 200);
        } catch (err) {
            console.log('Refresh error:', err);
        }
    };

    const fetchData = useCallback(async () => {
        if (allProgramsState !== REQUEST_STATE.FULFILLED) {
            await dispatch(getAllProgramsAsync());
        }
    }, [dispatch, allProgramsState]);

    // Modified to keep track of splash state but not use full-screen splash
    const { showSplash } = useSplashScreen({
        dataLoadedState: allProgramsState,
    });

    useEffect(() => {
        // Fetch data
        fetchData();
    }, [fetchData]);

    const navigateToProgramOverview = useCallback((programId: string) => {
        trigger('selection');
        router.push({
            pathname: '/programs/program-overview',
            params: { programId, source: 'library' },
        });
    }, []);

    const keyExtractor = useCallback((item: Program) => item.ProgramId, []);

    const renderItem = useCallback(
        ({ item }: { item: Program }) => (
            <MemoizedProgramCard
                program={item}
                isActive={false}
                onPress={() => navigateToProgramOverview(item.ProgramId)}
                activeProgramUser={!!userProgramProgress?.ProgramId}
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
                <View style={{ marginTop: Spaces.MD }}>
                    <ProgramInfo />
                </View>
                {activeProgram && (
                    <View style={styles.topProgramContainer}>
                        <MemoizedProgramCard
                            program={activeProgram}
                            isActive={true}
                            onPress={() => navigateToProgramOverview(activeProgram.ProgramId)}
                            activeProgramUser={!!userProgramProgress?.ProgramId}
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
                            activeProgramUser={!!userProgramProgress?.ProgramId}
                            recommendedProgram={true}
                        />
                    </View>
                )}
            </View>
        );
    }, [programs, userProgramProgress, userRecommendations, navigateToProgramOverview]);

    const programList = useMemo(() => {
        const topProgramId = userProgramProgress?.ProgramId || userRecommendations?.RecommendedProgramID;
        return Object.values(programs).filter((program) => program.ProgramId !== topProgramId);
    }, [programs, userProgramProgress, userRecommendations]);

    return (
        <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} title='Browse' headerBackground={themeColors.background} />

            <View style={styles.mainContentWrapper}>
                {/* Show either the splash screen or the content */}
                {showSplash ? (
                    <View style={[styles.inlineSplashContainer]}>
                        <DumbbellSplash isDataLoaded={allProgramsState === REQUEST_STATE.FULFILLED} />
                    </View>
                ) : (
                    <View style={{ paddingTop: Sizes.headerHeight }}>
                        <FlatList
                            data={programList}
                            renderItem={renderItem}
                            keyExtractor={keyExtractor}
                            ListHeaderComponent={renderHeader}
                            contentContainerStyle={[
                                styles.contentContainer,
                                { backgroundColor: themeColors.background },
                                userProgramProgress?.ProgramId || userRecommendations?.RecommendedProgramID ? { paddingBottom: Spaces.XXL } : undefined,
                            ]}
                            showsVerticalScrollIndicator={false}
                            removeClippedSubviews={false} // Set to false to keep items mounted
                            maxToRenderPerBatch={20} // Increase this significantly
                            updateCellsBatchingPeriod={50} // Decrease to update UI more frequently
                            initialNumToRender={10} // Show more items initially
                            windowSize={21} // Increase window size (each unit is about 1 viewport height)
                            onEndReachedThreshold={0.5}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={handleRefresh}
                                    colors={[themeColors.iconSelected]}
                                    tintColor={themeColors.iconSelected}
                                />
                            }
                        />
                    </View>
                )}
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    mainContentWrapper: {
        flex: 1,
        zIndex: 1,
    },
    pullToRefreshContainer: {
        flex: 1,
    },
    pullToRefreshContent: {
        flexGrow: 1,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: Spaces.MD,
        marginHorizontal: Spaces.MD,
    },
    topProgramContainer: {},
    infoContainer: {
        marginHorizontal: Spaces.XS,
        marginBottom: Spaces.XL,
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    infoContentWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        padding: Spaces.LG,
        flex: 1,
        zIndex: 1,
    },
    infoTitle: {
        maxWidth: '90%',
    },
    infoText: {
        maxWidth: '90%',
    },
    backgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.SM,
        width: 200,
        height: '60%',
    },
    inlineSplashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
