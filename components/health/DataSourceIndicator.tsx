// components/health/DataSourceIndicator.tsx
// Component to indicate the source of health data (manual, Apple Health, Health Connect)

import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { DataSource } from '@/types/userTypes';
import { Apple } from 'lucide-react-native';

interface DataSourceIndicatorProps {
    dataSource?: DataSource;
    isModified?: boolean;
    showLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
    style?: any;
}

export function DataSourceIndicator({
    dataSource = DataSource.MANUAL,
    isModified = false,
    showLabel = true,
    size = 'small',
    style,
}: DataSourceIndicatorProps) {
    if (!dataSource || dataSource === DataSource.MANUAL) {
        if (!showLabel) return null;

        return (
            <View style={[styles.container, style]}>
                <Text variant="labelSmall" style={styles.manualText}>
                    ✎ Manual
                </Text>
            </View>
        );
    }

    const getIconSize = () => {
        switch (size) {
            case 'small':
                return 12;
            case 'medium':
                return 16;
            case 'large':
                return 20;
            default:
                return 12;
        }
    };

    const getTextVariant = () => {
        switch (size) {
            case 'small':
                return 'labelSmall';
            case 'medium':
                return 'labelMedium';
            case 'large':
                return 'labelLarge';
            default:
                return 'labelSmall';
        }
    };

    const renderIcon = () => {
        const iconSize = getIconSize();

        if (dataSource === DataSource.APPLE_HEALTH) {
            return <Apple size={iconSize} color="#000" />;
        }

        if (dataSource === DataSource.HEALTH_CONNECT) {
            return (
                <View style={[styles.androidIcon, { width: iconSize, height: iconSize }]}>
                    <Text style={styles.androidIconText}>H</Text>
                </View>
            );
        }

        return null;
    };

    const getLabel = () => {
        if (dataSource === DataSource.APPLE_HEALTH) {
            return 'Apple Health';
        }
        if (dataSource === DataSource.HEALTH_CONNECT) {
            return 'Health Connect';
        }
        return 'Synced';
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.sourceContainer}>
                {renderIcon()}
                {showLabel && (
                    <Text variant={getTextVariant()} style={styles.sourceText}>
                        {getLabel()}
                    </Text>
                )}
                {isModified && (
                    <Text variant="labelSmall" style={styles.modifiedText}>
                        (Edited)
                    </Text>
                )}
            </View>
        </View>
    );
}

export function DataSourceBadge({
    dataSource,
    isModified,
    compact = false,
}: {
    dataSource?: DataSource;
    isModified?: boolean;
    compact?: boolean;
}) {
    if (!dataSource || dataSource === DataSource.MANUAL) {
        return null;
    }

    const getIcon = () => {
        if (dataSource === DataSource.APPLE_HEALTH) {
            return '🍏';
        }
        if (dataSource === DataSource.HEALTH_CONNECT) {
            return '🤖';
        }
        return '🔄';
    };

    if (compact) {
        return (
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{getIcon()}</Text>
            </View>
        );
    }

    return (
        <View style={styles.badge}>
            <Text style={styles.badgeText}>
                {getIcon()}
                {isModified && ' ⚠️'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    sourceText: {
        color: '#666',
        marginLeft: 4,
    },
    manualText: {
        color: '#999',
    },
    modifiedText: {
        color: '#FF9800',
        marginLeft: 4,
    },
    androidIcon: {
        backgroundColor: '#3DDC84',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    androidIconText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: '#f5f5f5',
    },
    badgeText: {
        fontSize: 12,
    },
});
