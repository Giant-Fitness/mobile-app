// components/home/LargeActionTile.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType, ViewStyle } from 'react-native';
import { ThemedText, ThemedTextProps } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

interface LargeActionTileProps {
    title: string;
    titleSize?: ThemedTextProps['type'];
    bodySize?: ThemedTextProps['type'];
    description: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    image: ImageSourcePropType;
    imageSize?: number;
    containerStyle?: ViewStyle;
}

export const LargeActionTile = ({
    title,
    description,
    onPress,
    backgroundColor,
    textColor,
    image,
    titleSize = 'titleXLarge',
    bodySize = 'body',
    containerStyle,
    imageSize = Sizes.imageSM,
}: LargeActionTileProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor,
                    padding: Spaces.LG,
                    paddingTop: Spaces.LG + Spaces.MD,
                    marginHorizontal: Spaces.LG,
                    marginBottom: Spaces.XL,
                },
                containerStyle, // Applied last like in PrimaryButton
            ]}
            activeOpacity={0.9}
        >
            <View style={styles.contentContainer}>
                <ThemedText type={titleSize} style={[styles.title, { color: textColor, textAlign: 'center' }]}>
                    {title}
                </ThemedText>
                <ThemedText type={bodySize} style={[{ color: textColor, textAlign: 'center' }]}>
                    {description}
                </ThemedText>
            </View>
            <Image
                source={image}
                style={[
                    styles.image,
                    {
                        width: imageSize,
                        height: imageSize,
                    },
                ]}
                resizeMode='contain'
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Spaces.MD,
        alignItems: 'center',
        overflow: 'visible',
        minHeight: 200,
        position: 'relative',
    },
    title: {
        marginBottom: Spaces.SM,
    },
    contentContainer: {
        maxWidth: '80%',
    },
    image: {
        position: 'absolute',
        bottom: -Spaces.XL,
        right: Spaces.SM,
    },
});
