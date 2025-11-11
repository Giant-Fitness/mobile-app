// components/programs/RecommendedProgramCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Program } from '@/types';
import { moderateScale } from '@/utils/scaling';
import React, { useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

type RecommendedProgramCardProps = {
    program: Program;
    onPress: () => void;
    compressed?: boolean;
};

export const RecommendedProgramCard: React.FC<RecommendedProgramCardProps> = ({ program, onPress, compressed = false }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const shadowColor = 'rgba(0,0,0,0.2)';

    // Animation value for press feedback
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const badgeScaleAnim = useRef(new Animated.Value(1)).current;

    const imageHeight = compressed ? Sizes.imageLGHeight : Sizes.imageXLHeight;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.97,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(badgeScaleAnim, {
                toValue: 0.95,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(badgeScaleAnim, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = () => {
        trigger('impactLight');
        onPress();
    };

    const renderBadge = () => {
        const badgeColor = themeColors.tangerineSolid;
        const badgeTextColor = themeColors.white;
        const text = compressed ? 'Recommended' : 'Start';
        const icon = compressed ? 'star' : 'play';
        return (
            <Animated.View
                style={[
                    styles.floatingBadge,
                    {
                        backgroundColor: badgeColor,
                        shadowColor: shadowColor,
                        transform: [{ scale: badgeScaleAnim }],
                    },
                ]}
            >
                <Icon name={icon} color={badgeTextColor} size={12} style={{ marginRight: 4 }} />
                <ThemedText type='buttonSmall' style={[styles.badgeText, { color: badgeTextColor }]}>
                    {text}
                </ThemedText>
            </Animated.View>
        );
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
                        containerStyle={{ height: imageHeight }}
                        titleType='titleLarge'
                        gradientColors={['transparent', 'rgba(0,0,0,0.7)']}
                        subtitle={`${program.Goal}, ${program.Weeks} Weeks`}
                        subtitleType='bodySmall'
                        titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20), marginBottom: 0 }}
                        subtitleStyle={{ marginTop: 0 }}
                    />
                    {renderBadge()}
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
    },
    cardContainer: {
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },

    // Floating badge styles
    floatingBadge: {
        position: 'absolute',
        bottom: Spaces.MD,
        right: Spaces.MD,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spaces.SM,
        paddingVertical: Spaces.XS,
        borderRadius: Spaces.MD,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
        zIndex: 10,
    },
    badgeText: {
        fontSize: 11,
    },
});

export default RecommendedProgramCard;
