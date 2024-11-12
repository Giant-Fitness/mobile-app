// app/(tabs)/home.tsx

import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ActiveProgramDayCompressedCard } from '@/components/programs/ActiveProgramDayCompressedCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useProgramData } from '@/hooks/useProgramData';
import { ActionTile } from '@/components/home/ActionTile';
import { LargeActionTile } from '@/components/home/LargeActionTile';
import { FactOfTheDay } from '@/components/home/FactOfTheDay';
import { useNavigation } from '@react-navigation/native';
import { darkenColor } from '@/utils/colorUtils';
import { WeightLoggingSheet } from '@/components/progress/WeightLoggingSheet';
import { logWeightMeasurementAsync, getWeightMeasurementsAsync } from '@/store/user/thunks';
import { AppDispatch } from '@/store/store';

export default function HomeScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();

    const [isWeightSheetVisible, setIsWeightSheetVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { user, userProgramProgress } = useProgramData();

    const isFitnessOnboardingComplete = user?.OnboardingStatus?.fitness === true;

    const handleLogWeight = async (weight: number, date: Date) => {
        setIsLoading(true);
        try {
            await dispatch(
                logWeightMeasurementAsync({
                    weight: weight,
                    measurementTimestamp: date.toISOString(),
                }),
            ).unwrap();

            // Refresh measurements after logging
            await dispatch(getWeightMeasurementsAsync()).unwrap();
            setIsWeightSheetVisible(false);
        } catch (error) {
            console.error('Failed to log weight:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWeightTilePress = () => {
        // Pre-fetch measurements when opening the sheet
        // dispatch(getWeightMeasurementsAsync());
        setIsWeightSheetVisible(true);
    };

    const actionTiles = [
        {
            title: 'Track Weight',
            image: require('@/assets/images/weight.png'),
            onPress: handleWeightTilePress,
            backgroundColor: themeColors.purpleTransparent,
            textColor: darkenColor(themeColors.purpleSolid, 0.3),
        },
        // {
        //     title: 'Body Measurements',
        //     image: require('@/assets/images/measure.png'),
        //     onPress: () => console.log('LogMeasurements'),
        //     backgroundColor: themeColors.blueTransparent,
        //     textColor: darkenColor(themeColors.blueSolid, 0.3),
        // },
        // {
        //     title: 'Capture Progress',
        //     image: require('@/assets/images/camera.png'),
        //     onPress: () => console.log('ProgressPhotos'),
        //     backgroundColor: themeColors.tangerineTransparent,
        //     textColor: darkenColor(themeColors.tangerineSolid, 0.3),
        // },
        {
            title: 'Why LMC?',
            image: require('@/assets/images/skipping-rope.png'),
            onPress: () => navigation.navigate('blog/why-lmc'),
            backgroundColor: themeColors.maroonTransparent,
            textColor: darkenColor(themeColors.maroonSolid, 0.3),
        },
    ];

    const renderForYouSection = (reorderTiles = false) => {
        let tiles = [...actionTiles];
        const screenWidth = Dimensions.get('window').width;
        const padding = Spaces.LG * 2; // Left and right padding
        const gap = Spaces.MD; // Gap between tiles
        const numberOfTiles = tiles.length;
        const tileWidth = (screenWidth - padding - gap * (numberOfTiles - 1)) / numberOfTiles;

        if (reorderTiles) {
            // Find the app info tile index
            const appInfoIndex = tiles.findIndex((tile) => tile.title === 'Is LMC for you?');
            if (appInfoIndex !== -1) {
                // Remove and store the app info tile
                const [appInfoTile] = tiles.splice(appInfoIndex, 1);
                // Add it to the beginning
                tiles.unshift(appInfoTile);
            }
        }

        return (
            <>
                <View style={styles.header}>
                    <ThemedText type='titleLarge'>For You</ThemedText>
                </View>

                <View style={styles.actionTilesContainer}>
                    {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionTilesScrollContainer}> */}
                    {tiles.map((tile, index) => (
                        <ActionTile
                            key={index}
                            image={tile.image}
                            title={tile.title}
                            onPress={tile.onPress}
                            backgroundColor={tile.backgroundColor}
                            textColor={tile.textColor}
                            width={tileWidth}
                            style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: tile.textColor }}
                            showChevron={true}
                        />
                    ))}
                    {/* </ScrollView> */}
                </View>
            </>
        );
    };

    const renderContent = () => {
        const greeting = user?.FirstName ? `Hi, ${user.FirstName}!` : 'Hi!';

        // State 1: Has active program (highest priority)
        if (userProgramProgress?.ProgramId) {
            return (
                <>
                    <View style={styles.greeting}>
                        <ThemedText type='greeting'>{greeting}</ThemedText>
                    </View>

                    <View style={styles.header}>
                        <ThemedText type='titleLarge'>Today's Workout</ThemedText>
                    </View>

                    <View style={styles.workoutDayCard}>
                        <ActiveProgramDayCompressedCard />
                    </View>

                    {renderForYouSection()}

                    <FactOfTheDay />
                </>
            );
        }

        // State 2: No active program but completed onboarding
        if (isFitnessOnboardingComplete) {
            return (
                <>
                    <View style={styles.greeting}>
                        <ThemedText type='greeting'>{greeting}</ThemedText>
                    </View>

                    <LargeActionTile
                        title='Start Training'
                        description='Our structured training plans turn your goals into achievements'
                        onPress={() => navigation.navigate('programs/browse-programs')}
                        backgroundColor={themeColors.containerHighlight}
                        image={require('@/assets/images/logo.png')}
                        textColor={themeColors.highlightContainerText}
                    />

                    {renderForYouSection()}

                    <FactOfTheDay />
                </>
            );
        }

        // State 3: No active program and no onboarding (lowest priority)
        return (
            <>
                <View style={styles.greeting}>
                    <ThemedText type='greeting'>{greeting}</ThemedText>
                </View>

                <LargeActionTile
                    title='Get Started'
                    description='Let us recommend a training plan tailored to your goals'
                    onPress={() => navigation.navigate('programs/program-recommender-wizard')}
                    backgroundColor={themeColors.containerHighlight}
                    image={require('@/assets/images/nutrition.png')}
                    textColor={themeColors.highlightContainerText}
                />

                {renderForYouSection(true)}

                <FactOfTheDay />
            </>
        );
    };

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={{
                    justifyContent: 'flex-start',
                }}
                showsVerticalScrollIndicator={false}
            >
                {renderContent()}
            </ScrollView>

            <WeightLoggingSheet
                visible={isWeightSheetVisible}
                onClose={() => setIsWeightSheetVisible(false)}
                onSubmit={handleLogWeight}
                isLoading={isLoading}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        width: '100%',
    },

    greeting: {
        marginTop: Spaces.LG,
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.LG,
    },
    header: {
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.SM,
    },
    workoutDayCard: {
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XL,
    },
    divider: {
        width: '90%',
        alignSelf: 'center',
    },
    actionTilesContainer: {
        paddingHorizontal: Spaces.LG,
        paddingVertical: Spaces.XS,
        flexDirection: 'row',
    },
    actionTilesScrollContainer: {
        paddingHorizontal: Spaces.LG,
        paddingVertical: Spaces.XS,
    },
});
