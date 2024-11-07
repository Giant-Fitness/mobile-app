// app/programs/inactive-program-home.tsx

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useSplashScreen } from '@/hooks/useSplashScreen';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { getUserRecommendationsAsync } from '@/store/user/thunks';
import { getProgramAsync } from '@/store/programs/thunks';
import { AppDispatch, RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { RecommendedProgramCard } from '@/components/programs/RecommendedProgramCard';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { darkenColor } from '@/utils/colorUtils';

const MenuItem = ({ title, description, onPress, backgroundColor, textColor, image, isGrid = false }) => {
    if (isGrid) {
        return (
            <TouchableOpacity onPress={onPress} style={[styles.gridMenuItem, { backgroundColor }]} activeOpacity={0.7}>
                <View style={styles.gridContentWrapper}>
                    <Image source={image} style={[styles.gridImage, { tintColor: textColor }]} resizeMode='contain' />
                    <ThemedText type='overline' style={[styles.gridTitle, { color: textColor }]} numberOfLines={2}>
                        {title}
                    </ThemedText>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity onPress={onPress} style={[styles.menuItem, { backgroundColor }]} activeOpacity={0.7}>
            <View style={styles.menuContentWrapper}>
                <View style={styles.menuContent}>
                    <ThemedText type='title' style={[styles.menuTitle, { color: textColor }]}>
                        {title}
                    </ThemedText>
                    <ThemedText type='overline' style={[styles.menuDescription, { color: textColor }]}>
                        {description}
                    </ThemedText>
                </View>
                <Image
                    source={image}
                    style={[
                        styles.menuBackgroundImage,
                        {
                            opacity: 0.15,
                            tintColor: textColor,
                        },
                    ]}
                    resizeMode='contain'
                />
            </View>
        </TouchableOpacity>
    );
};

export default function InactiveProgramHome() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();
    const dispatch = useDispatch<AppDispatch>();

    const [dataLoaded, setDataLoaded] = useState(REQUEST_STATE.PENDING);
    const { user, userRecommendations, userRecommendationsState } = useSelector((state: RootState) => state.user);
    const { programs } = useSelector((state: RootState) => state.programs);

    const isOnboardingComplete = user?.OnboardingStatus?.fitness === true;

    useEffect(() => {
        const fetchData = async () => {
            if (isOnboardingComplete) {
                if (userRecommendationsState !== REQUEST_STATE.FULFILLED) {
                    await dispatch(getUserRecommendationsAsync());
                }

                if (userRecommendations && userRecommendations.RecommendedProgramID) {
                    await dispatch(getProgramAsync({ programId: userRecommendations.RecommendedProgramID }));
                }
            }
            setDataLoaded(REQUEST_STATE.FULFILLED);
        };

        fetchData();
    }, [dispatch, user?.UserId, userRecommendationsState, isOnboardingComplete]);

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
            title: 'Find Your Perfect Plan',
            description: 'Let us recommend a plan tailored to your goals',
            image: require('@/assets/images/wand.png'),
            onPress: () => navigateTo('programs/program-recommender-wizard'),
            backgroundColor: darkenColor(themeColors.tangerineTransparent, 0),
            textColor: darkenColor(themeColors.tangerineSolid, 0.4),
            show: !isOnboardingComplete,
        },
        {
            title: 'Browse Library',
            description: 'Our structured training plans turn your goals into achievements',
            image: require('@/assets/images/clipboard.png'),
            onPress: () => navigateTo('programs/browse-programs'),
            backgroundColor: themeColors.tangerineTransparent,
            textColor: darkenColor(themeColors.tangerineSolid, 0.3),
            show: true,
        },
    ].filter((item) => item.show);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: themeColors.background }]}
            contentContainerStyle={{ justifyContent: 'flex-start' }}
            showsVerticalScrollIndicator={false}
        >
            {isOnboardingComplete && recommendedProgram ? (
                <View style={styles.recommendedProgramContainer}>
                    <ThemedText type='titleLarge' style={[styles.recommendedHeader, { color: themeColors.text }]}>
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
                        image={require('@/assets/images/trainer-2.png')}
                        containerStyle={styles.imageOverlayContainer}
                        titleType='titleLarge'
                        gradientColors={['transparent', 'transparent']}
                    />
                </View>
            )}

            <View style={menuItems.length > 1 ? styles.gridContainer : styles.menuContainer}>
                {menuItems.length > 1
                    ? // Grid layout for multiple items
                      menuItems.map((item, index) => {
                          const screenWidth = Dimensions.get('window').width;
                          const padding = Spaces.LG * 2;
                          const gap = Spaces.MD;
                          const tileWidth = (screenWidth - 1.01 * padding - gap) / 2;

                          return (
                              <View key={index} style={[{ width: tileWidth }, index % 2 === 0 ? { marginRight: gap / 2 } : { marginLeft: gap / 2 }]}>
                                  <MenuItem {...item} isGrid={true} />
                              </View>
                          );
                      })
                    : // Full-width layout for single item
                      menuItems.map((item, index) => <MenuItem key={index} {...item} isGrid={false} />)}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    menuItem: {
        borderRadius: Spaces.MD,
        overflow: 'hidden',
        marginBottom: Spaces.LG,
        marginHorizontal: Spaces.LG,
    },
    menuContentWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuContent: {
        padding: Spaces.LG,
        flex: 1,
        zIndex: 1,
    },
    menuTitle: {
        marginBottom: Spaces.XS,
    },
    menuDescription: {
        lineHeight: 21,
        fontSize: 14,
        maxWidth: '90%',
    },
    menuBackgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.SM,
        width: 200,
        height: '80%',
    },
    recommendedProgramContainer: {
        marginHorizontal: Spaces.LG,
    },
    recommendedHeader: {
        marginTop: Spaces.XL,
        marginBottom: Spaces.MD,
    },
    motivationalContainer: {
        marginBottom: Spaces.LG,
    },
    imageOverlayContainer: {
        height: Sizes.imageXXLHeight,
        width: '100%',
    },
    menuContainer: {
        marginTop: Spaces.MD,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: Spaces.XL,
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XL,
    },
    gridMenuItem: {
        borderRadius: Spaces.MD,
        padding: Spaces.SM + Spaces.XS,
        height: 120,
        justifyContent: 'space-between',
    },
    gridContentWrapper: {
        flex: 1,
        justifyContent: 'space-between',
    },
    gridImage: {
        width: 42,
        height: 42,
        marginBottom: Spaces.XXS,
    },
    gridTitle: {
        fontSize: 15,
        lineHeight: 18,
    },
});
