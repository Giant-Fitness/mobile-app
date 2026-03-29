// app/(app)/settings/health-integration.tsx
// Health integration settings screen

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Text, Switch, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    checkHealthPlatformAvailability,
    enableHealthIntegration,
    disableHealthIntegration,
    fetchHealthSettings,
    syncHealthData,
} from '@/store/health/thunks';
import { format } from 'date-fns';
import { router } from 'expo-router';

export default function HealthIntegrationScreen() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.user);
    const health = useAppSelector((state) => state.health);
    const [isSyncing, setIsSyncing] = useState(false);

    useEffect(() => {
        // Check platform availability
        dispatch(checkHealthPlatformAvailability());

        // Fetch settings if user is available
        if (user?.UserId) {
            dispatch(fetchHealthSettings(user.UserId));
        }
    }, [dispatch, user?.UserId]);

    const isEnabled =
        health.settings?.AppleHealthEnabled || health.settings?.HealthConnectEnabled;

    const handleToggleIntegration = async () => {
        if (!user?.UserId) {
            Alert.alert('Error', 'User not found');
            return;
        }

        try {
            if (isEnabled) {
                // Disable integration
                Alert.alert(
                    'Disable Health Integration',
                    'Are you sure you want to disable health data synchronization? Your existing synced data will be preserved.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Disable',
                            style: 'destructive',
                            onPress: async () => {
                                await dispatch(
                                    disableHealthIntegration({ userId: user.UserId })
                                ).unwrap();
                                Alert.alert('Success', 'Health integration disabled');
                            },
                        },
                    ]
                );
            } else {
                // Enable integration
                if (!health.isPlatformAvailable) {
                    Alert.alert(
                        'Not Available',
                        `${health.platformName} is not available on this device.`
                    );
                    return;
                }

                Alert.alert(
                    'Enable Health Integration',
                    `Connect to ${health.platformName} to automatically sync your weight, sleep, and body measurements?`,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Enable',
                            onPress: async () => {
                                try {
                                    await dispatch(
                                        enableHealthIntegration({ userId: user.UserId })
                                    ).unwrap();
                                    Alert.alert(
                                        'Success',
                                        'Health integration enabled! Your data is being synced.'
                                    );
                                } catch (error: any) {
                                    Alert.alert(
                                        'Error',
                                        error || 'Failed to enable health integration'
                                    );
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'An error occurred');
        }
    };

    const handleManualSync = async () => {
        if (!user?.UserId) {
            return;
        }

        try {
            setIsSyncing(true);
            await dispatch(syncHealthData({ userId: user.UserId, force: true })).unwrap();
            Alert.alert('Success', 'Health data synced successfully');
        } catch (error: any) {
            Alert.alert('Error', error || 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const formatSyncTime = (timestamp?: string) => {
        if (!timestamp) return 'Never';
        try {
            return format(new Date(timestamp), 'MMM d, yyyy h:mm a');
        } catch {
            return 'Unknown';
        }
    };

    if (health.settingsLoadingState === 'PENDING') {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Loading health settings...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text variant="headlineSmall" style={styles.title}>
                    Health Integration
                </Text>
                <Text variant="bodyMedium" style={styles.subtitle}>
                    Automatically sync your health data from{' '}
                    {Platform.OS === 'ios' ? 'Apple Health' : 'Health Connect'}
                </Text>
            </View>

            <Divider style={styles.divider} />

            {/* Platform availability */}
            <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                    Platform Status
                </Text>
                <View style={styles.row}>
                    <Text variant="bodyMedium">{health.platformName}</Text>
                    <Text
                        variant="bodyMedium"
                        style={health.isPlatformAvailable ? styles.available : styles.unavailable}
                    >
                        {health.isPlatformAvailable ? 'Available' : 'Not Available'}
                    </Text>
                </View>
            </View>

            <Divider style={styles.divider} />

            {/* Integration toggle */}
            <View style={styles.section}>
                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text variant="titleMedium">Enable Sync</Text>
                        <Text variant="bodySmall" style={styles.helperText}>
                            Sync weight, sleep, and body measurements
                        </Text>
                    </View>
                    <Switch
                        value={isEnabled}
                        onValueChange={handleToggleIntegration}
                        disabled={!health.isPlatformAvailable}
                    />
                </View>
            </View>

            {isEnabled && (
                <>
                    <Divider style={styles.divider} />

                    {/* Sync status */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Sync Status
                        </Text>

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium">Last Sync:</Text>
                            <Text variant="bodyMedium" style={styles.infoValue}>
                                {formatSyncTime(
                                    health.settings?.AppleHealthLastSyncAt ||
                                        health.settings?.HealthConnectLastSyncAt
                                )}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium">Auto-Sync:</Text>
                            <Text variant="bodyMedium" style={styles.infoValue}>
                                {health.settings?.AutoSyncEnabled ? 'Enabled' : 'Disabled'}
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text variant="bodyMedium">Sync History:</Text>
                            <Text variant="bodyMedium" style={styles.infoValue}>
                                Last {health.settings?.SyncHistoryDays || 30} days
                            </Text>
                        </View>

                        <Button
                            mode="contained"
                            onPress={handleManualSync}
                            loading={isSyncing || health.syncLoadingState === 'PENDING'}
                            disabled={isSyncing || health.syncLoadingState === 'PENDING'}
                            style={styles.syncButton}
                        >
                            {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </Button>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Data types */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Synced Data Types
                        </Text>

                        <View style={styles.dataTypeItem}>
                            <Text variant="bodyMedium">• Weight measurements</Text>
                        </View>
                        <View style={styles.dataTypeItem}>
                            <Text variant="bodyMedium">• Sleep data</Text>
                        </View>
                        <View style={styles.dataTypeItem}>
                            <Text variant="bodyMedium">
                                • Body measurements (waist, hip)
                            </Text>
                        </View>
                    </View>

                    <Divider style={styles.divider} />

                    {/* Info section */}
                    <View style={styles.section}>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            How It Works
                        </Text>
                        <Text variant="bodyMedium" style={styles.infoText}>
                            • Data is synced from {health.platformName} to your app
                        </Text>
                        <Text variant="bodyMedium" style={styles.infoText}>
                            • Synced data can be viewed and edited in your logging screens
                        </Text>
                        <Text variant="bodyMedium" style={styles.infoText}>
                            • Your data remains private and is stored securely
                        </Text>
                        <Text variant="bodyMedium" style={styles.infoText}>
                            • You can disable sync at any time
                        </Text>
                    </View>
                </>
            )}

            <View style={styles.bottomSpacing} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
    },
    section: {
        padding: 16,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        color: '#666',
    },
    sectionTitle: {
        fontWeight: '600',
        marginBottom: 12,
    },
    divider: {
        marginVertical: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowText: {
        flex: 1,
        marginRight: 16,
    },
    helperText: {
        color: '#666',
        marginTop: 4,
    },
    available: {
        color: '#4CAF50',
        fontWeight: '600',
    },
    unavailable: {
        color: '#F44336',
        fontWeight: '600',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    infoValue: {
        fontWeight: '600',
    },
    syncButton: {
        marginTop: 16,
    },
    dataTypeItem: {
        marginBottom: 8,
    },
    infoText: {
        marginBottom: 8,
        color: '#666',
    },
    bottomSpacing: {
        height: 32,
    },
});
