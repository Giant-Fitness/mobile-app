// components/programs/ProgramCard.tsx

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

type ProgramCardProps = {
    program: Program;
    isActive: boolean;
    activeProgramUser: boolean;
    recommendedProgram: boolean;
    onPress: () => void;
};

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, isActive, activeProgramUser, recommendedProgram, onPress }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const cardBackgroundColor = activeProgramUser || recommendedProgram ? themeColors.containerHighlight : themeColors.containerHighlight;
    const textColor = activeProgramUser || recommendedProgram ? themeColors.background : themeColors.background;
    const shadowColor = isActive || recommendedProgram ? 'rgba(0,80,0,0.4)' : 'rgba(0,0,0,0.2)';

    const getLevelIcon = (level: string) => {
        switch (level.toLowerCase()) {
            case 'beginner':
                return 'level-beginner';
            case 'intermediate':
                return 'level-intermediate';
            case 'advanced':
                return 'level-advanced';
            case 'all levels':
            default:
                return 'people';
        }
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={1}>
            {/* Outer container with background color for shadow */}
            <View
                style={[
                    styles.shadowContainer,
                    {
                        backgroundColor: themeColors.background,
                        shadowColor: shadowColor,
                    },
                ]}
            >
                <View style={styles.cardContainer}>
                    <View style={styles.imageContainer}>
                        <ImageTextOverlay
                            image={{ uri: program.PhotoUrl }}
                            title={program.ProgramName}
                            containerStyle={styles.imageOverlayContainer}
                            titleType='titleLarge'
                            gradientColors={['transparent', 'rgba(0,0,0,0.7)']}
                            titleStyle={{ marginRight: Spaces.XL, lineHeight: moderateScale(20) }}
                            imageContentFit={'cover'}
                        />
                        {isActive && (
                            <View style={[styles.activeOverlay, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                                <ThemedText type='buttonSmall'>Active Program</ThemedText>
                            </View>
                        )}
                        {!activeProgramUser && recommendedProgram && (
                            <View style={[styles.recommendedOverlay, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
                                <Icon name='star' size={Sizes.fontSizeDefault} color={'rgba(0,0,0,0.95)'} />
                                <ThemedText type='buttonSmall' style={[{ marginLeft: Spaces.XS }]}>
                                    Recommended
                                </ThemedText>
                            </View>
                        )}
                    </View>

                    <ThemedView style={[styles.contentContainer, { backgroundColor: cardBackgroundColor }]}>
                        <ThemedText type='bodySmall' style={[{ paddingBottom: Spaces.XS, color: textColor }]}>
                            {program.DescriptionShort}
                        </ThemedText>
                        <View style={styles.attributeRow}>
                            <View style={styles.attributeItem}>
                                <Icon name='stopwatch' size={Sizes.fontSizeDefault} color={textColor} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: textColor }]}>
                                    {program.Weeks} Weeks
                                </ThemedText>
                            </View>
                            <View style={styles.attributeItem}>
                                <Icon name={getLevelIcon(program.Level)} color={textColor} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: textColor }]}>
                                    {program.Level}
                                </ThemedText>
                            </View>
                            <View style={styles.attributeItem}>
                                <Icon name='target' size={Sizes.fontSizeDefault} color={textColor} />
                                <ThemedText type='buttonSmall' style={[styles.attributeText, { color: textColor }]}>
                                    {program.Goal}
                                </ThemedText>
                            </View>
                        </View>
                        <Icon name='chevron-forward' color={textColor} style={styles.chevronIcon} />
                    </ThemedView>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        marginBottom: Spaces.XL,
        borderRadius: Spaces.SM,
        // Android shadow
        elevation: 4,
        // iOS shadow
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
    },
    cardContainer: {
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
    },
    imageOverlayContainer: {
        height: Sizes.imageLGHeight,
    },
    activeOverlay: {
        position: 'absolute',
        top: Spaces.LG,
        left: 0,
        paddingVertical: Spaces.XS,
        paddingHorizontal: Spaces.MD,
        borderTopRightRadius: Spaces.SM,
        borderBottomRightRadius: Spaces.SM,
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
    contentContainer: {
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.MD,
        marginTop: -Spaces.XXS,
    },
    attributeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    attributeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: Spaces.LG,
        marginBottom: Spaces.SM,
    },
    attributeText: {
        marginLeft: Spaces.XS,
        lineHeight: Spaces.LG,
    },
    chevronIcon: {
        position: 'absolute',
        bottom: Spaces.MD + Spaces.XS,
        right: Spaces.MD,
    },
});

export default ProgramCard;
