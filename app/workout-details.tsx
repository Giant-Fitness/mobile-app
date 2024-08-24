import React from 'react';
import { Image, StyleSheet, ScrollView, View, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CustomBackButton } from '@/components/navigation/CustomBackButton';

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const { name, length, level, equipment, focus, photo, trainer } = route.params;

    return (
        <ThemedView style={styles.container}>
            <TouchableOpacity onPress={() => console.log('pressed')} style={styles.cardContainer}>
                <ImageBackground source={photo} style={styles.image}>
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.5)']} style={styles.gradientOverlay}>
                        <ThemedText type='titleLarge' style={[styles.title, { color: themeColors.background }]}>
                            {name}
                        </ThemedText>
                        <ThemedText type='subtitle' style={[styles.title, { color: themeColors.textMedium }]}>
                            With {trainer}
                        </ThemedText>
                    </LinearGradient>
                </ImageBackground>
            </TouchableOpacity>
            <CustomBackButton style={styles.backButton} />
            <ThemedView style={styles.details}>
                <ThemedText>Duration: {length}</ThemedText>
                <ThemedText>Level: {level}</ThemedText>
                <ThemedText>Focus: {focus}</ThemedText>
                <ThemedText>Equipment: {equipment}</ThemedText>
                <ThemedText>Trainer: {trainer}</ThemedText>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    image: {
        width: '100%',
        height: 500,
        position: 'absolute',
        top: 0,
        zIndex: 1,
        flex: 1,
    },
    cardContainer: {
        width: '100%',
        height: 600,
        overflow: 'hidden',
        borderRadius: 2,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 4,
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
    textOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 20,
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'center',
        height: '50%',
        zIndex: 2,
    },
    title: {
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
        marginRight: 48, // Add right margin to ensure there's space on the right
        lineHeight: 40, // Reduced line height for tighter text wrapping
    },
    subTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginTop: 8,
    },
    detailsScroll: {
        flex: 1,
        marginTop: 800, // Adjust so the ScrollView starts right below the image
        zIndex: 2,
    },
    details: {
        padding: 20,
    },
});
