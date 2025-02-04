// app/(app)/programs/program-overview.tsx

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
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
import { SlideUpActionButton } from '@/components/buttons/SlideUpActionButton';
import { useProgramData } from '@/hooks/useProgramData';
import { OverwriteProgramModal } from '@/components/programs/OverwriteProgramModal';

const ProgramOverviewScreen = () => {
    const router = useRouter();
    const { programId } = useLocalSearchParams<{ programId: string }>();
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const { activeProgram: program, userProgramProgress, dataLoadedState, startProgram, error } = useProgramData(programId, undefined, { fetchAllDays: false });

    const [isOverwriteProgramModalVisible, setIsOverwriteProgramModalVisible] = useState(false);

    const scrollY = useSharedValue(0);
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState,
    });

    const isOnThisProgram = userProgramProgress?.ProgramId === programId;
    const isOnAProgram = !!userProgramProgress?.ProgramId;

    const handleStartProgram = () => {
        startProgram();
        router.replace('/(app)/programs/program-start-splash');
    };

    const handleStartProgramConfirm = () => {
        startProgram();
        setIsOverwriteProgramModalVisible(false);
    };

    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return 'level-beginner';
            case 'intermediate':
                return 'level-intermediate';
            case 'advanced':
                return 'level-advanced';
            default:
                return 'people';
        }
    };

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={dataLoadedState === REQUEST_STATE.FULFILLED} />;
    }

    if (error) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the program: {error}</ThemedText>
            </ThemedView>
        );
    }

    if (!program) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Program not found.</ThemedText>
            </ThemedView>
        );
    }

    const { ProgramName, PhotoUrl, Weeks, Frequency, Goal, Level, DescriptionLong, Equipment, DesignedFor, CalendarOverview } = program;

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.backgroundSecondary }]}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Spaces.XXL} headerInterpolationEnd={Sizes.imageLGHeight} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <ThemedView style={{ backgroundColor: themeColors.backgroundSecondary }}>
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
                                <ThemedView style={styles.attributeRow}>
                                    {[
                                        { icon: 'stopwatch', text: `${Weeks} Weeks` },
                                        { icon: 'calendar', text: Frequency },
                                        { icon: 'target', text: Goal },
                                        { icon: getLevelIcon(Level), text: Level },
                                    ].map((attr, index) => (
                                        <View key={index} style={styles.attributeItem}>
                                            <Icon name={attr.icon} size={Sizes.fontSizeDefault} color={themeColors.text} />
                                            <ThemedText type='buttonSmall' style={styles.attributeText}>
                                                {attr.text}
                                            </ThemedText>
                                        </View>
                                    ))}
                                </ThemedView>
                                <ThemedText type='body' style={{ paddingBottom: Spaces.LG, paddingTop: Spaces.MD }}>
                                    {DescriptionLong}
                                </ThemedText>
                            </ThemedView>
                        }
                    />
                    <ThemedView style={[styles.mainContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <ThemedView style={styles.descriptionContainer}>
                            <ThemedText type='button' style={{ paddingBottom: Spaces.XS }}>
                                Equipment Required:
                            </ThemedText>
                            <ThemedText type='body' style={{ marginBottom: Spaces.LG }}>
                                {Equipment.join(', ')}
                            </ThemedText>

                            <View style={[styles.divider, { borderBottomColor: themeColors.systemBorderColor }]} />

                            <ThemedText type='button' style={{ paddingBottom: Spaces.XS }}>
                                Designed For:
                            </ThemedText>
                            <ThemedText type='body' style={{ marginBottom: Spaces.LG }}>
                                {DesignedFor}
                            </ThemedText>

                            {/* <View style={[styles.divider, { borderBottomColor: themeColors.systemBorderColor }]} />

                            <ThemedText type='button' style={{ paddingBottom: Spaces.XS }}>
                                Why Choose this Program:
                            </ThemedText>
                            <ThemedText type='body' style={{ marginBottom: Spaces.SM }}>
                                {WhyChooseThisProgram}
                            </ThemedText> */}
                        </ThemedView>
                        <ThemedView style={styles.descriptionContainer}>
                            {CalendarOverview.map((item, index) => (
                                <ThemedView key={index} style={{ marginTop: Spaces.MD }}>
                                    <ThemedText type='button' style={{ paddingBottom: Spaces.XS }}>
                                        {item.Title}:
                                    </ThemedText>
                                    <ThemedText type='body'>{item.Description}</ThemedText>
                                </ThemedView>
                            ))}
                        </ThemedView>
                        <ThemedView style={styles.bottomButtonContainer}>
                            {isOnAProgram && !isOnThisProgram && (
                                <TextButton
                                    text='Start Program'
                                    onPress={() => setIsOverwriteProgramModalVisible(true)}
                                    textType='bodyMedium'
                                    size='LG'
                                    style={[styles.calendarButton, { marginTop: Spaces.MD }]}
                                />
                            )}
                            {isOnAProgram && isOnThisProgram && (
                                <TextButton
                                    text='View Progress'
                                    onPress={() => router.push('/(app)/programs/active-program-progress')}
                                    textType='bodyMedium'
                                    size='LG'
                                    style={[styles.calendarButton, { marginTop: Spaces.MD }]}
                                />
                            )}
                        </ThemedView>
                    </ThemedView>
                </ThemedView>
            </Animated.ScrollView>
            {!isOnAProgram && (
                <SlideUpActionButton scrollY={scrollY} slideUpThreshold={0}>
                    <PrimaryButton text='Start Program' textType='bodyMedium' style={styles.startButton} onPress={handleStartProgram} size='LG' />
                </SlideUpActionButton>
            )}
            <OverwriteProgramModal
                visible={isOverwriteProgramModalVisible}
                onClose={() => setIsOverwriteProgramModalVisible(false)}
                onConfirm={handleStartProgramConfirm}
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
        marginBottom: Spaces.XXXL,
        paddingBottom: Spaces.XXXL,
    },
    calendarButton: {
        width: '100%',
    },
    divider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginBottom: Spaces.MD,
    },
});

export default ProgramOverviewScreen;
