// app/(app)/programs/ActiveProgramProgressScreen.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { AutoDismissSuccessModal } from '@/components/overlays/AutoDismissSuccessModal';
import { BottomMenuModal } from '@/components/overlays/BottomMenuModal';
import { EndProgramModal } from '@/components/programs/EndProgramModal';
import { ProgramMonthView } from '@/components/programs/ProgramMonthView';
import { ProgramProgressPillBar } from '@/components/programs/ProgramProgressPillBar';
import { ProgramWeekList } from '@/components/programs/ProgramWeekList';
import { ResetProgramModal } from '@/components/programs/ResetProgramModal';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useProgramData } from '@/hooks/useProgramData';
import { debounce } from '@/utils/debounce';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { usePostHog } from 'posthog-react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';

const ActiveProgramProgressScreen = () => {
    // 1. Hooks Section - All hooks must be called before any conditionals
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const screenWidth = Dimensions.get('window').width;
    const scrollY = useSharedValue(0);
    const posthog = usePostHog();

    // State hooks
    const [isBottomMenuVisible, setIsBottomMenuVisible] = useState(false);
    const [isEndProgramModalVisible, setIsEndProgramModalVisible] = useState(false);
    const [isResetProgramModalVisible, setIsResetProgramModalVisible] = useState(false);
    const [showResetSuccess, setShowResetSuccess] = useState(false);

    const { activeProgram, userProgramProgress, months, currentMonthIndex, currentWeek, setCurrentMonthIndex, resetProgram, endProgram, error } =
        useProgramData(undefined, undefined, { fetchAllDays: true });

    // Handlers and other functions
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const navigateToProgramDay = (dayId: string) => {
        if (dayId) {
            debounce(router, {
                pathname: '/(app)/programs/program-day',
                params: { programId: activeProgram?.ProgramId, dayId, source: 'active-program-progress' },
            });
        }
    };

    const handlePrevMonth = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthIndex < months.length - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
        }
    };

    const handleEndProgramConfirm = async () => {
        // Track analytics event for program abandonment
        posthog.capture('program_abandoned', {
            program_id: activeProgram?.ProgramId,
            program_name: activeProgram?.ProgramName,
            days_completed: userProgramProgress?.CompletedDays?.length || 0,
            completed_percentage: userProgramProgress?.CompletedDays?.length
                ? Math.round((userProgramProgress.CompletedDays.length / (activeProgram?.Days || 1)) * 100)
                : 0,
        });

        await endProgram();
        setIsEndProgramModalVisible(false);
    };

    const handleResetProgramConfirm = () => {
        posthog.capture('program_reset', {
            program_id: activeProgram?.ProgramId,
            program_name: activeProgram?.ProgramName,
            days_completed: userProgramProgress?.CompletedDays?.length || 0,
            completed_percentage: userProgramProgress?.CompletedDays?.length
                ? Math.round((userProgramProgress.CompletedDays.length / (activeProgram?.Days || 1)) * 100)
                : 0,
        });
        resetProgram();
        setIsResetProgramModalVisible(false);
        setShowResetSuccess(true);
    };

    const handleResetSuccessDismiss = () => {
        setShowResetSuccess(false);
        router.push('/(app)/(tabs)/(training-tabs)/programs');
    };

    const handleMenuPress = () => {
        setIsBottomMenuVisible(true);
    };

    const menuOptions = [
        {
            label: 'View Plan Details',
            icon: 'preview',
            onPress: () => {
                router.push({
                    pathname: '/(app)/programs/program-overview',
                    params: { programId: activeProgram?.ProgramId },
                });
            },
        },
        {
            label: 'Reset Progress',
            icon: 'repeat',
            onPress: () => {
                setIsResetProgramModalVisible(true);
            },
        },
        {
            label: 'End Plan',
            icon: 'warning',
            onPress: () => {
                setIsEndProgramModalVisible(true);
            },
        },
    ];

    const totalMonths = months.length;

    // Render loading/error states
    if (!activeProgram || !months.length) {
        if (!userProgramProgress?.UserId) {
            return <View></View>;
        }
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Loading program data...</ThemedText>
            </ThemedView>
        );
    }

    if (error) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program: {error}</ThemedText>
            </ThemedView>
        );
    }

    // Main render
    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
            <AnimatedHeader
                scrollY={scrollY}
                headerInterpolationStart={Spaces.XXL}
                headerInterpolationEnd={Sizes.imageLGHeight}
                onMenuPress={handleMenuPress}
            />
            <Animated.ScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <View style={[{ marginBottom: Spaces.XXL }]}>
                    <TopImageInfoCard
                        image={{ uri: activeProgram?.PhotoUrl }}
                        title={activeProgram?.ProgramName}
                        titleType='titleLarge'
                        titleStyle={{ marginBottom: Spaces.XS }}
                        contentContainerStyle={{
                            backgroundColor: themeColors.background,
                            paddingHorizontal: Spaces.LG,
                            paddingBottom: Spaces.XXS,
                        }}
                        imageStyle={{ height: Sizes.image3XLHeight }}
                    />
                    <ThemedView style={[styles.progress]}>
                        <ProgramProgressPillBar
                            completedParts={Number(currentWeek) - 1}
                            currentPart={Number(currentWeek)}
                            parts={Number(activeProgram?.Weeks)}
                            containerWidth={screenWidth - Spaces.XXL}
                        />
                    </ThemedView>
                    <ThemedView style={[styles.calendarContainer, { backgroundColor: themeColors.background }]}>
                        <ThemedView style={styles.header}>
                            {currentMonthIndex > 0 ? (
                                <TouchableOpacity onPress={handlePrevMonth}>
                                    <Icon name='chevron-back' color={themeColors.text} />
                                </TouchableOpacity>
                            ) : (
                                <View style={{ width: Spaces.XL }} />
                            )}
                            <ThemedText type='overline' style={styles.monthTitle}>
                                Month {currentMonthIndex + 1}
                            </ThemedText>
                            {currentMonthIndex < totalMonths - 1 ? (
                                <TouchableOpacity onPress={handleNextMonth}>
                                    <Icon name='chevron-forward' color={themeColors.text} />
                                </TouchableOpacity>
                            ) : (
                                <ThemedView style={{ width: Spaces.XL }} />
                            )}
                        </ThemedView>
                        <ThemedView style={styles.calendar}>
                            <ProgramMonthView
                                weeks={months[currentMonthIndex].map((week) => week.filter((day) => day !== null))}
                                onDayPress={navigateToProgramDay}
                                userProgramProgress={userProgramProgress}
                                isEnrolled={true}
                            />
                        </ThemedView>
                    </ThemedView>
                    <ProgramWeekList
                        currentMonthWeeks={months[currentMonthIndex].map((week) => week.filter((day) => day !== null))}
                        userCurrentWeekNumber={Number(currentWeek)}
                        userCurrentDayNumber={userProgramProgress ? userProgramProgress.CurrentDay : 0}
                        navigateToProgramDay={navigateToProgramDay}
                        completedDays={userProgramProgress?.CompletedDays || []}
                    />
                </View>
            </Animated.ScrollView>

            <BottomMenuModal isVisible={isBottomMenuVisible} onClose={() => setIsBottomMenuVisible(false)} options={menuOptions} />
            <ResetProgramModal
                visible={isResetProgramModalVisible}
                onClose={() => setIsResetProgramModalVisible(false)}
                onConfirm={handleResetProgramConfirm}
            />
            <AutoDismissSuccessModal
                visible={showResetSuccess}
                onDismiss={handleResetSuccessDismiss}
                title='Program Reset'
                showTitle={true}
                showMessage={false}
                duration={1300}
            />
            <EndProgramModal
                programId={activeProgram?.ProgramId}
                visible={isEndProgramModalVisible}
                onClose={() => setIsEndProgramModalVisible(false)}
                onConfirm={handleEndProgramConfirm}
            />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spaces.LG,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.MD,
        paddingTop: Spaces.LG,
    },
    calendarContainer: {
        marginTop: Spaces.XXL,
    },
    calendar: {
        paddingBottom: Spaces.LG,
    },
    monthTitle: {},
    buttonContainer: {},
    startButton: {},
    resetButton: {
        borderWidth: 1,
    },
    progress: {
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.SM,
        paddingBottom: Spaces.XL,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spaces.XL,
        marginBottom: Spaces.SM,
    },
    attributeText: {
        marginLeft: Spaces.XS,
        lineHeight: Spaces.LG,
    },
});

export default ActiveProgramProgressScreen;
