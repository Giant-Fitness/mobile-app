// components/programs/WorkoutCompletedCard.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { moderateScale } from '@/utils/scaling';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

import { ImageTextOverlay } from '../media/ImageTextOverlay';

interface WorkoutCompletedCardProps {
    onBrowseSolos: () => void;
}

export const WorkoutCompletedCard = ({ onBrowseSolos }: WorkoutCompletedCardProps) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const handlePress = () => {
        onBrowseSolos();
        trigger('impactMedium');
    };

    const renderBadge = () => (
        <View style={[styles.floatingBadge, { backgroundColor: themeColors.tangerineSolid }]}>
            <Icon name='saved-search' color={themeColors.white} size={12} style={{ marginRight: Spaces.XS }} />
            <ThemedText type='buttonSmall' style={[styles.badgeText, { color: themeColors.white }]}>
                Browse
            </ThemedText>
        </View>
    );

    return (
        <View
            style={[
                styles.tileContainer,
                styles.shadowContainer,
                {
                    marginBottom: Spaces.XL,
                    height: Sizes.imageLGHeight,
                    overflow: 'hidden',
                },
            ]}
        >
            <TouchableOpacity onPress={handlePress} style={styles.touchableContainer} activeOpacity={1}>
                <View style={styles.imageContainer}>
                    <ImageTextOverlay
                        image={require('@/assets/images/extra-work.jpg')}
                        title={'Workout Complete'}
                        subtitle='Ready for more? Browse solo workouts for extra training'
                        gradientColors={['rgba(50,50,50,0.3)', 'rgba(50,50,50,0.8)']}
                        containerStyle={{ height: '100%' }}
                        subtitleType='bodySmall'
                        titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20), marginBottom: Spaces.XXS }}
                        subtitleStyle={{ marginRight: Spaces.XXXL + Spaces.XL }}
                    />
                    {renderBadge()}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tileContainer: {
        borderRadius: Spaces.SM,
        overflow: 'hidden',
        position: 'relative',
    },
    shadowContainer: {
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    touchableContainer: {
        flex: 1,
        position: 'relative',
    },
    imageContainer: {
        position: 'relative',
        height: '100%',
    },
    // Floating badge styles
    floatingBadge: {
        position: 'absolute',
        bottom: Spaces.SM + Spaces.XS,
        right: Spaces.SM + Spaces.XS,
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
