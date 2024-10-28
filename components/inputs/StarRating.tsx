// components/inputs/StarRating.tsx

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Star } from 'lucide-react-native';

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    style?: any;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    return (
        <View style={[styles.container, style]}>
            {[1, 2, 3, 4, 5].map((starNumber) => (
                <TouchableOpacity key={starNumber} onPress={() => onRatingChange(starNumber)} style={styles.starContainer}>
                    <Star size={32} fill={starNumber <= rating ? themeColors.buttonPrimary : 'none'} color={themeColors.buttonPrimary} />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    starContainer: {
        padding: 8,
    },
});
