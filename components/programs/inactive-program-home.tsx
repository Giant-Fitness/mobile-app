// app/programs/inactive-program-home.tsx

import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { REQUEST_STATE } from '@/constants/requestStates';
import { RecommendedProgramCard } from '@/components/programs/RecommendedProgramCard';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { Icon } from '@/components/base/Icon';
import { useInactiveProgramData } from '@/hooks/useInactiveProgramData';

const MenuItem = ({ title, description, onPress, backgroundColor, textColor, image, isGrid = false, descriptionColor }) => {
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
        <TouchableOpacity
            onPress={onPress}
            style={[styles.menuItem, { backgroundColor, borderColor: textColor, borderWidth: StyleSheet.hairlineWidth }]}
            activeOpacity={0.7}
        >
            <View style={styles.menuContentWrapper}>
                <View style={styles.menuContent}>
                    <View style={styles.titleContainer}>
                        <ThemedText type='title' style={[styles.menuTitle, { color: textColor }]}>
                            {title}
                        </ThemedText>
                        <Icon name='chevron-forward' color={textColor} size={18} style={styles.chevron} />
                    </View>
                    <ThemedText type='overline' style={[styles.menuDescription, { color: descriptionColor }]}>
                        {description}
                    </ThemedText>
                </View>
                <Image
                    source={image}
                    style={[
                        styles.menuBackgroundImage,
                        {
                            opacity: 0.12,
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

    const { isOnboardingComplete, recommendedProgram, dataLoadedState } = useInactiveProgramData();

    // Only show splash during initial app load
    if (dataLoadedState === REQUEST_STATE.PENDING) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    const navigateTo = (route, params = {}) => {
        navigation.navigate(route, params);
    };

    const menuItems = [
        {
            title: 'Find Your Perfect Plan',
            description: 'Let us recommend a plan tailored to your goals',
            image: require('@/assets/images/wand.png'),
            onPress: () => navigateTo('programs/program-recommender-wizard'),
            backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.7),
            textColor: darkenColor(themeColors.tangerineSolid, 0),
            descriptionColor: darkenColor(themeColors.subText, 0.2),
            show: !isOnboardingComplete,
        },
        {
            title: 'Browse Library',
            description: 'Our structured training plans turn your goals into achievements',
            image: require('@/assets/images/clipboard.png'),
            onPress: () => navigateTo('programs/browse-programs'),
            backgroundColor: lightenColor(themeColors.maroonTransparent, 0.3),
            textColor: darkenColor(themeColors.maroonSolid, 0),
            descriptionColor: darkenColor(themeColors.subText, 0.2),
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
                        gradientColors={['transparent', 'transparent']}
                        imageContentFit={'contain'}
                    />
                </View>
            )}

            <View style={menuItems.length > 2 ? styles.gridContainer : styles.menuContainer}>
                {menuItems.length > 2
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
    menuDescription: {
        lineHeight: 21,
        fontSize: 13,
        maxWidth: '90%',
    },
    menuBackgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.SM,
        width: 200,
        height: '60%',
    },
    recommendedProgramContainer: {
        marginHorizontal: Spaces.LG,
    },
    recommendedHeader: {
        marginTop: Spaces.XL,
        marginBottom: Spaces.MD,
    },
    motivationalContainer: {
        marginBottom: 0,
        marginTop: -Spaces.MD,
    },
    imageOverlayContainer: {
        height: Sizes.imageXXLHeight,
        width: '100%',
    },
    menuContainer: {
        marginTop: Spaces.MD,
        paddingBottom: Spaces.LG,
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: Spaces.XS,
    },
    menuTitle: {
        marginBottom: 0,
    },
    chevron: {
        marginLeft: Spaces.XS,
    },
});
