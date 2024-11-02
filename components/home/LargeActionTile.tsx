// components/home/LargeActionTile.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

interface LargeActionTileProps {
    title: string;
    description: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    image: ImageSourcePropType;
    imageSize?: number; // Optional size override
}

export const LargeActionTile = ({
    title,
    description,
    onPress,
    backgroundColor,
    textColor,
    image,
    imageSize = Sizes.imageSM, // Default size
}: LargeActionTileProps) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.container, { backgroundColor }]} activeOpacity={0.9}>
            <View style={styles.contentContainer}>
                <ThemedText type='titleXLarge' style={[styles.title, { color: textColor, textAlign: 'center' }]}>
                    {title}
                </ThemedText>
                <ThemedText style={[{ color: textColor, textAlign: 'center' }]}>{description}</ThemedText>
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
        padding: Spaces.LG,
        marginHorizontal: Spaces.LG,
        marginBottom: Spaces.XL,
        alignItems: 'center',
        overflow: 'visible', // This allows the image to overflow
        minHeight: 200, // Ensure enough space for content and image
        position: 'relative', // For absolute positioning of the image
    },
    title: {
        marginBottom: Spaces.SM,
    },
    contentContainer: {
        paddingTop: Spaces.MD,
        maxWidth: '80%', // Leave space for the image
    },
    image: {
        position: 'absolute',
        bottom: -Spaces.XL, // Make it overlap the bottom
        right: Spaces.SM,
    },
});
