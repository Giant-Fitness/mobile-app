// components/programs/RecommendedProgramCard.tsx

import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Program } from '@/types';
import { moderateScale } from '@/utils/scaling';
import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

type RecommendedProgramCardProps = {
    program: Program;
    onPress: () => void;
};

export const RecommendedProgramCard: React.FC<RecommendedProgramCardProps> = ({ program, onPress }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const shadowColor = 'rgba(0,0,0,0.2)';

    // Animation value for press feedback
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = () => {
        onPress();
    };

    return (
        <Animated.View
            style={[
                styles.shadowContainer,
                {
                    shadowColor,
                    backgroundColor: themeColors.background,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={styles.cardContainer}>
                <View style={styles.imageContainer}>
                    <ImageTextOverlay
                        image={{ uri: program.PhotoUrl }}
                        title={program.ProgramName}
                        containerStyle={styles.imageOverlayContainer}
                        titleType='titleLarge'
                        gradientColors={['transparent', 'rgba(0,0,0,0.7)']}
                        subtitle={`${program.Goal}, ${program.Weeks} Weeks`}
                        subtitleType='bodySmall'
                        titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20), marginBottom: 0 }}
                        subtitleStyle={{ marginTop: 0 }}
                    />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 4, // For Android
        borderRadius: Spaces.SM,
        marginBottom: Spaces.XL,
    },
    cardContainer: {
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    imageOverlayContainer: {
        height: Sizes.imageXLHeight,
    },
});

export default RecommendedProgramCard;
