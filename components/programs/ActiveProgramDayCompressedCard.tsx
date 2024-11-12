// components/programs/ActiveProgramDayCompressedCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { REQUEST_STATE } from '@/constants/requestStates';
import { ImageTextOverlay } from '../media/ImageTextOverlay';

type ActiveProgramDayCompressedCardProps = {};

export const ActiveProgramDayCompressedCard: React.FC<ActiveProgramDayCompressedCardProps> = () => {
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
        // Render a loading indicator
        return (
            <View style={styles.cardContainer}>
                <ActivityIndicator size='large' color={themeColors.text} />
            </View>
        );
    }

    if (currentDayState === REQUEST_STATE.REJECTED || !currentDay) {
        // Render an error message or placeholder
        return (
            <ThemedView style={styles.cardContainer}>
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

    return (
        <View style={[styles.shadowContainer, { backgroundColor: themeColors.background }]}>
            <TouchableOpacity onPress={navigateToProgramDay} style={styles.cardContainer} activeOpacity={1}>
                <ImageTextOverlay
                    image={{ uri: day.PhotoUrl }}
                    title={day.DayTitle}
                    gradientColors={['transparent', 'rgba(0,0,0,0.65)']}
                    containerStyle={{ height: '100%' }}
                    textContainerStyle={{ bottom: Spaces.LG }}
                    subtitleType='bodySmall'
                    titleType='title'
                    titleStyle={{ marginRight: Spaces.LG, lineHeight: moderateScale(20) }}
                    subtitleStyle={{ marginTop: Spaces.XS }}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: 'rgba(0,80,0,0.3)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
        borderRadius: Spaces.SM, // Match the child border radius
    },
    cardContainer: {
        width: '100%',
        height: Sizes.imageLGHeight,
        overflow: 'hidden',
        borderRadius: Spaces.SM,
    },
});
