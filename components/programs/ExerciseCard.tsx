// components/programs/ExerciseCard.tsx

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Exercise } from '@/types';
import { Icon } from '@/components/base/Icon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { TextButton } from '@/components/buttons/TextButton';
import { HighlightedTip } from '@/components/alerts/HighlightedTip';

type ExerciseCardProps = {
    exercise: Exercise;
    isEnrolled: boolean;
};

type RootStackParamList = {
    'programs/exercise-details': Exercise; // Define the expected parameter type
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isEnrolled = false }) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme as 'light' | 'dark'];

    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    const navigateToExerciseDetail = () => {
        navigation.navigate('programs/exercise-details', {
            exercise: exercise,
            isEnrolled: isEnrolled,
        });
    };

    return (
        <ThemedView style={[styles.card, { backgroundColor: themeColors.background }]}>
            <ThemedView style={[styles.titleContainer, { backgroundColor: themeColors.background }]}>
                <ThemedText type='titleLarge' style={[{ color: themeColors.text }]}>
                    {exercise.ExerciseName}
                </ThemedText>
            </ThemedView>
            <ThemedView style={styles.infoContainer}>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                    <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                        {exercise.Sets}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                        Sets
                    </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                    <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                        {exercise.RepsLower}-{exercise.RepsUpper}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                        Reps
                    </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.infoBox, { backgroundColor: themeColors.tipBackground }]}>
                    <ThemedText type='bodyMedium' style={[{ color: themeColors.tipText }]}>
                        {exercise.Rest}
                    </ThemedText>
                    <ThemedText type='bodySmall' style={[{ color: themeColors.tipText }]}>
                        Rest
                    </ThemedText>
                </ThemedView>
            </ThemedView>
            {exercise.QuickTip && (
                <ThemedView style={styles.tipContainer}>
                    <Icon name='bulb' size={Sizes.fontSizeDefault} color={themeColors.text} style={{ marginTop: Spaces.XS }} />
                    <ThemedText type='italic' style={styles.quickTip}>
                        {exercise.QuickTip}
                    </ThemedText>
                </ThemedView>
            )}
            <View style={styles.buttonContainer}>
                <TextButton
                    text='View Guide'
                    onPress={navigateToExerciseDetail}
                    textStyle={[{ color: themeColors.text }]}
                    textType='bodyMedium'
                    style={[
                        {
                            flex: 1,
                            borderRadius: Spaces.SM,
                        },
                    ]}
                />
                {/*                {isEnrolled && (
                    <TextButton
                        text='Log'
                        onPress={() => console.log(`Logging exercise: ${exercise.ExerciseName}`)}
                        textType='bodyMedium'
                        textStyle={[{ color: themeColors.buttonPrimaryText }]}
                        style={[{ flex: 1, backgroundColor: themeColors.buttonPrimary, borderRadius: Spaces.SM, marginLeft: Spaces.LG }]}
                    />
                )}*/}
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: Spaces.SM,
        marginBottom: Spaces.MD,
        position: 'relative',
        paddingBottom: Spaces.LG,
    },
    titleContainer: {
        paddingHorizontal: Spaces.LG,
        borderTopLeftRadius: Spaces.SM,
        borderTopRightRadius: Spaces.SM,
        paddingTop: Spaces.MD,
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.LG,
        paddingTop: Spaces.MD,
    },
    tipContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spaces.MD,
        paddingHorizontal: Spaces.LG,
    },
    quickTip: {
        marginLeft: Spaces.XS,
        flex: 1,
    },
    detailsButton: {
        paddingVertical: Spaces.SM,
        marginTop: Spaces.SM,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spaces.SM,
        marginHorizontal: Spaces.SM,
        paddingHorizontal: Spaces.MD,
        paddingBottom: Spaces.SM,
    },
    infoBox: {
        padding: Spaces.LG,
        borderRadius: Spaces.SM,
        marginHorizontal: Spaces.XS,
        alignItems: 'center',
    },
});
