import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

const ActiveCard = (props) => {

    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity style={[styles.container]}>
            <Image source={{ uri: 'https://picsum.photos/700' }} style={styles.image} />
            <View style={[styles.contentContainer, { 
                borderColor: themeColors.borderColor
            }]}>
                <ThemedText style={[styles.title, { color: themeColors.text }]}>
                    Week 3 Day 2: Full Body Blast
                </ThemedText>
                <View style={styles.IconTextView}>
                    <Entypo name="stopwatch" size={18} color={themeColors.subText} style={{ marginRight: '2%' }} />
                    <ThemedText style={[{ color: themeColors.subText }]}>
                        30 mins
                    </ThemedText>
                </View>
                <View style={styles.IconTextView}>
                    <MaterialCommunityIcons name="dumbbell" size={18} color={themeColors.subText} style={{ marginRight: '2%' }} />
                    <ThemedText style={[{ color: themeColors.subText }]}>
                        Full Gym
                    </ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        // borderWidth: 1,
        // borderColor: 'crimson',
        backgroundColor: 'transparent'
    },
    image: {
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        height: 200,
        width: '100%'
    },
    contentContainer: {
        width: '100%',
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5
    },
    title: {
        fontSize: 17,
        fontWeight: 'condensedBold',
        marginBottom: '5%'
    },
    content: {
        fontSize: 15,
    },
    IconTextView: {
        flexDirection: 'row',
        marginBottom: '2%'
    }
});

export default ActiveCard;
