// components/programs/ProgramDayOverviewCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';
import { ThemedView } from '@/components/base/ThemedView';

const DayWorkoutCard = (props) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <LeftImageInfoCard
            image={props.photo}
            title={props.workoutName}
            extraContent={
                <ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <ThemedText style={[styles.extraContentText, { color: themeColors.subText }]}>
                            {`${props.numSets} sets x ${props.lowerLimReps} - ${props.higherLimReps} reps`}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.attributeRow}>
                        <ThemedText style={[styles.extraContentText, { color: themeColors.subText }]}>
                            {`${props.restPeriod} rest`}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.attributeRow}>
                        <ThemedText style={[styles.extraContentText, { color: themeColors.subText }]}>
                            {props.intro}
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
        marginBottom: 36,
    },
    title: {
        fontSize: 14,
        marginBottom: 0,
        marginLeft: 4,
        marginTop: 4,
    },
    image: {
        height: 100,
        width: 100,
        borderRadius: 2,
    },
    contentContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 4,
    },
    attributeText: {
        marginLeft: 4,
    },
    extraContentText: {
        fontSize: 13
    }
});

export default DayWorkoutCard;
