// app/programs/exercise-details.tsx

import React, { useState } from 'react';
import { ScrollView, StyleSheet, Image, Button, TouchableOpacity, View, Text, TextInput } from 'react-native';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { CustomBackButton } from '@/components/icons/CustomBackButton';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TextButton } from '@/components/base/TextButton';
import { BottomDrawer } from '@/components/layout/BottomDrawer';
import { IconButton } from '@/components/base/IconButton';
import { CenteredModal } from '@/components/layout/centeredModal';
import { spacing } from '@/utils/spacing';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

const CustomHeader = ({ workoutName, numSets, lowerLimReps, higherLimReps, restPeriod, themeColors }) => {
    return (
        <ThemedView style={styles.container}>
            <ThemedText style={[styles.title, { color: themeColors.text }]}>{workoutName}</ThemedText>
            <ThemedText style={[styles.subText, { color: themeColors.text }]}>
                {numSets} sets, {lowerLimReps} - {higherLimReps} reps
            </ThemedText>
            <ThemedText style={[styles.subText, { color: themeColors.text, marginBottom: '5%' }]}>{restPeriod} rest</ThemedText>
        </ThemedView>
    );
};

const data = [
    { weight: '60 kgs', reps: '3' },
    { weight: '60 kgs', reps: '3' },
    { weight: '60 kgs', reps: '3' },
];

const ExerciseDetailsScreen = () => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    const navigation = useNavigation();
    const route = useRoute();

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('');
    const [sets, setSets] = useState(data);

    const onConfirm = () => {
        // need to set better validation logic here to also display error message
        if (!weight || !reps) {
            setModalVisible(false);
            return;
        }

        setSets((state) => [
            ...state,
            {
                weight: weight,
                reps: reps,
            },
        ]);

        setModalVisible(false);
    };

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
            <TextButton text='Log' onPress={() => setDrawerVisible(true)} style={styles.floatingLogButton} />
            <BottomDrawer
                visible={drawerVisible}
                onClose={() => setDrawerVisible(!drawerVisible)}
                style={{
                    height: '40%',
                }}
            >
                <View style={{ alignItems: 'center', paddingBottom: '63%' }}>
                    <ThemedText style={[styles.titleModal, { color: themeColors.text }]}>Today</ThemedText>
                    <ThemedText style={{ fontSize: 13, color: themeColors.subText }}>{workoutName}</ThemedText>
                    <View
                        style={[
                            styles.itemContainer,
                            {
                                marginTop: '5%',
                                marginBottom: 0,
                            },
                        ]}
                    >
                        <ThemedText style={[styles.itemHeaderText, { color: themeColors.text }]}>Weight</ThemedText>
                        <View
                            style={{
                                width: StyleSheet.hairlineWidth,
                                backgroundColor: themeColors.text,
                            }}
                        />
                        <ThemedText style={[styles.itemHeaderText, { color: themeColors.text }]}>Reps</ThemedText>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollViewContent}
                        style={{
                            width: '100%',
                        }}
                    >
                        {sets.map((item, index) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={[styles.itemText, { color: themeColors.text }]}>{item.weight}</Text>
                                <Text style={[styles.itemText, { color: themeColors.text }]}>{item.reps}</Text>
                            </View>
                        ))}
                    </ScrollView>
                    <View
                        style={{
                            width: '70%',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: '2%',
                        }}
                    >
                        <IconButton
                            onPress={() => setModalVisible(true)}
                            iconName='plus'
                            iconColor='white'
                            style={{
                                width: 25,
                                height: 25,
                            }}
                        />
                        <ThemedText
                            style={{
                                fontSize: 13,
                                color: themeColors.subText,
                                marginLeft: '3%',
                            }}
                        >
                            Add Set
                        </ThemedText>
                    </View>
                </View>
                <TextButton text='Log' onPress={() => setDrawerVisible(false)} style={styles.floatingLogButton} />
            </BottomDrawer>
            <CenteredModal visible={modalVisible} onClose={() => setModalVisible(!modalVisible)}>
                <ThemedView style={styles.inputContainer}>
                    <TextInput style={styles.input} placeholder='Weight (Kgs)' keyboardType='numeric' value={weight} onChangeText={setWeight} />
                    <TextInput style={styles.input} placeholder='Reps' keyboardType='numeric' value={reps} onChangeText={setReps} />
                    <TextButton text='Confirm' onPress={onConfirm} />
                </ThemedView>
            </CenteredModal>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    contentView: {
        width: '100%',
        paddingHorizontal: '10%',
        paddingTop: '7%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingBottom: '30%',
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
        height: 300,
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
        marginTop: '5%',
    },
    scrollViewContent: {
        paddingTop: '2%',
        alignItems: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        width: '70%',
    },
    itemText: {
        fontSize: 15,
    },
    itemHeaderText: {
        fontSize: 16,
        fontWeight: '700',
    },
    inputContainer: {
        width: '100%',
        paddingHorizontal: spacing.md,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: '#fff',
    },
});

export default ExerciseDetailsScreen;
