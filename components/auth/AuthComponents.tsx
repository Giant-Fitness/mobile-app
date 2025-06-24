// components/auth/AuthComponents.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Image, ImageStyle, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

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
            <Image source={require('@/assets/icons/splash-icon-dark.png')} style={[styles.logo, logoStyle]} resizeMode='contain' />
            <View style={[styles.textContainer, textContainerStyle]}>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Fitness, Simplified
                </ThemedText>
                <ThemedText type='headline' style={[styles.headerText, { color: themeColors.text }, textStyle]}>
                    Progress, Supercharged
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
        marginLeft: -Spaces.MD,
    },
    textContainer: {
        marginTop: -Spaces.LG - Spaces.SM,
        flex: 1,
        justifyContent: 'center',
        marginLeft: Spaces.MD,
    },
    headerText: {
        fontSize: 18,
        lineHeight: 24,
    },
});
