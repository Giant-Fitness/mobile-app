// app/programs/ActiveProgramProgressScreen.tsx

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { ProgramMonthView } from '@/components/programs/ProgramMonthView';
import { Spaces } from '@/constants/Spaces';
import { groupProgramDaysIntoWeeks, groupWeeksIntoMonths, getWeekNumber, getDayOfWeek } from '@/utils/calendar';
import { Icon } from '@/components/base/Icon';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Sizes } from '@/constants/Sizes';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { ProgramProgressPillBar } from '@/components/programs/ProgramProgressPillBar';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { ProgramWeekList } from '@/components/programs/ProgramWeekList';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { BottomMenuModal } from '@/components/overlays/BottomMenuModal';
import { useProgramData } from '@/hooks/useProgramData';
import { EndProgramModal } from '@/components/programs/EndProgramModal';
import { ResetProgramModal } from '@/components/programs/ResetProgramModal';
import { AutoDismissSuccessModal } from '@/components/overlays/AutoDismissSuccessModal';

const ActiveProgramProgressScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const screenWidth = Dimensions.get('window').width;
    const [isBottomMenuVisible, setIsBottomMenuVisible] = useState(false);
    const navigation = useNavigation();
    const [monthDataLoaded, setMonthDataLoaded] = useState(REQUEST_STATE.IDLE);
    const [isEndProgramModalVisible, setIsEndProgramModalVisible] = useState(false);
    const [isResetProgramModalVisible, setIsResetProgramModalVisible] = useState(false);
    const [showResetSuccess, setShowResetSuccess] = useState(false);

    const { activeProgram, programDays, userProgramProgress, dataLoadedState, error, currentWeek, resetProgram, endProgram } = useProgramData(
        undefined,
        undefined,
        {
            fetchAllDays: true,
        },
    );

    const [months, setMonths] = useState<any[][][]>([]);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    useEffect(() => {
        // Hide header immediately on mount
        const hideHeader = () => {
            navigation.setOptions({
                headerShown: false,
                // Add any other header options you want to override
            });
        };

        // Run immediately and after a small delay to ensure it takes effect
        hideHeader();
        const timer = setTimeout(hideHeader, 0);

        return () => {
            clearTimeout(timer);
            // Optionally restore header on unmount if needed
            navigation.setOptions({ headerShown: true });
        };
    }, [navigation]);

    useEffect(() => {
        if (activeProgram && userProgramProgress) {
            const programDaysArray = Object.values(programDays[activeProgram.ProgramId]);

            const groupedWeeks = groupProgramDaysIntoWeeks(programDaysArray);
            const groupedMonths = groupWeeksIntoMonths(groupedWeeks);
            setMonths(groupedMonths);

            let initialIndex = 0;
            if (userProgramProgress.CurrentDay) {
                initialIndex = Math.floor((parseInt(userProgramProgress.CurrentDay) - 1) / 28);
                initialIndex = Math.min(initialIndex, groupedMonths.length - 1);
            }
            setCurrentMonthIndex(initialIndex);
            setMonthDataLoaded(REQUEST_STATE.FULFILLED);
        }
    }, [activeProgram, userProgramProgress, dataLoadedState]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        monthDataLoaded,
    });

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={monthDataLoaded === REQUEST_STATE.FULFILLED} />;
    }

    if (error) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program: {error}</ThemedText>
            </ThemedView>
        );
    }

    const navigateToProgramDay = (dayId: string) => {
        if (dayId) {
            navigation.navigate('programs/program-day', {
                programId: activeProgram.ProgramId,
                dayId: dayId,
            });
        }
    };

    const totalMonths = months.length;
    const handlePrevMonth = () => {
        if (currentMonthIndex > 0) {
            setCurrentMonthIndex(currentMonthIndex - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonthIndex < totalMonths - 1) {
            setCurrentMonthIndex(currentMonthIndex + 1);
        }
    };

    const handleEndProgramConfirm = () => {
        endProgram();
        setIsEndProgramModalVisible(false);
    };

    const handleResetProgramConfirm = () => {
        resetProgram();
        setIsResetProgramModalVisible(false);
        setShowResetSuccess(true);
    };

    const handleResetSuccessDismiss = () => {
        setShowResetSuccess(false);
        router.push('/(tabs)/programs');
    };

    const menuOptions = [
        {
            label: 'View Plan Details',
            icon: 'preview',
            onPress: () => {
                navigation.navigate('programs/program-overview', { programId: activeProgram.ProgramId });
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

    const handleMenuPress = () => {
        setIsBottomMenuVisible(true);
    };

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
                                weeks={months[currentMonthIndex]}
                                onDayPress={navigateToProgramDay}
                                userProgramProgress={userProgramProgress}
                                isEnrolled={true}
                            />
                        </ThemedView>
                    </ThemedView>
                    <ProgramWeekList
                        currentMonthWeeks={months[currentMonthIndex]}
                        userCurrentWeekNumber={Number(currentWeek)}
                        userCurrentDayNumber={userProgramProgress ? parseInt(userProgramProgress.CurrentDay) : 0}
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
                programId={activeProgram?.ProgramId || ''}
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
