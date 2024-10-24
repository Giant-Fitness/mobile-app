// components/programs/RecommendedProgramCard.tsx

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { ImageTextOverlay } from '@/components/media/ImageTextOverlay';
import { Icon } from '@/components/base/Icon';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Program } from '@/types';

type RecommendedProgramCardProps = {
    program: Program;
    onPress: () => void;
};

export const RecommendedProgramCard: React.FC<RecommendedProgramCardProps> = ({ program, onPress }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const cardBackgroundColor = themeColors.containerHighlight;
    const textColor = themeColors.background;
    const shadowColor = 'rgba(0,0,0,0.2)';
    return (
        <TouchableOpacity onPress={onPress} style={[styles.shadowContainer, { shadowColor: shadowColor }]} activeOpacity={1}>
            <View style={styles.cardContainer}>
                <View style={styles.imageContainer}>
                    <ImageTextOverlay
                        image={{ uri: program.PhotoUrl }}
                        title={program.ProgramName}
                        containerStyle={styles.imageOverlayContainer}
                        titleType='titleLarge'
                        gradientColors={['transparent', 'rgba(0,0,0,0.7)']}
                        subtitle={`${program.Goal}`}
                        subtitleType='bodySmall'
                        titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20), marginBottom: 0 }}
                        subtitleStyle={{ marginTop: 0 }}
                    />
                    {/*                    <View style={[styles.recommendedOverlay, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                        <Icon name='star' size={Sizes.fontSizeDefault} color={'rgba(0,0,0,0.95)'} />
                        <ThemedText type='buttonSmall' style={[styles.activeText, { marginLeft: Spaces.XS }]}>
                            Recommended
                        </ThemedText>
                    </View>
*/}
                </View>
            </View>
        </TouchableOpacity>
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
    recommendedOverlay: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        top: Spaces.LG,
        left: 0,
        paddingVertical: Spaces.XS,
        paddingHorizontal: Spaces.MD,
        borderTopRightRadius: Spaces.SM,
        borderBottomRightRadius: Spaces.SM,
    },
});

export default RecommendedProgramCard;
