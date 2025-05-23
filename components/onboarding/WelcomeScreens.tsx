// components/onboarding/WelcomeScreens.tsx

import * as React from 'react';
import { View, Dimensions, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import Animated, {
    useAnimatedScrollHandler,
    useSharedValue,
    useAnimatedStyle,
    interpolate,
    runOnJS,
    withTiming,
    WithTimingConfig,
} from 'react-native-reanimated';
import { router } from 'expo-router';

import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { PrimaryButton } from '../buttons/PrimaryButton';

interface WelcomeItem {
    id: number;
    title: string;
    description: string[];
    image: ImageSourcePropType;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WelcomeScreens: React.FC = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollX = useSharedValue(0);
    const buttonOpacity = useSharedValue(0);

    const welcomeItems: WelcomeItem[] = [
        {
            id: 0,
            title: "Let's Get Started!",
            description: [
                'Confused where to start? Struggling to stay on track?',
                'With clear plans, guided videos, and a growing community, Kyn is fitness that fits',
            ],
            image: require('@/assets/images/fist.png'),
        },
        {
            id: 1,
            title: 'Smart Training Plans',
            description: ['No guesswork — just expert-designed programs for home or gym, built for all fitness levels.'],
            image: require('@/assets/images/workouts.png'),
        },
        {
            id: 2,
            title: 'Guided Follow-Along Workouts',
            description: ['Hit play and train with confidence — no thinking, just moving with support.'],
            image: require('@/assets/images/boxing-glove.png'),
        },
        {
            id: 3,
            title: 'Supercharged Progress Tracking',
            description: ['Simple logging that keeps you honest — and progress you can actually see.'],
            image: require('@/assets/images/progress.png'),
        },
    ];

    const animationConfig: WithTimingConfig = {
        duration: 300,
    };

    const updateIndex = React.useCallback(
        (index: number) => {
            if (index === welcomeItems.length - 1) {
                buttonOpacity.value = withTiming(1, animationConfig);
            } else {
                buttonOpacity.value = withTiming(0, animationConfig);
            }
        },
        [welcomeItems.length],
    );

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
            const newIndex = Math.round(event.contentOffset.x / SCREEN_WIDTH);
            runOnJS(updateIndex)(newIndex);
        },
    });

    const handleNavigateToLogin = () => {
        router.push('/(auth)/login');
    };

    const buttonAnimatedStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ translateY: interpolate(buttonOpacity.value, [0, 1], [50, 0]) }],
    }));

    const renderDot = (index: number) => {
        const inputRange = [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH];

        const dotWidth = useAnimatedStyle(() => {
            const width = interpolate(scrollX.value, inputRange, [8, 16, 8], 'clamp');
            const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], 'clamp');
            return {
                width,
                opacity,
            };
        });

        return <Animated.View key={`dot-${index}`} style={[styles.paginationDot, dotWidth, { backgroundColor: themeColors.buttonPrimary }]} />;
    };

    const renderWelcomeScreen = (item: WelcomeItem) => (
        <View key={`screen-${item.id}`} style={[styles.slide, styles.welcomeSlide]}>
            <View style={styles.welcomeContent}>
                <Image source={item.image} style={styles.logoImage} resizeMode='contain' />
                <View style={styles.welcomeTextContainer}>
                    <ThemedText type='headline' style={styles.welcomeTitle}>
                        {item.title}
                    </ThemedText>
                    {item.description.map((paragraph, index) => (
                        <ThemedText key={`paragraph-${item.id}-${index}`} type='overline' style={styles.featureDescription}>
                            {paragraph}
                        </ThemedText>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderFeatureScreen = (item: WelcomeItem) => (
        <View key={`screen-${item.id}`} style={[styles.slide, styles.featureSlide]}>
            <View style={styles.featureContent}>
                <Image source={item.image} style={styles.featureImage} resizeMode='contain' />
                <View style={styles.featureTextContainer}>
                    <ThemedText type='headline' style={styles.featureTitle}>
                        {item.title}
                    </ThemedText>
                    {item.description.map((paragraph, index) => (
                        <ThemedText key={`paragraph-${item.id}-${index}`} type='overline' style={styles.featureDescription}>
                            {paragraph}
                        </ThemedText>
                    ))}
                </View>
            </View>
        </View>
    );

    return (
        <ThemedView style={styles.container}>
            <Animated.ScrollView
                horizontal
                pagingEnabled
                bounces={false}
                showsHorizontalScrollIndicator={false}
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                {welcomeItems.map((item) => (item.id === 0 ? renderWelcomeScreen(item) : renderFeatureScreen(item)))}
            </Animated.ScrollView>

            <View style={styles.footer}>
                <View style={styles.paginationContainer}>{welcomeItems.map((_, index) => renderDot(index))}</View>

                <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
                    <PrimaryButton
                        text='Get Started'
                        onPress={handleNavigateToLogin}
                        style={styles.button}
                        textStyle={{ color: themeColors.buttonPrimaryText }}
                        size='MD'
                    />
                </Animated.View>
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    slide: {
        width: SCREEN_WIDTH,
        flex: 1,
    },
    // Welcome Screen Specific Styles
    welcomeSlide: {
        justifyContent: 'center',
    },
    welcomeContent: {
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        gap: Spaces.XL,
    },
    welcomeTextContainer: {
        alignItems: 'center',
        gap: Spaces.MD,
    },
    welcomeTitle: {
        textAlign: 'center',
        marginBottom: Spaces.SM,
    },
    welcomeDescription: {
        textAlign: 'center',
        paddingHorizontal: Spaces.LG,
    },
    logoImage: {
        height: Sizes.imageLGHeight,
        width: SCREEN_WIDTH * 0.6,
    },
    // Feature Screen Specific Styles
    featureSlide: {
        justifyContent: 'center',
    },
    featureContent: {
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        gap: Spaces.XL,
    },
    featureImage: {
        height: Sizes.imageMDHeight,
        width: SCREEN_WIDTH * 0.8,
        marginBottom: Spaces.MD,
    },
    featureTextContainer: {
        alignItems: 'center',
        gap: Spaces.MD,
        paddingHorizontal: Spaces.MD,
    },
    featureTitle: {
        textAlign: 'center',
        marginBottom: Spaces.SM,
    },
    featureDescription: {
        textAlign: 'center',
    },
    // Footer Styles
    footer: {
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.XXL,
        gap: Spaces.MD,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spaces.SM,
        height: Spaces.SM,
    },
    paginationDot: {
        height: Spaces.SM,
        borderRadius: Spaces.XS,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: Spaces.XL,
        left: Spaces.MD,
        right: Spaces.MD,
    },
    button: {
        width: '90%',
        paddingVertical: Spaces.MD,
        borderRadius: Spaces.XL,
        alignItems: 'center',
        alignSelf: 'center',
    },
});

export default WelcomeScreens;
