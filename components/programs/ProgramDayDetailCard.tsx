// components/programs/ProgramDayDetailCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LeftImageInfoCard } from '@/components/media/LeftImageInfoCard';
import { ThemedView } from '@/components/base/ThemedView';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { ProgramDay } from '@/types';
import { getWeekNumber, getDayOfWeek } from '@/utils/calendar';
import { router } from 'expo-router';

type ProgramDayDetailCardProps = {
    day: ProgramDay;
};

export const ProgramDayDetailCard: React.FC<ProgramDayDetailCardProps> = ({ day }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigateToProgramDay = () => {
        router.push({
            pathname: '/(app)/programs/program-day',
            params: {
                programId: day.ProgramId,
                dayId: day.DayId,
            },
        });
    };

    // **Calculate Current Week Based on dayId**
    const currentDayNumber = parseInt(day.DayId, 10);
    const currentWeek = getWeekNumber(currentDayNumber);
    const dayOfWeek = getDayOfWeek(currentDayNumber);

    return (
        <LeftImageInfoCard
            image={{ uri: day.PhotoUrl }}
            onPress={navigateToProgramDay}
            title={day.DayTitle}
            extraContent={
                <ThemedView style={styles.attributeContainer}>
                    <ThemedView style={styles.attributeRow}>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.text }]}>
                            {`Week ${currentWeek} Day ${dayOfWeek}`}
                        </ThemedText>
                    </ThemedView>

                    {/*                    {day.RestDay ? (
                        // Display content for a rest day
                        <ThemedView style={[{ backgroundColor: 'transparent' }]}>
                            <ThemedView style={styles.attributeRow}>
                                <Icon name='sleep' size={moderateScale(16)} color={themeColors.subText} />
                            </ThemedView>
                        </ThemedView>
                    ) : (
                        // Display content for a workout day
                        <ThemedView style={styles.attributeRow}>
                            <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.text} />
                            <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.text }]}>
                                {`${day.Time} mins`}
                            </ThemedText>
                        </ThemedView>
                    )}*/}
                </ThemedView>
            }
            containerStyle={styles.container}
            titleStyle={[styles.title, { color: themeColors.text }]}
            contentContainerStyle={styles.contentContainer}
            imageStyle={styles.image}
            imageContainerStyle={styles.imageContainer}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: '100%',
        marginBottom: Spaces.MD,
    },
    title: {
        fontSize: moderateScale(14),
        marginBottom: 0,
        marginLeft: Spaces.XS,
        marginTop: Spaces.XS,
    },
    image: {
        height: Sizes.imageXSHeight,
        width: Sizes.imageXSWidth,
    },
    imageContainer: {
        borderRadius: Spaces.XXS,
    },
    contentContainer: {
        width: '100%',
        marginLeft: Spaces.SM,
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginBottom: Spaces.XS,
        marginLeft: Spaces.XS,
    },
    attributeText: {
        marginLeft: Spaces.XS,
        lineHeight: Spaces.MD,
        backgroundColor: 'transparent',
    },
    attributeContainer: {
        marginTop: Spaces.XXS,
        backgroundColor: 'transparent',
    },
});
