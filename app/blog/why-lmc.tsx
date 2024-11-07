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

    // Custom GIF renderer component to handle GIF display within TopImageInfoCard
    const GifRenderer = () => (
        <Image
            source={require('@/assets/gifs/team.gif')}
            style={styles.gifStyle}
            resizeMode="cover"
        />
    );

    const features = [
        {
            title: 'Holistic Wellness Approach',
            icon: 'favorite',
            points: [
                'Comprehensive fitness programs designed by experts',
                'Personalized nutrition guidance with Indian diet focus',
                'Mental wellness support and stress management',
            ],
        },
        {
            title: 'Community-Driven Platform',
            icon: 'groups',
            points: [
                'Connect with like-minded individuals',
                'Regular in-person events and meetups',
                'Share progress and celebrate victories together',
            ],
        },
        {
            title: 'Expert Guidance & Support',
            icon: 'school',
            points: [
                'Learn from certified fitness professionals',
                'Get personalized feedback on your journey',
                'Access to nutrition experts and coaches',
            ],
        },
        {
            title: 'Smart Progress Tracking',
            icon: 'trending-up',
            points: [
                'Intelligent workout recommendations',
                'Body measurement and progress photos',
                'Adaptive nutrition tracking',
            ],
        },
        {
            title: 'Your Voice Matters',
            icon: 'campaign',
            points: [
                'Public product roadmap',
                'Community-driven feature development',
                'Regular feedback sessions and surveys',
            ],
        }
    ];

    const renderFeatureSection = (feature: typeof features[0], index: number) => (
        <ThemedView 
            key={index}
            style={[
                styles.featureContainer,
                { backgroundColor: themeColors.backgroundSecondary }
            ]}
        >
            <View style={styles.featureHeader}>
                <Icon name={feature.icon} size={24} color={themeColors.text} />
                <ThemedText type="titleMedium" style={styles.featureTitle}>
                    {feature.title}
                </ThemedText>
            </View>
            {feature.points.map((point, idx) => (
                <View key={idx} style={styles.pointContainer}>
                    <Icon name="check-circle" size={16} color={themeColors.buttonPrimary} />
                    <ThemedText type="body" style={styles.pointText}>
                        {point}
                    </ThemedText>
                </View>
            ))}
        </ThemedView>
    );

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <AnimatedHeader
                scrollY={scrollY}
                headerInterpolationStart={Spaces.XXL}
                headerInterpolationEnd={Sizes.imageLGHeight}
            />
            <Animated.ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                <TopImageInfoCard
                    CustomImageComponent={GifRenderer}
                    title="Why Choose Lean Machine?"
                    subtitle="Your All-in-One Wellness Partner"
                    titleType="titleLarge"
                    subtitleType="link"
                    subtitleStyle={{ 
                        marginBottom: Spaces.SM,
                        color: themeColors.subText,
                        marginTop: 0
                    }}
                    titleStyle={{ marginBottom: 0 }}
                    containerStyle={{ elevation: 5, marginBottom: 0 }}
                    contentContainerStyle={{
                        backgroundColor: themeColors.background,
                        paddingHorizontal: Spaces.LG,
                    }}
                    imageStyle={{ height: Sizes.imageXXLHeight }}
                    titleFirst={true}
                    extraContent={
                        <ThemedView style={styles.visionContainer}>
                            <ThemedText type="body" style={styles.visionText}>
                                We're building more than just another fitness app - we're creating a supportive community where everyone can achieve their wellness goals together. With expert guidance, personalized support, and a focus on holistic health, we're here to help you become the best version of yourself.
                            </ThemedText>
                        </ThemedView>
                    }
                />
                
                <ThemedView style={styles.featuresContainer}>
                    {features.map((feature, index) => renderFeatureSection(feature, index))}
                </ThemedView>
            </Animated.ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    gifStyle: {
        width: '100%',
        height: Sizes.imageXXLHeight,
    },
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
        gap: Spaces.MD,
    },
    featureContainer: {
        padding: Spaces.LG,
        borderRadius: Spaces.MD,
        gap: Spaces.MD,
    },
    featureHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.MD,
        marginBottom: Spaces.SM,
    },
    featureTitle: {
        flex: 1,
    },
    pointContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spaces.SM,
        paddingLeft: Spaces.SM,
    },
    pointText: {
        flex: 1,
        lineHeight: 20,
    },
});

export default WhyLMCScreen;
