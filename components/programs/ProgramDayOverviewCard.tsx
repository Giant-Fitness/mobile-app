// components/programs/ProgramDayOverviewCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { LeftImageInfoCard } from '@/components/layout/LeftImageInfoCard';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { Icon } from '@/components/icons/Icon';

type ProgramDayOverviewCardProps = {
    week: number;
    day: number;
    workout: string;
    length: string;
    photo: ImageSourcePropType;
};

export const ProgramDayOverviewCard: React.FC<DayOverviewCardProps> = ({ week, day, workout, length, photo }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];
    const navigation = useNavigation();

    const navigateToProgramDay = () => {
        navigation.navigate('program-day-workouts', { workout, week, day, length });
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
                        <Icon name='stopwatch' size={14} />
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
        marginBottom: 4,
        marginLeft: 4,
    },
    attributeText: {
        marginLeft: 4,
        lineHeight: 14,
    },
    attributeContainer: {
        marginTop: 2,
    },
});
