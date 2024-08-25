// app/workout-details.tsx

import React, { useRef } from 'react';
import { StyleSheet, ScrollView, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { CustomBackButton } from '@/components/navigation/CustomBackButton';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { ImageTextOverlay } from '@/components/images/ImageTextOverlay';

export default function WorkoutDetailScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const scrollY = useRef(new Animated.Value(0)).current;

    // Function to determine the level icons
    const renderLevelIcon = (level) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return <MaterialCommunityIcons name='chevron-up' size={18} color={themeColors.text} />;
            case 'intermediate':
                return <MaterialCommunityIcons name='chevron-double-up' size={18} color={themeColors.text} />;
            case 'advanced':
                return <MaterialCommunityIcons name='chevron-triple-up' size={16} color={themeColors.text} />;
            default:
                return null; // No icon for undefined intensity levels
        }
    };

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const { name, length, level, equipment, focus, photo, trainer, longText, focusMulti } = route.params;

    // Convert focusMulti array to a comma-separated string
    const focusMultiText = focusMulti.join(', ');

    return (
        <ThemedView style={styles.container}>
            <CustomBackButton style={styles.backButton} />
            <Animated.ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode='never'
                scrollEventThrottle={16}
            >
                <ImageTextOverlay
                    photo={photo}
                    title={name}
                    gradientColors={['transparent', 'rgba(0,0,0,0.2)']}
                    containerStyle={{ width: '100%', height: 500, overflow: 'hidden', elevation: 5 }}
                    textContainerStyle={{ bottom: 24 }}
                />

                <ThemedView style={[styles.textContainer, { backgroundColor: themeColors.backgroundLight }]}>
                    <ThemedView style={[styles.attributeRow, { backgroundColor: themeColors.backgroundLight }]}>
                        <ThemedView style={[styles.attribute, { backgroundColor: themeColors.backgroundLight }]}>
                            <Ionicons name='stopwatch-outline' size={18} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.text }]}>
                                {length}
                            </ThemedText>
                        </ThemedView>
                        <ThemedView style={[styles.attribute, { backgroundColor: themeColors.backgroundLight, paddingLeft: 32 }]}>
                            {renderLevelIcon(level)}
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.text, marginLeft: 4 }]}>
                                {level}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow, { backgroundColor: themeColors.backgroundLight }]}>
                        <ThemedView style={[styles.attribute, { backgroundColor: themeColors.backgroundLight }]}>
                            <MaterialCommunityIcons name='dumbbell' size={18} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.text }]}>
                                {equipment}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>
                    <ThemedView style={[styles.attributeRow, { backgroundColor: themeColors.backgroundLight }]}>
                        <ThemedView style={[styles.attribute, { backgroundColor: themeColors.backgroundLight }]}>
                            <MaterialCommunityIcons name='yoga' size={18} color={themeColors.text} />
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.text }]}>
                                {focusMultiText}
                            </ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={[styles.detailsContainer, { backgroundColor: themeColors.backgroundLight }]}>
                        <ThemedText type='body' style={[styles.detailsText, { color: themeColors.textLight }]}>
                            {longText}
                        </ThemedText>
                    </ThemedView>
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
    textContainer: {
        flex: 1,
        padding: 24,
        zIndex: 2,
    },
    attribute: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
    },
    attributeText: {
        marginLeft: 12,
        lineHeight: 24,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    detailsContainer: {
        paddingTop: 24,
        paddingBottom: 36,
    },
    detailsText: {
        lineHeight: 24,
    },
});
