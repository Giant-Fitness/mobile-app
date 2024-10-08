// app/programs/program-day.tsx

import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ExerciseCard } from '@/components/programs/ExerciseCard';
import { Icon } from '@/components/base/Icon';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { TextButton } from '@/components/buttons/TextButton';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { REQUEST_STATE } from '@/constants/requestStates';
import { useProgramData } from '@/hooks/useProgramData';
import { ProgramDaySkipModal } from '@/components/programs/ProgramDaySkipModal';
import { ProgramDayUnfinishModal } from '@/components/programs/ProgramDayUnfinishModal';
import { BottomMenuModal } from '@/components/overlays/BottomMenuModal';

type ProgramDayScreenParams = {
    ProgramDay: {
        dayId: string;
        programId: string;
    };
};

const ProgramDayScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();
    const route = useRoute<RouteProp<ProgramDayScreenParams, 'ProgramDay'>>();
    const [isProgramDaySkipModalVisible, setIsProgramDaySkipModalVisible] = useState(false);
    const [isResetDayModalVisible, setIsResetDayModalVisible] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiRef = useRef<LottieView>(null);
    const [isBottomMenuVisible, setIsBottomMenuVisible] = useState(false);

    const { dayId, programId } = route.params;

    const {
        userProgramProgress,
        programDay,
        programDayState,
        currentWeek,
        dayOfWeek,
        isEnrolled,
        isDayCompleted,
        handleCompleteDay,
        handleUncompleteDay,
        isCompletingDay,
        isUncompletingDay,
    } = useProgramData(programId, dayId);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const navigateToAllWorkouts = (initialFilters = {}) => {
        navigation.navigate('workouts/all-workouts', { initialFilters });
    };

    const finishDayChecker = async () => {
        if (userProgramProgress.CurrentDay < dayId) {
            setIsProgramDaySkipModalVisible(true);
        } else {
            await handleCompleteDay();
            setShowConfetti(true);
            confettiRef.current?.play();
            setTimeout(() => {
                setShowConfetti(false);
                router.push('/(tabs)/home');
            }, 2200); // Adjust this time as needed
        }
    };

    const handleProgramDaySkip = async () => {
        await handleCompleteDay();
        setIsProgramDaySkipModalVisible(false);
        setShowConfetti(true);
        confettiRef.current?.play();
        setTimeout(() => {
            setShowConfetti(false);
            router.push('/(tabs)/home');
        }, 2200); // Adjust this time as needed
    };

    const resetDay = () => {
        handleUncompleteDay();
        setIsResetDayModalVisible(false);
        router.push('/(tabs)/home');
    };

    const handleMenuPress = () => {
        setIsBottomMenuVisible(true);
    };

    const menuOptions = [
        {
            label: 'View Progress',
            icon: 'auto-graph',
            onPress: () => {
                console.log('View Progress');
            },
        },
        {
            label: 'View Plan Details',
            icon: 'preview',
            onPress: () => {
                navigation.navigate('programs/program-overview', { programId });
            },
        },
    ];

    if (programDayState === REQUEST_STATE.PENDING) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={themeColors.text} />
            </ThemedView>
        );
    }

    if (programDayState === REQUEST_STATE.REJECTED) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program day.</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader
                scrollY={scrollY}
                headerInterpolationStart={Spaces.XXL}
                headerInterpolationEnd={Sizes.imageLGHeight}
                onMenuPress={handleMenuPress}
            />
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {programDay && (
                    <>
                        <TopImageInfoCard
                            image={{ uri: programDay.PhotoUrl }}
                            title={`${programDay.DayTitle}`}
                            subtitle={`Week ${currentWeek} Day ${dayOfWeek}`}
                            titleType='titleLarge'
                            subtitleType='link'
                            subtitleStyle={{ marginBottom: Spaces.SM, color: themeColors.subText, marginTop: 0 }}
                            titleStyle={{ marginBottom: 0 }}
                            containerStyle={{ elevation: 5, marginBottom: 0 }}
                            contentContainerStyle={{
                                backgroundColor: themeColors.background,
                                paddingHorizontal: Spaces.LG,
                            }}
                            imageStyle={{ height: Sizes.imageXXLHeight }}
                            titleFirst={true}
                            extraContent={
                                <ThemedView>
                                    {programDay.RestDay ? (
                                        <ThemedView style={styles.tipContainer}>
                                            <Icon name='sleep' color={themeColors.subText} style={{ marginRight: Spaces.SM, marginTop: Spaces.XS }} />
                                            <ThemedText type='body' style={{ color: themeColors.subText }}>
                                                {'Take it easy today! Focus on recovery and hydration.'}
                                            </ThemedText>
                                        </ThemedView>
                                    ) : (
                                        <ThemedView>
                                            {[
                                                { icon: 'stopwatch', text: `${programDay.Time} mins` },
                                                { icon: 'kettlebell', text: programDay.Equipment.join(', ') },
                                                { icon: 'yoga', text: programDay.MuscleGroups.join(', ') },
                                            ].map((item, index) => (
                                                <ThemedView key={index} style={styles.attributeRow}>
                                                    <ThemedView style={styles.attribute}>
                                                        <Icon name={item.icon} color={themeColors.text} />
                                                        <ThemedText type='body' style={styles.attributeText}>
                                                            {item.text}
                                                        </ThemedText>
                                                    </ThemedView>
                                                </ThemedView>
                                            ))}
                                        </ThemedView>
                                    )}
                                </ThemedView>
                            }
                        />
                        {!programDay.RestDay && (
                            <ThemedView
                                style={[
                                    styles.exercisesContainer,
                                    { backgroundColor: themeColors.backgroundSecondary },
                                    [{ paddingBottom: Spaces.XL }],
                                    isEnrolled && [{ paddingBottom: Sizes.bottomSpaceLarge }],
                                ]}
                            >
                                {programDay.Exercises &&
                                    programDay.Exercises.map((exercise) => (
                                        <ExerciseCard key={exercise.ExerciseId} exercise={exercise} isEnrolled={isEnrolled} />
                                    ))}
                            </ThemedView>
                        )}
                        {isEnrolled && (
                            <View style={styles.buttonContainer}>
                                {isDayCompleted ? (
                                    <TextButton
                                        text='Day Completed'
                                        textType='bodyMedium'
                                        style={[styles.completeButton, { backgroundColor: themeColors.background }]}
                                        textStyle={[{ color: themeColors.text }]}
                                        iconColor={themeColors.text}
                                        onPress={() => setIsResetDayModalVisible(true)}
                                        iconName='check-outline'
                                        size={'LG'}
                                        disabled={isUncompletingDay}
                                        loading={isUncompletingDay}
                                    />
                                ) : (
                                    <PrimaryButton
                                        text='Finish Day'
                                        textType='bodyMedium'
                                        style={[styles.completeButton, { backgroundColor: themeColors.buttonPrimary }]}
                                        onPress={finishDayChecker}
                                        size={'LG'}
                                        disabled={isCompletingDay}
                                        loading={isCompletingDay}
                                    />
                                )}
                                {programDay.RestDay && (
                                    <TextButton
                                        text='Mobility Workouts'
                                        textStyle={[{ color: themeColors.text }]}
                                        textType='bodyMedium'
                                        style={[styles.mobilityButton]}
                                        size={'LG'}
                                        onPress={() => navigateToAllWorkouts({ focus: ['Mobility'] })}
                                    />
                                )}
                            </View>
                        )}
                    </>
                )}
            </Animated.ScrollView>
            <ProgramDaySkipModal
                visible={isProgramDaySkipModalVisible}
                onClose={() => setIsProgramDaySkipModalVisible(false)}
                onConfirm={handleProgramDaySkip}
            />
            <ProgramDayUnfinishModal visible={isResetDayModalVisible} onClose={() => setIsResetDayModalVisible(false)} onConfirm={resetDay} />
            {showConfetti && (
                <View style={StyleSheet.absoluteFill}>
                    <LottieView
                        ref={confettiRef}
                        source={require('@/assets/splash/confetti2.json')}
                        autoPlay={false}
                        loop={false}
                        style={StyleSheet.absoluteFill}
                    />
                </View>
            )}

            <BottomMenuModal isVisible={isBottomMenuVisible} onClose={() => setIsBottomMenuVisible(false)} options={menuOptions} />
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        paddingRight: Spaces.SM,
        paddingBottom: Spaces.LG,
    },
    container: {
        marginRight: '27%',
        alignItems: 'center',
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: Spaces.SM,
    },
    attributeText: {
        marginLeft: Spaces.SM,
        lineHeight: Spaces.LG,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginRight: Spaces.MD,
    },
    exercisesContainer: {
        paddingTop: Spaces.LG,
        paddingBottom: 0,
        paddingHorizontal: Spaces.MD,
    },
    buttonContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingHorizontal: '10%',
        position: 'absolute',
        bottom: Spaces.XXXL,
        left: 0,
        right: 0,
    },
    completeButton: {
        width: '100%',
    },
    mobilityButton: {
        width: '100%',
        marginTop: Spaces.MD,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: Spaces.SM,
        backgroundColor: 'transparent',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spaces.LG,
    },
});

export default ProgramDayScreen;
