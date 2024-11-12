// components/programs/ActiveProgramDayCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TopImageInfoCard } from '@/components/media/TopImageInfoCard';
import { Icon } from '@/components/base/Icon';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { getWeekNumber, getDayOfWeek } from '@/utils/calendar';

type ActiveProgramDayCardProps = {};

export const ActiveProgramDayCard: React.FC<ActiveProgramDayCardProps> = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigation = useNavigation();

    const { userProgramProgress } = useSelector((state: RootState) => state.user);
    const { programDays, programDaysState } = useSelector((state: RootState) => state.programs);

    const programId = userProgramProgress?.ProgramId;
    const dayId = userProgramProgress?.CurrentDay;

    const currentDay = programId && dayId ? programDays[programId]?.[dayId] : null;
    const currentDayState = programId && dayId ? programDaysState[programId]?.[dayId] : REQUEST_STATE.IDLE;

    if (currentDayState === REQUEST_STATE.PENDING || !currentDay) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color={themeColors.text} />
            </View>
        );
    }

    if (currentDayState === REQUEST_STATE.REJECTED || !currentDay) {
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the current day.</ThemedText>
            </ThemedView>
        );
    }

    const navigateToProgramDay = () => {
        if (programId && dayId) {
            navigation.navigate('programs/program-day', {
                programId: programId,
                dayId: dayId,
            });
        }
    };

    const day = currentDay;
    const currentDayNumber = parseInt(dayId, 10);
    const currentWeek = getWeekNumber(currentDayNumber);
    const dayOfWeek = getDayOfWeek(currentDayNumber);

    return (
        <View style={[styles.shadowContainer, { backgroundColor: themeColors.background }]}>
            <TopImageInfoCard
                image={{ uri: day.PhotoUrl }}
                title={day.DayTitle}
                subtitle={`Week ${currentWeek} Day ${dayOfWeek}`}
                onPress={navigateToProgramDay}
                extraContent={
                    day.RestDay ? (
                        <ThemedView style={[styles.attributeRow, { marginLeft: 0, marginTop: -Spaces.XXS }]}>
                            <Icon name='power-sleep' size={moderateScale(18)} color={themeColors.highlightContainerText} />
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.highlightContainerText} style={styles.chevronIcon} />
                        </ThemedView>
                    ) : (
                        <ThemedView style={styles.attributeRow}>
                            <Icon name='stopwatch' size={moderateScale(14)} color={themeColors.highlightContainerText} />
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, paddingRight: Spaces.MD }]}>
                                {`${day.Time} mins`}
                            </ThemedText>
                            <Icon name='kettlebell' size={moderateScale(14)} color={themeColors.highlightContainerText} />
                            <ThemedText type='body' style={[styles.attributeText, { color: themeColors.highlightContainerText, marginLeft: Spaces.XS }]}>
                                {day.EquipmentCategory}
                            </ThemedText>
                            <Icon name='chevron-forward' size={moderateScale(16)} color={themeColors.highlightContainerText} style={styles.chevronIcon} />
                        </ThemedView>
                    )
                }
                titleStyle={[{ color: themeColors.highlightContainerText, marginBottom: Spaces.XXS }]}
                imageStyle={{ height: Sizes.imageLGHeight }}
                subtitleStyle={[{ color: themeColors.subTextSecondary, marginBottom: Spaces.SM }]}
                titleFirst={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        borderRadius: Spaces.SM,
        // iOS shadow
        shadowColor: 'rgba(0,80,0,0.4)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
        // Android shadow
        elevation: 5,
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spaces.SM,
        backgroundColor: 'transparent',
    },
    attributeText: {
        marginLeft: Spaces.XS,
        fontSize: moderateScale(13),
        lineHeight: Spaces.MD,
    },
    chevronIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spaces.LG,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spaces.LG,
    },
});
