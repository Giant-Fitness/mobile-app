// components/nutrition/MealItem.tsx

import { Icon } from '@/components/base/Icon';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { FoodEntry } from '@/types/nutritionLogsTypes';
import { debounce } from '@/utils/debounce';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { trigger } from 'react-native-haptic-feedback';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface MealItemProps {
    food: FoodEntry;
    style?: any;
    enableSwipeToDelete?: boolean; // Feature flag for swipe-to-delete
}

export const MealItem: React.FC<MealItemProps> = ({ food, style, enableSwipeToDelete = false }) => {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const router = useRouter();

    const translateX = useSharedValue(0);
    const isHorizontalPan = useSharedValue(false);

    const SWIPE_THRESHOLD = -20; // How far to swipe before snapping to delete
    const DELETE_WIDTH = 40; // Width of delete area
    const MAX_SWIPE = -DELETE_WIDTH; // Maximum swipe distance
    const DIRECTION_LOCK_THRESHOLD = 10; // Pixels to determine gesture direction

    const resetPosition = () => {
        'worklet';
        translateX.value = withSpring(0);
        isHorizontalPan.value = false;
    };

    const showDeleteButton = () => {
        'worklet';
        translateX.value = withSpring(MAX_SWIPE);
    };

    const handleEdit = () => {
        trigger('impactLight');
        // Navigate directly to edit screen
        debounce(router, {
            pathname: '/(app)/nutrition/edit-meal-item',
            params: {
                food: JSON.stringify(food),
            },
        });

        if (enableSwipeToDelete) {
            resetPosition();
        }
    };

    const handleDelete = () => {
        trigger('impactMedium');
        console.log('food deleted');
        if (enableSwipeToDelete) {
            resetPosition();
        }
    };

    // Pan gesture for the food item swipe-to-delete
    const panGesture = Gesture.Pan()
        .onStart(() => {
            isHorizontalPan.value = false;
        })
        .onUpdate((event) => {
            const absX = Math.abs(event.translationX);
            const absY = Math.abs(event.translationY);

            // Determine gesture direction only if we haven't locked in yet
            if (!isHorizontalPan.value && (absX > DIRECTION_LOCK_THRESHOLD || absY > DIRECTION_LOCK_THRESHOLD)) {
                // Lock in horizontal pan only if horizontal movement is significantly more than vertical
                if (absX > absY * 1.5 && absX > DIRECTION_LOCK_THRESHOLD) {
                    isHorizontalPan.value = true;
                }
            }

            // Only update translation if this is confirmed as a horizontal pan
            if (isHorizontalPan.value) {
                // Only allow swiping left (negative translation)
                // Clamp between MAX_SWIPE and 0
                const newValue = Math.max(MAX_SWIPE, Math.min(0, event.translationX));
                translateX.value = newValue;
            }
        })
        .onEnd((event) => {
            if (isHorizontalPan.value) {
                const shouldShowDelete = event.translationX < SWIPE_THRESHOLD || event.velocityX < -300;

                if (shouldShowDelete) {
                    showDeleteButton();
                } else {
                    resetPosition();
                }
            } else {
                // Not a horizontal pan, reset position
                resetPosition();
            }
        })
        // Fail the gesture if vertical movement is too dominant early on
        .failOffsetY([-10, 10])
        // Make this gesture less aggressive in claiming touches
        .shouldCancelWhenOutside(true);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const contentComponent = (
        <Animated.View
            style={[
                styles.content,
                {
                    backgroundColor: themeColors.background,
                },
                enableSwipeToDelete ? animatedStyle : {},
            ]}
        >
            <TouchableOpacity style={styles.mainContent} onPress={handleEdit} activeOpacity={0.95}>
                <View style={styles.foodInfo}>
                    <ThemedText type='body' style={styles.foodName}>
                        {food.Name}
                    </ThemedText>

                    {/* Nutrition line with icons (like MealSection) + portion size */}
                    <View style={styles.nutritionRow}>
                        {/* Calories */}
                        <View style={styles.nutritionItem}>
                            <Icon name='flame' size={11} color={themeColors.iconDefault} />
                            <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                {Math.round(food.QuickMacros.Calories)}
                            </ThemedText>
                        </View>

                        {/* Protein */}
                        <View style={styles.nutritionItem}>
                            <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                {Math.round(food.QuickMacros.Protein)}P
                            </ThemedText>
                        </View>

                        {/* Carbs */}
                        <View style={styles.nutritionItem}>
                            <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                {Math.round(food.QuickMacros.Carbs)}C
                            </ThemedText>
                        </View>

                        {/* Fat */}
                        <View style={styles.nutritionItem}>
                            <ThemedText type='bodySmall' style={[styles.nutritionText, { color: themeColors.subText }]}>
                                {Math.round(food.QuickMacros.Fat)}F
                            </ThemedText>
                        </View>

                        {/* Dot separator */}
                        <View style={styles.dotSeparator}>
                            <ThemedText style={[styles.dot, { color: themeColors.subText }]}>•</ThemedText>
                        </View>

                        {/* Portion size with ellipsis */}
                        <View style={styles.portionContainer}>
                            <ThemedText type='bodySmall' style={[styles.portionSize, { color: themeColors.subText }]} numberOfLines={1} ellipsizeMode='tail'>
                                {food.UserInputValue} {food.UserInputUnit}
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
    );

    return (
        <View style={[styles.container, style]}>
            {/* Delete button - only rendered when swipe-to-delete is enabled */}
            {enableSwipeToDelete && (
                <View style={[styles.deleteButton, { backgroundColor: themeColors.backgroundSecondary }]}>
                    <TouchableOpacity style={styles.deleteButtonTouchable} onPress={handleDelete} activeOpacity={1}>
                        <View style={[styles.deleteButtonTouchable, { backgroundColor: themeColors.iconDefault }]}>
                            <Icon name='delete' size={Sizes.iconSizeXS} color={themeColors.background} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Main content with optional gesture detector */}
            {enableSwipeToDelete ? <GestureDetector gesture={panGesture}>{contentComponent}</GestureDetector> : contentComponent}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginVertical: Spaces.SM,
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
    },
    foodInfo: {
        flex: 1,
    },
    foodName: {},
    nutritionRow: {
        marginTop: -Spaces.XS,
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
    timestampText: {
        fontSize: 11,
        fontStyle: 'italic',
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
