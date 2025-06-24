// components/home/ActionTile.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Spaces } from '@/constants/Spaces';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ActionTileProps {
    image: ImageSourcePropType;
    title: string;
    onPress: () => void;
    backgroundColor: string;
    textColor: string;
    imageSize?: number;
    width?: number;
    height?: number;
    style?: ViewStyle;
    fontSize?: number;
    showChevron?: boolean;
}

export const ActionTile = ({
    image,
    title,
    onPress,
    backgroundColor,
    textColor,
    imageSize = 50,
    width = 120,
    height = 130,
    style,
    fontSize = 13,
    showChevron = false,
}: ActionTileProps) => {
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
                style,
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
            <View style={styles.textWrapper}>
                <View style={styles.textContainer}>
                    <ThemedText type={'overline'} style={[styles.text, { color: textColor, fontSize: fontSize }]} numberOfLines={2}>
                        {title}
                    </ThemedText>
                    {showChevron && <Icon name='chevron-forward' size={fontSize} color={textColor} style={styles.chevron} />}
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.XXS,
    },
    text: {
        lineHeight: 18,
    },
    textWrapper: {
        flexShrink: 1,
    },
    chevron: {
        marginLeft: Spaces.XXS,
    },
});
