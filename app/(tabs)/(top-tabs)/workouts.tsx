// app/(tabs)/(top-tabs)/workouts.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import React from 'react';
import { TouchableOpacity, StyleSheet, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { WorkoutOverviewCard } from '@/components/workouts/WorkoutOverviewCard';
import { Collapsible } from '@/components/layout/Collapsible';
import { Icon } from '@/components/base/Icon';
import { moderateScale } from '@/utils/scaling';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

type RootStackParamList = {
    'workouts/all-workouts': { initialFilters: object };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const recommendedWorkouts = [
    {
        id: '1',
        name: 'Full Body Workout',
        photo: require('@/assets/images/vb.webp'),
        length: '45 mins',
        level: 'Advanced',
        equipment: 'Kettlebells',
        focus: 'Strength',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '2',
        name: 'Cardio Blast',
        photo: require('@/assets/images/vb.webp'),
        length: '30 mins',
        level: 'Intermediate',
        equipment: 'Kettlebells',
        focus: 'Endurance',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
    {
        id: '3',
        name: 'Morning Flexibility',
        photo: require('@/assets/images/vb.webp'),
        length: '20 mins',
        level: 'Beginner',
        equipment: 'No Equipment',
        focus: 'Mobility',
        trainer: 'Viren Barman',
        longText:
            'Get yourself ready for tank top summer. This workout will smoke your arms and shoulders.\n\nUse it as a standalone or pair it with a core session for a full-body workout.',
        focusMulti: ['Arms', 'Legs', 'Chest'],
    },
];

export default function WorkoutsScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark'; // Explicitly type colorScheme
    const themeColors = Colors[colorScheme]; // Access theme-specific colors

    const navigation = useNavigation<NavigationProp>();

    const navigateToAllWorkouts = (initialFilters = {}) => {
        navigation.navigate('workouts/all-workouts', { initialFilters });
    };

    const categories = [
        { title: 'Endurance Workouts', workouts: recommendedWorkouts, type: 'Endurance' },
        { title: 'Mobility Workouts', workouts: recommendedWorkouts, type: 'Mobility' },
        { title: 'Strength Workouts', workouts: recommendedWorkouts, type: 'Strength' },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]} showsVerticalScrollIndicator={false}>
            <ThemedView>
                <ThemedView style={styles.infoContainer}>
                    <ThemedText type='bodySmall' style={[styles.infoText, { color: themeColors.subText }]}>
                        {'Workouts are flexible one-off sessions that you can complete to meet your goals'}
                    </ThemedText>
                </ThemedView>
                <ThemedText type='title' style={[styles.header, { color: themeColors.text }]}>
                    {'Top Picks For You'}
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mainScrollView}>
                    {recommendedWorkouts.map((workout) => (
                        <WorkoutOverviewCard
                            key={workout.id}
                            name={workout.name}
                            photo={workout.photo}
                            length={workout.length}
                            level={workout.level}
                            focus={workout.focus}
                            equipment={workout.equipment}
                            trainer={workout.trainer}
                            longText={workout.longText}
                            focusMulti={workout.focusMulti}
                        />
                    ))}
                </ScrollView>
                <ThemedView>
                    {categories.map((category, index) => (
                        <ThemedView key={index} style={styles.collapsible}>
                            <Collapsible title={category.title}>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                                    {category.workouts.map((workout) => (
                                        <WorkoutOverviewCard
                                            key={workout.id}
                                            name={workout.name}
                                            photo={workout.photo}
                                            length={workout.length}
                                            level={workout.level}
                                            focus={workout.focus}
                                            equipment={workout.equipment}
                                            trainer={workout.trainer}
                                            longText={workout.longText}
                                            focusMulti={workout.focusMulti}
                                        />
                                    ))}
                                    <View style={styles.shadowContainer}>
                                        <TouchableOpacity
                                            activeOpacity={1}
                                            style={[styles.seeAllButton, { backgroundColor: themeColors.backgroundSecondary }]}
                                            onPress={() => navigateToAllWorkouts({ focus: [category.type] })}
                                        >
                                            <ThemedText type='overline' style={[{ color: themeColors.text }]}>
                                                See All
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </Collapsible>
                            {
                                <View
                                    style={[
                                        styles.dividerInterior,
                                        {
                                            borderBottomColor: themeColors.systemBorderColor,
                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                        },
                                    ]}
                                />
                            }
                        </ThemedView>
                    ))}
                    <ThemedView style={styles.allWorkoutsContainer}>
                        <TouchableOpacity onPress={() => navigateToAllWorkouts()} style={styles.allWorkouts} activeOpacity={1}>
                            <Icon name='list' size={Sizes.iconSizeMD} color={themeColors.text} style={{ paddingRight: Spaces.XS }} />
                            <ThemedText type='body' style={[{ color: themeColors.text }]}>
                                {'All Workouts'}
                            </ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    infoContainer: {
        paddingTop: Spaces.LG,
        paddingBottom: 0,
        marginHorizontal: Spaces.XXXL,
    },
    infoText: {
        textAlign: 'center',
    },
    container: {
        flex: 1,
    },
    allWorkoutsContainer: {
        paddingBottom: Spaces.XL,
    },
    allWorkouts: {
        padding: Spaces.LG,
        flexDirection: 'row',
    },
    mainScrollView: {
        marginLeft: Spaces.LG,
        paddingRight: Spaces.XXL,
        paddingBottom: Spaces.XL,
    },
    header: {
        padding: Spaces.MD,
        paddingTop: Spaces.LG,
        paddingLeft: Spaces.LG,
    },
    scrollView: {
        paddingLeft: Spaces.LG,
        paddingBottom: Spaces.LG,
    },
    collapsible: {
        paddingTop: Spaces.MD,
    },
    divider: {
        width: '90%',
        alignSelf: 'center',
    },
    dividerInterior: {
        width: '90%',
        alignSelf: 'center',
    },
    seeAllButton: {
        width: Sizes.imageXXLWidth,
        height: Sizes.imageXXLHeight,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Spaces.SM,
        marginHorizontal: Spaces.XXS,
    },
    shadowContainer: {
        shadowColor: 'rgba(0,70,0,0.2)', // Use a more standard shadow color
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 5, // For Android
        borderRadius: Spaces.SM, // Match the child border radius
        marginRight: Spaces.MD,
    },
});
