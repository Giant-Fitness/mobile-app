/* eslint-disable react/prop-types */
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import React from 'react';
import { Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';

const DayOverviewCard = (props) => {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity style={[styles.container]}>
            <Image source={{ uri: 'https://picsum.photos/250' }} style={styles.image} />
            <View style={[styles.contentContainer, { borderColor: themeColors.borderColor }]}>
                <ThemedText style={[styles.title, { color: themeColors.text }]}>
                    Week {props.week} Day {props.day}
                </ThemedText>
                <ThemedText style={[styles.content, { color: themeColors.subText }]}>{props.workout}</ThemedText>
                <View style={styles.IconTextView}>
                    <Entypo name='stopwatch' size={16} color={themeColors.subText} style={{ marginRight: '2%' }} />
                    <ThemedText style={[styles.content, { color: themeColors.subText }]}>{props.length}</ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        // borderWidth: 1,
        // borderColor: 'crimson',
        flexDirection: 'row',
        backgroundColor: 'transparent',
        width: '64%',
        marginBottom: '5%',
    },
    image: {
        borderBottomLeftRadius: 5,
        borderTopLeftRadius: 5,
        height: 115,
        width: 115,
    },
    contentContainer: {
        width: '100%',
        paddingLeft: '7%',
        paddingVertical: '5%',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderTopRightRadius: 5,
        borderBottomRightRadius: 5,
    },
    title: {
        fontSize: 17,
        fontWeight: 'condensedBold',
        marginBottom: '5%',
    },
    content: {
        fontSize: 13,
    },
    IconTextView: {
        flexDirection: 'row',
        marginTop: '2%',
        alignItems: 'center',
    },
});

export default DayOverviewCard;
