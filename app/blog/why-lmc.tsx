// blog/why-lmc.tsx

import React from 'react';
import { StyleSheet, ScrollView, View, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { darkenColor } from '@/utils/colorUtils';

const WhyLMCScreen = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const navigation = useNavigation();
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const features = [
        {
            title: 'Balanced Fitness Approach',
            icon: 'star',
            iconSize: 12,
            image: require('@/assets/images/gymnastics-rings.png'),
            points: [
                'Programs that cover strength, cardio, flexibility, and more',
                'Nutrition advice to fit your unique goals',
                'Support to keep your motivation and energy high',
            ],
            backgroundColor: themeColors.purpleTransparent,
            textColor: darkenColor(themeColors.purpleSolid, 0.3),
        },
        {
            title: 'Smart Tracking for Real Progress',
            icon: 'trending-up',
            iconSize: 13,
            image: require('@/assets/images/line-chart.png'),
            points: [
                'Personalized workout suggestions based on your progress',
                'Record every milestone with photos and data',
                'Flexible nutrition tracking to keep you on course',
            ],
            backgroundColor: themeColors.blueTransparent,
            textColor: darkenColor(themeColors.blueSolid, 0.3),
        },
        {
            title: 'Made with You, for You',
            icon: 'campaign',
            iconSize: 18,
            image: require('@/assets/images/megaphone.png'),
            points: [
                "See what's coming next with our public roadmap",
                'Community-driven features shaped by you',
                'Share feedback through surveys and open sessions',
            ],
            backgroundColor: themeColors.maroonTransparent,
            textColor: darkenColor(themeColors.maroonSolid, 0.3),
        },
        // {
        //     title: 'Together We Go Further (Coming Soon)',
        //     icon: 'groups',
        //     points: [
        //         'Connect with like-minded individuals',
        //         'Regular in-person events and meetups',
        //         'Share progress and celebrate victories together',
        //     ],
        // },
        // {
        //     title: 'Expert Guidance & Support',
        //     icon: 'school',
        //     points: [
        //         'Learn from certified fitness professionals',
        //         'Get personalized feedback on your journey',
        //         'Access to nutrition experts and coaches',
        //     ],
        // },
    ];

    const renderFeatureSection = (feature: typeof features[0], index: number) => (
        <ThemedView key={index} style={[styles.featureContainer, { backgroundColor: feature.backgroundColor }]}>
            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    <View style={styles.featureHeader}>
                        <Icon style={{ marginTop: Spaces.XS }} name={feature.icon} size={feature.iconSize} color={feature.textColor} />
                        <ThemedText type='title' style={[styles.featureTitle, { color: feature.textColor }]}>
                            {feature.title}
                        </ThemedText>
                    </View>
                    {feature.points.map((point, idx) => (
                        <View key={idx} style={styles.pointContainer}>
                            <Icon style={{ marginTop: Spaces.XS }} name='check-outline' size={12} color={feature.textColor} />
                            <ThemedText type='overline' style={[styles.pointText, { color: feature.textColor }]}>
                                {point}
                            </ThemedText>
                        </View>
                    ))}
                </View>
                <Image
                    source={feature.image}
                    style={[
                        styles.backgroundImage,
                        {
                            opacity: colorScheme === 'light' ? 0.1 : 0.15,
                            tintColor: feature.textColor,
                        },
                    ]}
                    resizeMode='contain'
                />
            </View>
        </ThemedView>
    );

    return (
        <ThemedView style={{ paddingTop: Spaces.XXL, flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader scrollY={scrollY} headerInterpolationStart={Spaces.SM} headerInterpolationEnd={Spaces.MD} />
            <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <TopImageInfoCard
                    image={require('@/assets/images/team.svg')}
                    title='The LMC Difference'
                    subtitle='Fitness, Simplified and Supercharged'
                    titleType='titleLarge'
                    subtitleType='link'
                    subtitleStyle={{
                        marginBottom: Spaces.SM,
                        color: themeColors.subText,
                        marginTop: 0,
                    }}
                    titleStyle={{ marginBottom: 0 }}
                    contentContainerStyle={{
                        backgroundColor: themeColors.background,
                        paddingHorizontal: Spaces.LG,
                        paddingBottom: 0,
                    }}
                    useImageContainer={true}
                    imageStyle={{ height: Sizes.imageXXLHeight }}
                    titleFirst={true}
                />

                <ThemedView style={styles.descriptionContainer}>
                    <ThemedView>
                        <View>
                            <View>
                                <ThemedText type='link' style={[styles.descriptionText]}>
                                    Starting a fitness journey can be daunting – there's a lot of "What do I do?" and "How do I stay on track?" That's why we
                                    created LMC: to simplify the steps and give you everything you need to succeed without overthinking.
                                </ThemedText>
                                <ThemedText
                                    type='link'
                                    style={[
                                        styles.descriptionText,
                                        {
                                            marginTop: Spaces.MD,
                                        },
                                    ]}
                                >
                                    LMC isn't just about fitness; it's about creating something together. Your feedback and ideas shape LMC, helping us make it
                                    the best fit for you and the whole community.
                                </ThemedText>
                            </View>
                        </View>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.featuresContainer}>{features.map((feature, index) => renderFeatureSection(feature, index))}</ThemedView>
            </Animated.ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    visionContainer: {
        paddingVertical: Spaces.MD,
        paddingHorizontal: Spaces.SM,
    },
    visionText: {
        lineHeight: 24,
        textAlign: 'center',
    },
    featuresContainer: {
        padding: Spaces.MD,
        paddingBottom: Spaces.XL,
        gap: Spaces.LG,
    },
    featureContainer: {
        borderRadius: Spaces.MD,
        overflow: 'hidden',
    },
    contentWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        padding: Spaces.LG,
        flex: 1,
        zIndex: 1,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spaces.SM,
        marginBottom: Spaces.MD,
    },
    featureTitle: {
        flex: 1,
    },
    pointContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spaces.SM,
        paddingLeft: Spaces.SM,
        marginBottom: Spaces.SM,
    },
    pointText: {
        flex: 1,
        lineHeight: 20,
        fontSize: 14,
    },
    backgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.SM,
        width: 200,
        height: '80%',
    },
    descriptionContainer: {
        paddingHorizontal: Spaces.LG,
        paddingTop: Spaces.MD,
        paddingBottom: Spaces.XL,
    },
    descriptionText: {
        lineHeight: 21,
    },
});

export default WhyLMCScreen;
