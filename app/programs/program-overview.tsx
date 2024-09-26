// app/programs/program-overview.tsx

import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { getProgramAsync } from '@/store/programs/thunks';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Spaces } from '@/constants/Spaces';
import { Icon } from '@/components/base/Icon';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { Sizes } from '@/constants/Sizes';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { TextButton } from '@/components/buttons/TextButton';
import { useSplashScreen } from '@/hooks/useSplashScreen';

type ProgramOverviewScreenParams = {
    programId: string;
};

const ProgramOverviewScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();
    const screenWidth = Dimensions.get('window').width;

    const navigation = useNavigation();

    const route = useRoute<RouteProp<Record<string, ProgramOverviewScreenParams>, string>>();
    const { programId } = route.params;

    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    // Redux Selectors
    const program = useSelector((state: RootState) => state.programs.programs[programId]);
    const programState = useSelector((state: RootState) => state.programs.programsState[programId]);
    const userProgramProgress = useSelector((state: RootState) => state.user.userProgramProgress);
    const userProgramProgressState = useSelector((state: RootState) => state.user.userProgramProgressState);

    useEffect(() => {
        if (programState !== REQUEST_STATE.FULFILLED) {
            dispatch(getProgramAsync({ programId }));
        }
    }, [programState, dispatch, programId]);

    const isEnrolled = userProgramProgress?.ProgramId === programId;

    const navigateToProgramCalendar = () => {
        navigation.navigate('programs/program-calendar', {
            programId: programId,
        });
    };

    const isDataLoading = programState === REQUEST_STATE.PENDING || userProgramProgressState === REQUEST_STATE.PENDING || !program;

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: !isDataLoading ? REQUEST_STATE.FULFILLED : REQUEST_STATE.PENDING,
    });

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={!isDataLoading} />;
    }

    if (programState === REQUEST_STATE.REJECTED) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program.</ThemedText>
            </ThemedView>
        );
    }

    // Extract program details
    const { ProgramName, PhotoUrl, Weeks, Frequency, Goal, Level, Description, Equipment, DesignedFor, CalendarOverview } = program;

    // Function to get the level icon
    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return 'level-beginner';
            case 'intermediate':
                return 'level-intermediate';
            case 'advanced':
                return 'level-advanced';
            case 'all levels':
            default:
                return 'people'; // Use a default icon
        }
    };

    // Handle the Start Program action
    const handleStartProgram = () => {
        // Start the program
        console.log('Program started');
        // Implement your start program logic here
    };

    // Handle the Reset Program action
    const handleResetProgram = () => {
        // Reset the program
        console.log('Program reset');
        // Implement your reset program logic here
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundTertiary }]}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Sizes.imageLGHeight} headerInterpolationEnd={Sizes.imageLGHeight + Spaces.XXL} />
            <Animated.ScrollView
                contentContainerStyle={[{ flexGrow: 1 }]}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <ThemedView
                    style={[
                        {
                            backgroundColor: themeColors.backgroundTertiary,
                        },
                        !isEnrolled && { marginBottom: Sizes.bottomSpaceLarge },
                    ]}
                >
                    <TopImageInfoCard
                        image={{ uri: PhotoUrl }}
                        title={ProgramName}
                        titleType='titleLarge'
                        titleStyle={{ marginBottom: Spaces.XS }}
                        contentContainerStyle={{
                            backgroundColor: themeColors.background,
                            paddingHorizontal: Spaces.LG,
                            paddingBottom: Spaces.XXS,
                        }}
                        imageStyle={{ height: Sizes.image3XLHeight }}
                        extraContent={
                            <ThemedView>
                                {/* Attributes in a Row */}
                                <ThemedView style={[styles.attributeRow]}>
                                    {/* Attribute 1: Length */}
                                    <View style={styles.attributeItem}>
                                        <Icon name='stopwatch' size={Sizes.fontSizeDefault} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {Weeks} Weeks
                                        </ThemedText>
                                    </View>

                                    {/* Attribute 2: Frequency */}
                                    <View style={styles.attributeItem}>
                                        <Icon name='calendar' size={Sizes.fontSizeDefault} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {Frequency}
                                        </ThemedText>
                                    </View>

                                    {/* Attribute 3: Goal */}
                                    <View style={styles.attributeItem}>
                                        <Icon name='target' size={Sizes.fontSizeDefault} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {Goal}
                                        </ThemedText>
                                    </View>

                                    {/* Attribute 4: Level */}
                                    <View style={styles.attributeItem}>
                                        <Icon name={getLevelIcon(Level)} color={themeColors.text} />
                                        <ThemedText type='buttonSmall' style={[styles.attributeText]}>
                                            {Level}
                                        </ThemedText>
                                    </View>
                                </ThemedView>
                                {/* Short Description */}
                                <ThemedText type='italic' style={[{ paddingBottom: Spaces.LG, paddingTop: Spaces.MD }]}>
                                    {Description}
                                </ThemedText>
                            </ThemedView>
                        }
                    />
                    <ThemedView style={([styles.mainContainer], { backgroundColor: themeColors.backgroundTertiary })}>
                        {/* Description Container */}
                        <ThemedView style={[styles.descriptionContainer]}>
                            {/* Equipment Required */}
                            <ThemedText type='button' style={{ paddingBottom: Spaces.XS }}>
                                Equipment Required:
                            </ThemedText>
                            <ThemedText type='body' style={[{ marginBottom: Spaces.LG }]}>
                                {Equipment.join(', ')}
                            </ThemedText>

                            {/* Designed For */}
                            <ThemedText type='button' style={{ paddingBottom: Spaces.XS }}>
                                Designed For:
                            </ThemedText>
                            <ThemedText type='body' style={[{ marginBottom: Spaces.XL }]}>
                                {DesignedFor}
                            </ThemedText>
                            <View
                                style={{
                                    borderBottomColor: themeColors.systemBorderColor,
                                    borderBottomWidth: StyleSheet.hairlineWidth,
                                    marginBottom: Spaces.MD,
                                }}
                            />
                            {CalendarOverview.map((item, index) => (
                                <ThemedView key={index} style={{ marginTop: Spaces.MD }}>
                                    <ThemedText type='button' style={{ paddingBottom: Spaces.XS }}>
                                        {item.Title}:
                                    </ThemedText>
                                    <ThemedText type='body' style={{}}>
                                        {item.Description}
                                    </ThemedText>
                                </ThemedView>
                            ))}
                        </ThemedView>
                        <ThemedView style={styles.bottomButtonContainer}>
                            <TextButton
                                text='Program Calendar'
                                onPress={navigateToProgramCalendar}
                                textType='bodyMedium'
                                size={'LG'}
                                style={[styles.calendarButton]}
                            />
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            </Animated.ScrollView>
            <ThemedView style={styles.buttonContainer}>
                {!isEnrolled && (
                    <PrimaryButton text='Start Program' textType='bodyMedium' style={[styles.startButton]} onPress={handleStartProgram} size='LG' />
                )}
            </ThemedView>
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
    buttonContainer: {
        position: 'absolute',
        bottom: Spaces.XL,
        right: 0,
        left: 0,
        backgroundColor: 'transparent',
        marginHorizontal: '10%',
    },
    startButton: {},
    mainContainer: {
        marginTop: Spaces.LG,
    },
    descriptionContainer: {
        paddingHorizontal: Spaces.LG,
        marginTop: Spaces.XL,
        paddingTop: Spaces.XL,
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
    bottomButtonContainer: {
        alignItems: 'center',
        flex: 1,
        paddingHorizontal: '20%',
    },
    calendarButton: {
        width: '100%',
        marginBottom: Spaces.XXXL,
    },
});

export default ProgramOverviewScreen;
