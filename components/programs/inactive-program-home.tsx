// app/programs/inactive-program-home.tsx

import { DumbbellSplash } from '@/components/base/DumbbellSplash';
import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { RecommendedProgramCard } from '@/components/programs/RecommendedProgramCard';
import { Colors } from '@/constants/Colors';
import { REQUEST_STATE } from '@/constants/requestStates';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInactiveProgramData } from '@/hooks/useInactiveProgramData';
import { darkenColor, lightenColor } from '@/utils/colorUtils';
import { debounce } from '@/utils/debounce';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';

import { trigger } from 'react-native-haptic-feedback';

interface MenuItemProps {
    title: string;
    description: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    image: any;
    descriptionColor: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ title, description, onPress, backgroundColor, textColor, image, descriptionColor }) => {
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

    const { isOnboardingComplete, recommendedProgram, dataLoadedState } = useInactiveProgramData();

    // Only show splash during initial app load
    if (dataLoadedState === REQUEST_STATE.PENDING) {
        return <DumbbellSplash isDataLoaded={false} />;
    }

    const navigateTo = (route: 'onboarding/biodata/step-1-gender' | 'programs/browse-programs' | 'programs/program-overview', params = {}) => {
        debounce(router, { pathname: `/(app)/${route}` as const, params });
    };

    const menuItems = [
        {
            title: !isOnboardingComplete ? 'Find Your Perfect Program' : 'Browse Programs',
            description: !isOnboardingComplete
                ? 'Let us recommend a Program tailored to your goals'
                : "Want options? We've got tons of other programs to explore",
            image: !isOnboardingComplete ? require('@/assets/images/wand.png') : require('@/assets/images/clipboard.png'),
            onPress: () => {
                navigateTo(!isOnboardingComplete ? 'onboarding/biodata/step-1-gender' : 'programs/browse-programs');
                trigger('selection');
            },
            backgroundColor: !isOnboardingComplete ? themeColors.containerHighlight : lightenColor(themeColors.tangerineTransparent, 0.7),
            textColor: !isOnboardingComplete ? themeColors.highlightContainerText : darkenColor(themeColors.tangerineSolid, 0),
            descriptionColor: !isOnboardingComplete ? lightenColor(themeColors.subTextSecondary, 0.1) : darkenColor(themeColors.subText, 0.2),
            show: true,
        },
        // Only show the second menu item (Browse Library/Retake Quiz) if onboarding is NOT complete
        ...(!isOnboardingComplete
            ? [
                  {
                      title: 'Browse Programs',
                      description: 'Our training programs turn your goals into achievements',
                      image: require('@/assets/images/clipboard.png'),
                      onPress: () => navigateTo('programs/browse-programs'),
                      backgroundColor: lightenColor(themeColors.tangerineTransparent, 0.7),
                      textColor: darkenColor(themeColors.tangerineSolid, 0),
                      descriptionColor: darkenColor(themeColors.subText, 0.2),
                      show: true,
                  },
              ]
            : []),
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
                        Recommended Program
                    </ThemedText>
                    <RecommendedProgramCard
                        program={recommendedProgram}
                        onPress={() => navigateTo('programs/program-overview', { programId: recommendedProgram.ProgramId, source: 'inactive-program-home' })}
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

            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <MenuItem key={index} {...item} />
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
        borderRadius: Spaces.SM,
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
