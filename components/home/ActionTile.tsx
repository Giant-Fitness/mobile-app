// components/home/ActionTile.tsx

import React from 'react';
import { StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';

interface ActionTileProps {
    image: ImageSourcePropType;
    title: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    imageSize?: number;
    width?: number;
    height?: number;
}

export const ActionTile = ({ image, title, onPress, backgroundColor, textColor, imageSize = 50, width = 120, height = 130 }: ActionTileProps) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.container,
                {
                    backgroundColor,
                    width,
                    height,
                },
            ]}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={image}
                    style={[
                        styles.image,
                        {
                            width: imageSize,
                            height: imageSize,
                            tintColor: textColor,
                        },
                    ]}
                    resizeMode='contain'
                />
            </View>
            <View style={styles.textContainer}>
                <ThemedText type={'overline'} style={[styles.text, { color: textColor }]} numberOfLines={2}>
                    {title}
                </ThemedText>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Spaces.MD,
        padding: Spaces.SM + Spaces.XS,
        marginRight: Spaces.MD,
        justifyContent: 'space-between',
    },
    imageContainer: {
        marginBottom: Spaces.XXS,
    },
    image: {
        width: 40,
        height: 40,
    },
    textContainer: {
        flexShrink: 1,
    },
    text: {
        fontSize: 13,
        lineHeight: 18,
    },
});
