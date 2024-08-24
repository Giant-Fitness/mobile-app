// app/workout-details.tsx

import React, { useRef } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CustomBackButton } from '@/components/navigation/CustomBackButton';

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const scrollY = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const { name, length, level, equipment, focus, photo, trainer, longText, focusMulti } = route.params;

    const gradientOpacity = scrollY.interpolate({
        inputRange: [0, 300], // Adjust these values based on your image height
        outputRange: [0, 1], // Start with a lighter gradient, become fully opaque
        extrapolate: 'clamp',
    });

    return (
        <ThemedView style={styles.container}>
            <CustomBackButton style={styles.backButton} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode='never'
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                scrollEventThrottle={16}
            >
                <TouchableOpacity onPress={() => console.log('pressed')} style={styles.cardContainer} activeOpacity={1}>
                    <ImageBackground source={photo} style={styles.image}>
                        <Animated.View style={[styles.gradientOverlay, { opacity: gradientOpacity }]}>
                            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
                        </Animated.View>
                        <LinearGradient
                            colors={[
                                'transparent', // Start fully transparent
                                'rgba(0, 0, 0, 0.1)', // Slightly darker near the top
                                'rgba(0, 0, 0, 0.5)', // Halfway through the fade
                                'rgba(0, 0, 0, 0.75)', // Near opaque
                                themeColors.textMedium, // Fully transition to the background color
                            ]}
                            style={styles.bottomFade}
                        />
                        <View style={styles.textContainer}>
                            <ThemedText type='titleLarge' style={[styles.title, { color: themeColors.background }]}>
                                {name}
                            </ThemedText>
                            {/*                            <ThemedText type='subtitle' style={[styles.title, { color: themeColors.textMedium }]}>
                                With {trainer}
                            </ThemedText>*/}
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                <ThemedView style={[styles.details, { backgroundColor: themeColors.backgroundLight }]}>
                    <ThemedText>Duration: {length}</ThemedText>
                    <ThemedText>Level: {level}</ThemedText>
                    <ThemedText>Focus: {focus}</ThemedText>
                    <ThemedText>Equipment: {equipment}</ThemedText>
                    <ThemedText>Trainer: {trainer}</ThemedText>
                    <ThemedText>longText: {longText}</ThemedText>
                    <ThemedText>longText: {longText}</ThemedText>
                    <ThemedText>longText: {longText}</ThemedText>
                    <ThemedText>longText: {longText}</ThemedText>
                    <ThemedText>longText: {longText}</ThemedText>
                    <ThemedText>focusMulti: {focusMulti}</ThemedText>
                </ThemedView>
            </Animated.ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'none',
    },
    image: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        zIndex: 1,
    },
    cardContainer: {
        width: '100%',
        height: 500,
        overflow: 'hidden',
        elevation: 5,
    },
    gradientOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 16,
        paddingLeft: 24,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 15,
        zIndex: 10,
        color: '#fdfcfb',
    },
    title: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowRadius: 10,
        marginRight: 48,
        lineHeight: 40,
        zIndex: 20,
    },
    details: {
        flex: 1,
        padding: 24,
        zIndex: 2,
    },
    textContainer: {
        position: 'absolute',
        bottom: 48,
        left: 24,
        zIndex: 3, // Ensure text is above the gradient
    },
    bottomFade: {
        height: 120,
        marginTop: -120, // Pull the gradient overlay upwards to overlap with the bottom of the image
        zIndex: 2,
    },
});
