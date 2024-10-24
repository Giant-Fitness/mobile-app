// app/programs/inactive-program-home.tsx

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Icon } from '@/components/base/Icon';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { getUserRecommendationsAsync } from '@/store/user/thunks';
import { getProgramAsync } from '@/store/programs/thunks';
import { AppDispatch, RootState } from '@/store/rootReducer';
import { REQUEST_STATE } from '@/constants/requestStates';
import { RecommendedProgramCard } from '@/components/programs/RecommendedProgramCard';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { moderateScale } from '@/utils/scaling';
import motivationalImage from '@/assets/images/pilates-bro.svg';

const MenuItem = ({ icon, title, text, onPress, titleColor, textColor, chevronColor, leftIconColor, backgroundColor, iconSize }) => (
    <TouchableOpacity style={styles.menuItem} activeOpacity={1} onPress={onPress}>
        <View style={styles.menuItemLeft}>
            <View style={[styles.iconBox, { backgroundColor }]}>
                <Icon name={icon} size={iconSize} color={leftIconColor} />
            </View>
            <View style={styles.menuTextContainer}>
                <ThemedText type='buttonSmall' style={[styles.menuTitle, { color: titleColor }]}>
                    {title}
                </ThemedText>
                <ThemedText type='bodySmall' style={[styles.menuText, { color: textColor }]}>
                    {text}
                </ThemedText>
            </View>
        </View>
    </TouchableOpacity>
);

export default function InactiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();

    const [dataLoaded, setDataLoaded] = useState(REQUEST_STATE.PENDING);
    const { user, userRecommendations, userRecommendationsState, error: userError } = useSelector((state: RootState) => state.user);
    const { programs, programDays, programsState, programDaysState } = useSelector((state: RootState) => state.programs);

    const isOnboardingComplete = user.OnboardingStatus?.fitness === true;

    useEffect(() => {
        const fetchData = async () => {
            if (isOnboardingComplete) {
                if (userRecommendationsState !== REQUEST_STATE.FULFILLED) {
                    await dispatch(getUserRecommendationsAsync(user.UserId));
                }

                if (userRecommendations && userRecommendations.RecommendedProgramID) {
                    await dispatch(getProgramAsync({ programId: userRecommendations.RecommendedProgramID }));
                }
            }

            setDataLoaded(REQUEST_STATE.FULFILLED);
        };

        fetchData();
    }, [dispatch, user.UserId, userRecommendationsState, isOnboardingComplete]);

    const { showSplash, handleSplashComplete } = useSplashScreen({
        dataLoadedState: dataLoaded,
    });

    if (showSplash) {
        return <DumbbellSplash onAnimationComplete={handleSplashComplete} isDataLoaded={false} />;
    }

    const recommendedProgram = isOnboardingComplete && userRecommendations?.RecommendedProgramID ? programs[userRecommendations.RecommendedProgramID] : null;

    const navigateTo = (route, params = {}) => {
        navigation.navigate(route, params);
    };

    const menuItems = [
        {
            icon: 'library',
            title: 'Browse Library',
            iconSize: Sizes.iconSizeMD,
            text: 'Our structured training plans turn your goals into achievements',
            onPress: () => navigateTo('programs/browse-programs'),
        },
    ];

    if (!isOnboardingComplete) {
        menuItems.unshift({
            icon: 'magic-wand',
            title: 'Find Your Perfect Plan',
            iconSize: Sizes.iconSizeSM,
            text: 'Let us recommend a plan tailored to your goals',
            onPress: () => navigateTo('programs/program-recommender-wizard'),
        });
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: themeColors.background }]}
            contentContainerStyle={{
                justifyContent: 'flex-start',
            }}
            showsVerticalScrollIndicator={false}
        >
            {isOnboardingComplete && recommendedProgram ? (
                <View style={styles.recommendedProgramContainer}>
                    <ThemedText type='title' style={[styles.recommendedHeader, { color: themeColors.text }]}>
                        {'Your Journey Starts Here'}
                    </ThemedText>
                    <RecommendedProgramCard
                        program={recommendedProgram}
                        onPress={() => navigateTo('programs/program-overview', { programId: recommendedProgram.ProgramId })}
                    />
                </View>
            ) : (
                <View style={styles.motivationalContainer}>
                    <ImageTextOverlay
                        image={motivationalImage}
                        containerStyle={styles.imageOverlayContainer}
                        titleType='titleLarge'
                        gradientColors={['transparent', 'transparent']}
                    />
                    {/*                    <ThemedText type='titleLarge' style={[styles.motivationalQuote, { color: themeColors.tipText }]}>
                        Join the Hustle!
                    </ThemedText>*/}
                </View>
            )}

            <View style={styles.menuWrapper}>
                {menuItems.map((item, index) => (
                    <ThemedView key={index} style={[styles.menuContainer, { backgroundColor: themeColors.backgroundSecondary }]}>
                        <MenuItem
                            {...item}
                            titleColor={themeColors.text}
                            textColor={themeColors.subText}
                            leftIconColor={themeColors.tipText}
                            backgroundColor={`${themeColors.tipBackground}`}
                        />
                    </ThemedView>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    menuItem: {
        paddingVertical: Spaces.MD,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        marginRight: Spaces.SM,
    },
    menuContainer: {
        marginHorizontal: Spaces.MD,
        paddingHorizontal: Spaces.MD,
        marginBottom: Spaces.LG,
        borderRadius: Spaces.MD,
    },
    iconBox: {
        width: Spaces.XXXL,
        height: Spaces.XXXL,
        borderRadius: Spaces.SM,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spaces.MD,
    },
    recommendedProgramContainer: {
        marginHorizontal: Spaces.LG,
    },
    menuTextContainer: {
        alignItems: 'flex-start',
        flex: 1,
        marginRight: 0,
    },
    menuText: {
        flexShrink: 1,
        lineHeight: Spaces.MD,
    },
    recommendedHeader: {
        marginTop: Spaces.XL,
        marginBottom: Spaces.MD,
    },
    motivationalContainer: {
        marginBottom: Spaces.LG,
        alignItems: 'left',
    },
    motivationalImage: {
        width: '100%',
        height: Sizes.imageLGHeight,
    },
    motivationalQuote: {
        marginTop: Spaces.MD,
        marginLeft: Spaces.XL,
        textAlign: 'left',
    },
    imageOverlayContainer: {
        height: Sizes.imageXLHeight,
        width: '100%',
    },
});
