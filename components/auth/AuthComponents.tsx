// components/auth/AuthComponents.tsx

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { ThemedText } from '@/components/base/ThemedText';

const CustomHeader: React.ComponentType = () => {
    return (
        <View style={styles.headerContainer}>
            <Image source={require('@/assets/images/logo.png')} style={styles.logo} resizeMode='contain' />
            {/* <ThemedText type="titleXLarge" style={styles.headerText}>
        Welcome Back!
      </ThemedText> */}
        </View>
    );
};

const CustomFooter: React.ComponentType = () => {
    return (
        <View style={styles.footerContainer}>
            <ThemedText type='caption' style={styles.footerText}>
                © 2024 Giant Fitness
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        paddingHorizontal: Spaces.LG,
    },
    logo: {
        width: Sizes.imageLGHeight,
        height: Sizes.imageLGHeight,
        // marginBottom: Spaces.LG,
    },
    headerText: {
        marginBottom: Spaces.XS,
    },
    subHeaderText: {
        marginBottom: Spaces.SM,
    },
    footerContainer: {
        padding: Spaces.LG,
        alignItems: 'center',
    },
    footerText: {
        marginTop: Spaces.SM,
    },
});

export { CustomHeader, CustomFooter };
