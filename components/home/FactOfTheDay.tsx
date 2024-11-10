// components/home/FactOfTheDay.tsx

import React from 'react';
import { StyleSheet, View, Image, ImageBackground } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Spaces } from '@/constants/Spaces';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { darkenColor } from '@/utils/colorUtils';

interface FactOfTheDayProps {}

const facts = [
    'Arnold Schwarzenegger used to eat 12 raw eggs a day to build muscle. Not recommended today!',
    'Muscles burn more calories than fat, even when you’re just sitting around.',
    'Lifting weights doesn’t make you bulky — unless you’re eating like The Rock!',
    'The afterburn effect: Your body keeps burning calories even after a tough workout!',
    'Walking backwards burns more calories than walking forward. Time to confuse the neighbors!',
    'Drinking water first thing in the morning can kickstart your metabolism by 24%.',
    'Protein after a workout helps repair muscles. Think of it as fuel for your muscles!',
    'Exercising in the morning boosts mood all day. Hello, endorphins!',
    'You burn more calories running than walking, but walking still counts!',
    'Sitting for too long is as bad as smoking. So, get up and move!',
    'Compound exercises like squats work multiple muscles at once. Efficiency at its best!',
    'Stretching can improve your flexibility and reduce injury risk. Plus, it just feels good!',
    'Taking the stairs burns 5 times more calories than taking the elevator.',
    'Muscle soreness is your body getting stronger. Embrace the pain!',
    'Cardio can help you sleep better by tiring you out naturally.',
    'Chewing gum burns 11 calories per hour. Slow and steady wins the race?',
    'Jumping rope for 10 minutes is equivalent to running a mile!',
    'Regular exercise can add up to seven years to your life. Worth it, right?',
    "A good warm-up can improve performance by up to 10%. Don't skip it!",
    'Exercise releases endorphins, which are natural mood boosters. Workout = instant happiness!',
    'The more muscle you have, the faster you burn calories at rest.',
    'Every pound of muscle burns about 6 calories a day at rest. Gains for gains!',
    'Strength training helps improve posture. Goodbye, hunchback!',
    'Listening to music while exercising can improve performance by 15%.',
    'Your gluteus maximus (aka butt) is the largest muscle in the body. Put it to work!',
    "Skipping breakfast won't 'starve' you, but it won’t help build muscle either!",
    'Your bones are 5 times stronger than steel of the same density. Superhuman strength!',
    "Exercise increases the size of your brain's hippocampus — so, yes, workouts can make you smarter!",
    'On average, fit people take about 7,500 steps per day. Time to up your step game!',
    'People who work out regularly sleep better and fall asleep faster. Zzz benefits!',
    'Sitting on a stability ball burns about 30 more calories per hour than a chair.',
    'Pull-ups engage almost every muscle in your upper body. Ultimate power move!',
    'A quick 10-minute workout can boost your energy more than a cup of coffee.',
    'A positive mindset can actually improve workout performance. Smile and lift!',
    'Your body is 60% water, so hydrate for peak performance.',
    'Exercise releases serotonin and dopamine — happiness chemicals that also reduce pain.',
    'High-intensity interval training (HIIT) can burn up to 30% more calories than other exercises.',
    'Strength training helps with fat loss even more than cardio. Don’t skip the weights!',
    'Your muscles can only grow when you let them rest. Rest days are essential!',
    'Eating spicy foods can temporarily boost your metabolism. Hot sauce, anyone?',
    'Caffeine can enhance performance in endurance activities by about 5%.',
    "Yawning can cool down the brain. It's your brain's version of a fan!",
    'People who exercise regularly have more mitochondria in their cells — more energy powerhouses!',
    'Doing just 20 minutes of physical activity a day can lower stress and anxiety levels.',
    'The plank is one of the best core exercises, but the world record is over 8 hours!',
    'Standing burns about 50 more calories per hour than sitting. Stand more, sit less!',
    'Cold showers can aid muscle recovery and may reduce soreness. Brr, but worth it!',
    'Flexibility training helps increase blood flow to muscles and can reduce injury risk.',
];

// Generate a random fact once per day using the current date as seed
const getFactOfTheDay = () => {
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    // Simple hash function for the date string
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = (hash << 5) - hash + dateString.charCodeAt(i);
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Use the hash to get a consistent fact for the day
    const index = Math.abs(hash) % facts.length;
    return facts[index];
};

// Memoize the fact so it stays consistent during the session
const todaysFact = getFactOfTheDay();

export const FactOfTheDay = ({}: FactOfTheDayProps) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.tealTransparent }]}>
            <View style={styles.contentWrapper}>
                <View style={styles.content}>
                    <ThemedText
                        type='title'
                        style={[
                            styles.text,
                            {
                                color: darkenColor(themeColors.tealSolid, 0.3),
                                marginBottom: Spaces.XS,
                            },
                        ]}
                    >
                        Fact of the Day
                    </ThemedText>
                    <ThemedText
                        type='overline'
                        style={[
                            styles.text,
                            {
                                color: darkenColor(themeColors.subText, 0.1),
                                lineHeight: 21,
                                fontSize: 13,
                            },
                        ]}
                    >
                        {todaysFact}
                    </ThemedText>
                </View>
                <Image
                    source={require('@/assets/images/bulb.png')}
                    style={[
                        styles.backgroundImage,
                        {
                            opacity: colorScheme === 'light' ? 0.1 : 0.15,
                            tintColor: themeColors.tealSolid,
                        },
                    ]}
                    resizeMode='contain'
                />
            </View>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: Spaces.LG,
        marginTop: Spaces.LG,
        marginBottom: Spaces.XL,
        borderRadius: Spaces.MD,
        overflow: 'hidden',
    },
    contentWrapper: {
        position: 'relative',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    content: {
        padding: Spaces.LG,
        flex: 1,
        zIndex: 1,
    },
    text: {
        maxWidth: '90%',
    },
    backgroundImage: {
        position: 'absolute',
        right: -Spaces.XL - Spaces.SM,
        width: 200,
        height: '60%',
    },
});
