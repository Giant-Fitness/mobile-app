// app/(app)/(tabs)/food-log.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AppDispatch } from '@/store/store';
import { getUserAsync } from '@/store/user/thunks';
import React, { useCallback, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import { trigger } from 'react-native-haptic-feedback';
import { useDispatch } from 'react-redux';

export default function FoodLogScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const dispatch = useDispatch<AppDispatch>();

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Ref to track if component is mounted and focused
    const isMountedAndFocused = useRef(true);
    const refreshTimeoutRef = useRef<number | null>(null);

    // Handle focus/blur events to manage refresh state
    useFocusEffect(
        useCallback(() => {
            isMountedAndFocused.current = true;

            return () => {
                isMountedAndFocused.current = false;
                // Clear any pending refresh timeout
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                    refreshTimeoutRef.current = null;
                }
                // Reset refresh state when leaving screen
                if (isRefreshing) {
                    setIsRefreshing(false);
                }
            };
        }, [isRefreshing]),
    );

    const handleRefresh = async () => {
        // Prevent multiple simultaneous refreshes
        if (isRefreshing) return;

        setIsRefreshing(true);
        trigger('virtualKeyRelease');

        try {
            await dispatch(getUserAsync({ forceRefresh: true }));
            // Add other food diary related async calls here when implemented
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            // Add a small delay to ensure smooth animation completion
            refreshTimeoutRef.current = setTimeout(() => {
                if (isMountedAndFocused.current) {
                    setIsRefreshing(false);
                }
                refreshTimeoutRef.current = null;
            }, 200);
        }
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode='never'
            refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[themeColors.iconSelected]} tintColor={themeColors.iconSelected} />
            }
            style={[styles.container, { backgroundColor: themeColors.background }]}
        >
            <ThemedView style={{ paddingBottom: Spaces.SM }}>
                {/* Placeholder for recent meals or other content */}
                <View style={styles.header}>
                    <ThemedText type='titleLarge'>Recent Meals</ThemedText>
                </View>

                <View style={styles.emptyState}>
                    <ThemedText type='body' style={[styles.emptyText, { color: themeColors.subText }]}>
                        No meals logged yet today. Start by adding your first meal above!
                    </ThemedText>
                </View>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginTop: Spaces.XL,
        paddingHorizontal: Spaces.LG,
        marginBottom: Spaces.SM,
    },
    emptyState: {
        paddingHorizontal: Spaces.LG,
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
    },
});
