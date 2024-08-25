// components/programs/ActiveDayCard.tsx

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';

type ActiveProgramDayCardProps = {};

export const ActiveProgramDayCard: React.FC<ActiveProgramDayCardProps> = ({}) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity style={[styles.container]} activeOpacity={1}>
            <Image source={{ uri: 'https://picsum.photos/id/177/700' }} style={styles.image} />
            <ThemedView
                style={[
                    styles.contentContainer,
                    {
                        borderColor: themeColors.borderColor,
                        backgroundColor: themeColors.containerColor,
                    },
                ]}
            >
                <ThemedText style={[styles.subTitle, { color: themeColors.textLight }]}>Week 3 Day 2</ThemedText>
                <ThemedText type='titleSmall' style={[styles.title, { color: themeColors.text }]}>
                    Full Body Blast
                </ThemedText>
                <ThemedView style={[styles.attributeRow, { backgroundColor: 'transparent' }]}>
                    <Ionicons name='stopwatch-outline' size={13} color={themeColors.text} />
                    <ThemedText type='body' style={[styles.attributeText, { color: themeColors.text, paddingRight: 16 }]}>
                        40 mins
                    </ThemedText>
                    <MaterialCommunityIcons name='dumbbell' size={13} color={themeColors.text} />
                    <ThemedText type='body' style={[styles.attributeText, { color: themeColors.text, marginLeft: 5 }]}>
                        Full Gym
                    </ThemedText>
                    <Ionicons name='chevron-forward' size={16} color={themeColors.text} style={styles.chevronIcon} />
                </ThemedView>
            </ThemedView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
    },
    image: {
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        height: 200,
        width: '100%',
    },
    contentContainer: {
        width: '100%',
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    attributeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    attributeText: {
        marginLeft: 5,
        fontSize: 13,
        lineHeight: 16, // Ensures the text is aligned with the icon
    },
    title: {
        fontSize: 18,
        marginBottom: 12,
    },
    subtitle: {
        marginBottom: 10,
    },
    chevronIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
});
