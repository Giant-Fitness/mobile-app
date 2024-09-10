// components/programs/ProgramDayOverviewCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';

type ProgramDayOverviewCardProps = {
    week: number;
    day: number;
    workout: string;
    length: string;
    photo: ImageSourcePropType;
};

export const ProgramDayOverviewCard: React.FC<ProgramDayOverviewCardProps> = ({ week, day, workout, length, photo }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const navigation = useNavigation();

    const navigateToProgramDay = () => {
        navigation.navigate('programs/program-day', { workout, week, day, length });
    };

    return (
        <LeftImageInfoCard
            image={photo}
            onPress={navigateToProgramDay}
            title={workout}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.text }]}>
                            {`Week ${week} Day ${day}`}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.attributeRow}>
                        <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.text} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.text }]}>
                            {length}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            }
            containerStyle={styles.container}
            titleStyle={[styles.title, { color: themeColors.text }]}
            extraContentStyle={styles.contentContainer}
            imageStyle={styles.image}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: '100%',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: moderateScale(14),
        marginBottom: 0,
        marginLeft: spacing.xs,
        marginTop: spacing.xs,
    },
    image: {
        height: sizes.imageMediumHeight,
        width: sizes.imageMediumWidth,
        borderRadius: spacing.xxs,
    },
    contentContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: spacing.xs,
        marginLeft: spacing.xs,
    },
    attributeText: {
        marginLeft: spacing.xs,
        lineHeight: spacing.md,
        backgroundColor: 'transparent',
    },
    attributeContainer: {
        marginTop: spacing.xxs,
        backgroundColor: 'transparent',
    },
});
