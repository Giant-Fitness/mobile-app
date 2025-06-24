// components/base/PullToRefresh.tsx

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import Animated from 'react-native-reanimated';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children?: React.ReactNode;
    style?: ViewStyle;
    contentContainerStyle?: ViewStyle;
    headerHeight?: number;
    // If true, PullToRefresh will handle the scrolling itself instead of letting children do it
    useNativeScrollView?: boolean;
    // If using a custom scroll view and want it non-scrollable
    disableChildrenScrolling?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    style,
    contentContainerStyle,
    headerHeight = 0,
    useNativeScrollView = false,
    disableChildrenScrolling = false,
}) => {
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    // Refs to track scroll state and prevent stuck animations
    const scrollViewRef = useRef<ScrollView>(null);
    const isNavigatingAway = useRef(false);
    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle focus/blur to reset stuck animations
    useFocusEffect(
        useCallback(() => {
            isNavigatingAway.current = false;

            // If we were stuck in refreshing state, reset it
            if (refreshing) {
                // Small delay to allow any pending operations to complete
                resetTimeoutRef.current = setTimeout(() => {
                    setRefreshing(false);
                }, 100);
            }

            return () => {
                isNavigatingAway.current = true;

                // Clear any pending timeouts
                if (refreshTimeoutRef.current) {
                    clearTimeout(refreshTimeoutRef.current);
                    refreshTimeoutRef.current = null;
                }
                if (resetTimeoutRef.current) {
                    clearTimeout(resetTimeoutRef.current);
                    resetTimeoutRef.current = null;
                }

                // Force reset the refresh state when navigating away
                // This prevents the stuck animation issue
                if (refreshing) {
                    setRefreshing(false);
                }

                // Try to reset scroll position to prevent visual artifacts
                if (scrollViewRef.current) {
                    try {
                        scrollViewRef.current.scrollTo({ y: 0, animated: false });
                    } catch (error) {
                        // Ignore errors if ScrollView is already unmounted
                        console.log(error);
                    }
                }
            };
        }, [refreshing]),
    );

    const handleRefresh = async () => {
        // Prevent refresh if we're navigating away or already refreshing
        if (refreshing || isNavigatingAway.current) return;

        setRefreshing(true);

        try {
            await onRefresh();
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            // Only reset refreshing state if we're still on this screen
            if (!isNavigatingAway.current) {
                // Add a small delay to ensure smooth animation completion
                refreshTimeoutRef.current = setTimeout(() => {
                    if (!isNavigatingAway.current) {
                        setRefreshing(false);
                    }
                    refreshTimeoutRef.current = null;
                }, 300);
            } else {
                // If we're navigating away, reset immediately
                setRefreshing(false);
            }
        }
    };

    // Enhanced refresh control with better state management
    const refreshControl = (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[themeColors.iconSelected]} // For Android
            tintColor={themeColors.iconSelected} // For iOS
            title='' // For iOS
            titleColor={themeColors.subText} // For iOS
            progressViewOffset={headerHeight}
            progressBackgroundColor={themeColors.background} // For Android
        />
    );

    // Check if we need to use our own ScrollView or let child components handle scrolling
    if (useNativeScrollView) {
        // Special check: if we detect a FlatList in the children, we should never use a native ScrollView
        const hasDirectFlatList = React.Children.toArray(children).some((child) => {
            if (!React.isValidElement(child)) return false;
            return child.type === FlatList || (typeof child.type === 'function' && child.type.name === 'FlatList');
        });

        if (hasDirectFlatList) {
            console.warn(
                'PullToRefresh: Detected FlatList child while useNativeScrollView=true. ' +
                    'Setting useNativeScrollView=false to avoid nesting VirtualizedLists.',
            );

            // Process the children as if useNativeScrollView was false
            const processedChildren = React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;

                if (child.type === FlatList || (typeof child.type === 'function' && child.type.name === 'FlatList')) {
                    return React.cloneElement(child, {
                        refreshControl,
                        ...child.props,
                    });
                }

                return child;
            });

            return (
                <View style={[styles.container, style]}>
                    {headerHeight > 0 && <View style={[styles.headerSpacer, { height: headerHeight }]} />}
                    {processedChildren}
                </View>
            );
        }

        // If no direct FlatList, proceed with native ScrollView
        return (
            <ScrollView
                ref={scrollViewRef}
                style={[styles.container, style]}
                contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
                refreshControl={refreshControl}
                showsVerticalScrollIndicator={false}
                // Add these props to improve scroll behavior
                bounces={true} // Enable bouncing for iOS
                alwaysBounceVertical={true} // Always allow vertical bounce on iOS
                scrollEventThrottle={16} // Smooth scrolling
            >
                {children}
            </ScrollView>
        );
    }

    // If not using a native ScrollView, process child components
    // (ScrollView, Animated.ScrollView, FlatList)
    const processedChildren = React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Handle direct FlatList
        if (child.type === FlatList || (typeof child.type === 'function' && child.type.name === 'FlatList')) {
            return React.cloneElement(child, {
                refreshControl,
                scrollEnabled: disableChildrenScrolling ? false : child.props.scrollEnabled !== false,
                ...child.props,
            });
        }

        // Handle ScrollView and Animated.ScrollView
        if (
            child.type === ScrollView ||
            child.type === Animated.ScrollView ||
            (typeof child.type === 'object' && (child.type as any)?.displayName?.includes('ScrollView'))
        ) {
            return React.cloneElement(child, {
                refreshControl,
                scrollEnabled: disableChildrenScrolling ? false : child.props.scrollEnabled !== false,
                // Add ref if it's a regular ScrollView
                ...(child.type === ScrollView && { ref: scrollViewRef }),
                // Add bounce properties for better behavior
                bounces: true,
                alwaysBounceVertical: true,
                scrollEventThrottle: 16,
                ...child.props,
            });
        }

        // Look for nested FlatList inside View
        if (child.type === View || (typeof child.type === 'string' && child.type === 'View')) {
            const nestedChildren = React.Children.toArray(child.props.children);
            const nestedFlatList = nestedChildren.find((nestedChild) => {
                if (!React.isValidElement(nestedChild)) return false;
                return nestedChild.type === FlatList || (typeof nestedChild.type === 'function' && nestedChild.type.name === 'FlatList');
            });

            if (nestedFlatList && React.isValidElement(nestedFlatList)) {
                const modifiedNested = React.cloneElement(nestedFlatList, {
                    refreshControl,
                    scrollEnabled: disableChildrenScrolling ? false : nestedFlatList.props.scrollEnabled !== false,
                    ...nestedFlatList.props,
                });

                // Replace the FlatList in the nested children
                const updatedNestedChildren = nestedChildren.map((nestedChild) => {
                    if (!React.isValidElement(nestedChild)) return nestedChild;
                    if (nestedChild === nestedFlatList) return modifiedNested;
                    return nestedChild;
                });

                // Return a new View with the updated children
                return React.cloneElement(child, {
                    ...child.props,
                    children: updatedNestedChildren,
                });
            }
        }

        return child;
    });

    return (
        <View style={[styles.container, style]}>
            {headerHeight > 0 && <View style={[styles.headerSpacer, { height: headerHeight }]} />}
            {processedChildren}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    contentContainer: {
        flexGrow: 1,
    },
    headerSpacer: {
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
    },
});

export default PullToRefresh;
