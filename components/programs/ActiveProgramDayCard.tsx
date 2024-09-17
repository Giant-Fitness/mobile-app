// components/programs/ActiveProgramDayCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { TopImageInfoCard } from '@/components/layout/TopImageInfoCard';
import { Icon } from '@/components/icons/Icon';
import { moderateScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/rootReducer';
import { REQUEST_STATE } from '@/constants/requestStates';
import { BasicSplash } from '@/components/splashScreens/BasicSplash';

type ActiveProgramDayCardProps = {};

export const ActiveProgramDayCard: React.FC<ActiveProgramDayCardProps> = () => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const navigation = useNavigation();

    const {
        activeProgramCurrentDay,
        activeProgramCurrentDayState,
        error: programError,
    } = useSelector((state: RootState) => state.programs);

    // State to manage splash visibility
    const [isSplashVisible, setIsSplashVisible] = useState(true);

    useEffect(() => {
        // Hide splash when loading is complete or failed
        if (
            activeProgramCurrentDayState === REQUEST_STATE.FULFILLED ||
            activeProgramCurrentDayState === REQUEST_STATE.REJECTED
        ) {
            setIsSplashVisible(false);
        }
    }, [activeProgramCurrentDayState]);

    if (isSplashVisible) {
        // Show the BasicSplash component while loading
        return <BasicSplash />;
    }

    if (activeProgramCurrentDayState === REQUEST_STATE.REJECTED || !activeProgramCurrentDay) {
        // Render an error message or placeholder
        return (
            <ThemedView style={styles.errorContainer}>
                <ThemedText>Error loading the current day.</ThemedText>
            </ThemedView>
        );
    }

    const navigateToProgramDay = () => {
        navigation.navigate('programs/program-day', {
            day: activeProgramCurrentDay,
        });
    };

    const day = activeProgramCurrentDay;
    return (
        <View style={styles.shadowContainer}>
            <TopImageInfoCard
                image={{ uri: day.PhotoUrl }}
                title={day.DayTitle}
                subtitle={`Week ${day.Week} Day ${day.Day}`}
                onPress={navigateToProgramDay}
                extraContent={
                    day.RestDay ? (
                        // Display content specific to a rest day
                        <ThemedView style={[styles.attributeRow, { marginLeft: 0, marginTop: -spacing.xxs }]}>
                            <Icon name="bed" size={moderateScale(18)} color={themeColors.highlightContainerText} />
                            <Icon
                                name="chevron-forward"
                                size={moderateScale(16)}
                                color={themeColors.highlightContainerText}
                                style={styles.chevronIcon}
                            />
                        </ThemedView>
                    ) : (
                        // Display content specific to a workout day
                        <ThemedView style={styles.attributeRow}>
                            <Icon name="stopwatch" size={moderateScale(14)} color={themeColors.highlightContainerText} />
                            <ThemedText
                                type="body"
                                style={[styles.attributeText, { color: themeColors.highlightContainerText, paddingRight: spacing.md }]}
                            >
                                {`${day.Time} mins`}
                            </ThemedText>
                            <Icon name="kettlebell" size={moderateScale(14)} color={themeColors.highlightContainerText} />
                            <ThemedText
                                type="body"
                                style={[styles.attributeText, { color: themeColors.highlightContainerText, marginLeft: spacing.xs }]}
                            >
                                {day.EquipmentCategory}
                            </ThemedText>
                            <Icon
                                name="chevron-forward"
                                size={moderateScale(16)}
                                color={themeColors.highlightContainerText}
                                style={styles.chevronIcon}
                            />
                        </ThemedView>
                    )
                }
                titleStyle={{ color: themeColors.highlightContainerText }}
                subtitleStyle={{ color: themeColors.subTextSecondary }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    shadowContainer: {
        shadowColor: 'rgba(0,80,0,0.4)',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
        borderRadius: spacing.sm, // Match the child border radius
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        backgroundColor: 'transparent',
    },
    attributeText: {
        marginLeft: spacing.xs,
        fontSize: moderateScale(13),
        lineHeight: spacing.md,
    },
    chevronIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
});
