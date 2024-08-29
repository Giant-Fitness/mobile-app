import React, { useState } from 'react';
import { ScrollView, StyleSheet, Image, Button, TouchableOpacity, View, Text } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { CustomBackButton } from '@/components/icons/CustomBackButton';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TextButton } from '@/components/base/TextButton';
import { BottomDrawer } from '@/components/layout/BottomDrawer';

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

const data = [
    {weight : '60 kgs', reps: '3'},
    {weight : '60 kgs', reps: '3'},
    {weight : '60 kgs', reps: '3'},
]

const ProgramWorkoutDetailsScreen = () => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const [visible, setVisible] = useState(false);

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
                    <ThemedText>{longText}</ThemedText>
                </ThemedView>
            </ScrollView>
            <TextButton text='Log' onPress={() => setVisible(true)} style={styles.floatingLogButton} />
            <BottomDrawer 
                visible={visible} 
                onClose={() => setVisible(!visible)}
            >
                <View style={{ alignItems: 'center' }}>
                    <ThemedText style={[styles.titleModal, { color: themeColors.text }]}>Today</ThemedText>
                    <ThemedText style={{ fontSize: 13, color: themeColors.subText }}>{workoutName}</ThemedText>

                    <ScrollView contentContainerStyle={styles.scrollViewContent} style={{
                        paddingBottom: '20%'
                    }}>
                        {data.map((item, index) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={[styles.itemText, { color: themeColors.text }]}>Weight: {item.weight}</Text>
                                <Text style={[styles.itemText, { color: themeColors.text }]}>Reps: {item.reps}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    <TextButton text='Log' onPress={() => setVisible(false)} style={styles.floatingLogButton} />
                </View>
            </BottomDrawer>
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
        paddingBottom: '30%'
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
    },
    floatingLogButton: {
        position: 'absolute',
        width: '88%',
        bottom: '3%',
        alignSelf: 'center',
        paddingVertical: 15,
        paddingHorizontal: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    titleModal: {
        fontSize: 18,
        marginTop: '5%'
    },
    scrollViewContent: {
        paddingVertical: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        width: '90%',
    },
    itemText: {
        fontSize: 15,
    },
});

export default ProgramWorkoutDetailsScreen;