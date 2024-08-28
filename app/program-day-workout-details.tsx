import React from 'react';
import { ScrollView, StyleSheet, Image, Button, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { CustomBackButton } from '@/components/icons/CustomBackButton';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const CustomHeader = ({ workoutName, numSets, lowerLimReps, higherLimReps, restPeriod, themeColors }) => {
    return (
        <ThemedView style={styles.container}>
            <ThemedText style={[styles.title, { color: themeColors.text }]}>{workoutName}</ThemedText>
            <ThemedText style={[styles.subText, { color: themeColors.text }]}>
                {numSets} sets, {lowerLimReps} - {higherLimReps} reps
            </ThemedText>
            <ThemedText style={[styles.subText, { color: themeColors.text, marginBottom: '5%'}]}>
                {restPeriod} rest
            </ThemedText>
        </ThemedView>
    );
};

const ProgramWorkoutDetailsScreen = () => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const { workoutName, photo, numSets, lowerLimReps, higherLimReps, restPeriod, longText } = route.params;

    React.useEffect(() => {
        navigation.setOptions({
            title: '',
            headerStyle: {
                backgroundColor: themeColors.background,
            },
            headerTitle: () => (
                <CustomHeader 
                    workoutName={workoutName} 
                    themeColors={Colors[colorScheme ?? 'light']}
                    lowerLimReps={lowerLimReps}
                    higherLimReps={higherLimReps}
                    restPeriod={restPeriod} 
                    numSets={numSets}
                />
            ),
            headerLeft: () => null, // Removes the back arrow
            headerTitleAlign: 'center', // Centers the header text
        });
    }, [navigation]);

    return (
        <ThemedView style={{ flex: 1, backgroundColor: themeColors.background }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={photo} style={styles.image} resizeMode='cover' />
                <ThemedView style={styles.contentView}>
                    <ThemedText>
                        {longText}
                    </ThemedText>
                </ThemedView>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    contentView: {
        width: '100%',
        paddingHorizontal: '10%',
        paddingTop: '7%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    title: {
        fontFamily: 'InterMedium',
        fontSize: 18,
    },
    subText: {
        fontFamily: 'InterMedium',
        fontSize: 12,
    },
    image: {
        width: '100%',
        height: 300
    }
});

export default ProgramWorkoutDetailsScreen;