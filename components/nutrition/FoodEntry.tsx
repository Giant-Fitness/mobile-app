// components/nutrition/FoodEntry.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { trigger } from 'react-native-haptic-feedback';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

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

    const translateX = useSharedValue(0);
    const SWIPE_THRESHOLD = -20; // How far to swipe before snapping to delete
    const DELETE_WIDTH = 40; // Width of delete area
    const MAX_SWIPE = -DELETE_WIDTH; // Maximum swipe distance

    const resetPosition = () => {
        'worklet';
        translateX.value = withSpring(0);
    };

    const showDeleteButton = () => {
        'worklet';
        translateX.value = withSpring(MAX_SWIPE);
    };

    const handleEdit = () => {
        trigger('impactLight');
        onEdit(food);
        resetPosition();
    };

    const handleDelete = () => {
        trigger('impactMedium');
        onDelete(food.id);
        resetPosition();
    };

    // Pan gesture for the food item swipe-to-delete
    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            // Only allow swiping left (negative translation)
            // Clamp between MAX_SWIPE and 0
            const newValue = Math.max(MAX_SWIPE, Math.min(0, event.translationX));
            translateX.value = newValue;
        })
        .onEnd((event) => {
            const shouldShowDelete = event.translationX < SWIPE_THRESHOLD || event.velocityX < -300; // Lower velocity threshold for food items

            if (shouldShowDelete) {
                showDeleteButton();
            } else {
                resetPosition();
            }
        })
        // This is key: make it fail if the gesture is more vertical than horizontal
        // This allows the parent scroll to take precedence for vertical gestures
        .failOffsetY([-15, 15]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={[styles.container, style]}>
            {/* Delete button - always rendered, positioned off-screen */}
            <View style={[styles.deleteButton, { backgroundColor: themeColors.backgroundSecondary }]}>
                <TouchableOpacity style={styles.deleteButtonTouchable} onPress={handleDelete} activeOpacity={1}>
                    <View style={[styles.deleteButtonTouchable, { backgroundColor: themeColors.iconDefault }]}>
                        <Icon name='delete' size={Sizes.iconSizeXS} color={themeColors.background} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Main content with gesture detector */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            backgroundColor: themeColors.background,
                        },
                        animatedStyle,
                    ]}
                >
                    <TouchableOpacity style={styles.mainContent} onPress={handleEdit} activeOpacity={0.95}>
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
                            <View style={[styles.editButton, { backgroundColor: themeColors.backgroundSecondary }]}>
                                <Icon name='edit' size={Sizes.iconSizeXS} color={themeColors.iconDefault} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginVertical: Spaces.XXS,
    },
    deleteButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: Spaces.SM,
        borderBottomRightRadius: Spaces.SM,
        marginRight: Spaces.XXS,
    },
    deleteButtonTouchable: {
        height: 28,
        width: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        borderRadius: Spaces.SM,
        width: '100%',
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spaces.MD,
        paddingVertical: Spaces.XXS,
    },
    foodInfo: {
        flex: 1,
        marginRight: Spaces.SM,
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
        flex: 1,
        minWidth: 0,
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
