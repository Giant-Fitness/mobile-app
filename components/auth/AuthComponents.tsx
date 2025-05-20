// components/auth/AuthComponents.tsx

import React from 'react';
import { View, Image, StyleSheet, ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

type CustomHeaderProps = {
    containerStyle?: ViewStyle;
    logoStyle?: ImageStyle;
    textContainerStyle?: ViewStyle;
    textStyle?: TextStyle;
};

export const CustomHeader: React.FC<CustomHeaderProps> = ({ containerStyle, logoStyle, textContainerStyle, textStyle }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.headerContainer, containerStyle]}>
            <Image source={require('@/assets/images/fist.png')} style={[styles.logo, logoStyle]} resizeMode='contain' />
            <View style={[styles.textContainer, textContainerStyle]}>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Gain Muscle
                </ThemedText>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Lose Weight
                </ThemedText>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Maintain Results
                </ThemedText>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'column',
    },
    logo: {
        width: Sizes.imageMDWidth,
        height: Sizes.imageMDHeight,
        marginLeft: -Spaces.SM,
    },
    textContainer: {
        marginTop: Spaces.MD,
        flex: 1,
        justifyContent: 'center',
        marginLeft: Spaces.MD,
    },
    headerText: {
        fontSize: 18,
        lineHeight: 24,
    },
});
