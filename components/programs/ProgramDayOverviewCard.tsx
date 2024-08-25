// components/programs/ProgramDayOverviewCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';
import { ThemedView } from '@/components/base/ThemedView';

type ProgramDayOverviewCardProps = {
    week: number;
    day: number;
    workout: string;
    length: string;
    photo: ImageSourcePropType;
};

const ProgramDayOverviewCard: React.FC<DayOverviewCardProps> = ({ week, day, workout, length, photo }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <LeftImageInfoCard
            image={photo}
            title={`Week ${week} Day ${day}`}
            extraContent={
                <ThemedView>
                    <ThemedView style={styles.attributeRow}>
                        <ThemedText type='bodySmall' style={[{ color: themeColors.text }]}>
                            {workout}
                        </ThemedText>
                    </ThemedView>

                    <ThemedView style={styles.attributeRow}>
                        <Ionicons name='stopwatch-outline' size={14} color={themeColors.textLight} />
                        <ThemedText type='bodySmall' style={[styles.attributeText, { color: themeColors.textLight }]}>
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
        marginBottom: 16,
    },
    title: {
        fontSize: 14,
    },
    image: {
        height: 90,
        width: 90,
    },
    contentContainer: {
        width: '100%',
        backgroundColor: 'transparent',
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    attributeText: {
        marginLeft: 4,
        lineHeight: 14,
    },
});

export default ProgramDayOverviewCard;
