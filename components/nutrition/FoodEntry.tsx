// components/nutrition/FoodEntry.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

import { trigger } from 'react-native-haptic-feedback';

export interface FoodEntryData {
    id: string;
    name: string;
    portionSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    type: 'whole-foods' | 'branded-foods' | 'recipes' | 'my-foods' | 'my-recipes' | 'quick-add';
}

interface FoodEntryProps {
    food: FoodEntryData;
    onEdit: (food: FoodEntryData) => void;
    onDelete: (foodId: string) => void;
    style?: any;
}

export const FoodEntry: React.FC<FoodEntryProps> = ({ food, onEdit, onDelete, style }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const [isDeleteVisible, setIsDeleteVisible] = React.useState(false);
    const slideAnim = React.useRef(new Animated.Value(0)).current;

    const handleSwipeLeft = () => {
        if (isDeleteVisible) {
            hideDelete();
        } else {
            showDelete();
        }
    };

    const showDelete = () => {
        setIsDeleteVisible(true);
        Animated.timing(slideAnim, {
            toValue: -40,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const hideDelete = () => {
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setIsDeleteVisible(false);
        });
    };

    const handleEdit = () => {
        trigger('impactLight');
        onEdit(food);
        console.log('Edit food entry:', food.name);
    };

    const handleDelete = () => {
        trigger('impactMedium');
        onDelete(food.id);
        console.log('Delete food entry:', food.name);
        hideDelete();
    };

    return (
        <View style={[styles.container, style]}>
            {/* Delete button (behind the main content) */}
            {isDeleteVisible && (
                <View style={[styles.deleteButton, { backgroundColor: themeColors.surfaceDark }]}>
                    <TouchableOpacity style={styles.deleteButtonTouchable} onPress={handleDelete} activeOpacity={1}>
                        <Icon name='trash' size={Sizes.iconSizeSM} color={themeColors.subText} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Main content */}
            <Animated.View
                style={[
                    styles.content,
                    {
                        backgroundColor: themeColors.background,
                        transform: [{ translateX: slideAnim }],
                    },
                ]}
            >
                <TouchableOpacity style={styles.swipeArea} onPress={handleSwipeLeft} activeOpacity={1}>
                    <View style={styles.mainContent}>
                        <View style={styles.foodInfo}>
                            <ThemedText type='body' style={styles.foodName}>
                                {food.name}
                            </ThemedText>

                            {/* Nutrition line with icons (like MealSection) + portion size */}
                            <View style={styles.nutritionRow}>
                                {/* Calories */}
                                <View style={styles.nutritionItem}>
                                    <Icon name='flame' size={11} color={themeColors.iconDefault} />
                                    <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                        {Math.round(food.calories)}
                                    </ThemedText>
                                </View>

                                {/* Protein */}

                                <View style={styles.nutritionItem}>
                                    <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                        {Math.round(food.protein)}P
                                    </ThemedText>
                                </View>

                                {/* Carbs */}
                                <View style={styles.nutritionItem}>
                                    <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                        {Math.round(food.carbs)}C
                                    </ThemedText>
                                </View>

                                {/* Fats */}
                                <View style={styles.nutritionItem}>
                                    <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                        {Math.round(food.fats)}F
                                    </ThemedText>
                                </View>

                                {/* Dot separator */}
                                <View style={styles.dotSeparator}>
                                    <ThemedText style={[styles.dot, { color: themeColors.subText }]}>•</ThemedText>
                                </View>

                                {/* Portion size with ellipsis */}
                                <View style={styles.portionContainer}>
                                    <ThemedText
                                        type='bodySmall'
                                        style={[styles.portionSize, { color: themeColors.subText }]}
                                        numberOfLines={1}
                                        ellipsizeMode='tail'
                                    >
                                        {food.portionSize}
                                    </ThemedText>
                                </View>
                            </View>
                        </View>

                        <View style={styles.rightSection}>
                            <TouchableOpacity
                                style={[styles.editButton, { backgroundColor: themeColors.backgroundSecondary }]}
                                onPress={handleEdit}
                                activeOpacity={1}
                            >
                                <Icon name='edit' size={Sizes.iconSizeXS} color={themeColors.iconDefault} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    deleteButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: Spaces.SM,
        width: 40,
    },
    deleteButtonTouchable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    content: {
        borderRadius: Spaces.SM,
        overflow: 'hidden',
    },
    swipeArea: {
        width: '100%',
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.SM,
    },
    foodInfo: {
        flex: 1,
        marginRight: Spaces.SM, // Add margin to prevent overlap
    },
    foodName: {},
    nutritionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spaces.SM,
    },
    nutritionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 20,
        gap: Spaces.XS,
    },
    macroLetter: {
        fontSize: 10,
        lineHeight: 16,
        fontWeight: '600',
    },
    nutritionText: {
        fontSize: 13,
    },
    dotSeparator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        fontSize: 12,
    },
    portionContainer: {
        flex: 1, // This allows the portion size to take remaining space
        minWidth: 0, // Important for text truncation to work
    },
    portionSize: {
        fontSize: 13,
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    editButton: {
        padding: Spaces.XS,
        borderRadius: Spaces.LG,
    },
});
