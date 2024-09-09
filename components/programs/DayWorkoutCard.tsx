// components/programs/DayWorkoutCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { scale, moderateScale, verticalScale } from '@/utils/scaling';
import { spacing } from '@/utils/spacing';
import { sizes } from '@/utils/sizes';

const DayWorkoutCard = (props) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const navigation = useNavigation();

    const navigateToWorkoutDetail = () => {
        navigation.navigate('programs/program-day-workout-details', props);
    }

    return (
        <LeftImageInfoCard
            image={props.photo}
            title={props.workoutName}
            onPress={navigateToWorkoutDetail}
            extraContent={
                <ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <ThemedText style={[styles.extraContentText, { color: themeColors.subText }]}>
                            {`${props.numSets} sets x ${props.lowerLimReps} - ${props.higherLimReps} reps`}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.attributeRow}>
                        <ThemedText style={[styles.extraContentText, { color: themeColors.subText }]}>{`${props.restPeriod} rest`}</ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.attributeRow}>
                        <ThemedText style={[styles.extraContentText, { color: themeColors.subText }]}>{props.intro}</ThemedText>
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
        backgroundColor: 'transparent',
        width: '100%',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: moderateScale(14),
        marginBottom: 0,
        marginTop: spacing.xs,
    },
    image: {
        height: sizes.imageMediumHeight,
        width: sizes.imageMediumWidth,
        borderRadius: scale(2),
    },
    contentContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    attributeText: {},
    extraContentText: {
        fontSize: moderateScale(13),
    },
});

export default DayWorkoutCard;
