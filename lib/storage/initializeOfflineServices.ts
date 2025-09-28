// lib/storage/initializeOfflineServices.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { appSettingsOfflineService } from '@/lib/storage/app-settings/AppSettingsOfflineService';
import { appSettingsSyncHandler } from '@/lib/storage/app-settings/AppSettingsSyncHandler';
import { bodyMeasurementOfflineService } from '@/lib/storage/body-measurements/BodyMeasurementOfflineService';
import { bodyMeasurementSyncHandler } from '@/lib/storage/body-measurements/BodyMeasurementSyncHandler';
import { fitnessProfileOfflineService } from '@/lib/storage/fitness-profile/FitnessProfileOfflineService';
import { fitnessProfileSyncHandler } from '@/lib/storage/fitness-profile/FitnessProfileSyncHandler';
import { nutritionProfileOfflineService } from '@/lib/storage/nutrition-profile/NutritionProfileOfflineService';
import { nutritionProfileSyncHandler } from '@/lib/storage/nutrition-profile/NutritionProfileSyncHandler';
import { weightMeasurementOfflineService } from '@/lib/storage/weight-measurements/WeightMeasurementOfflineService';
import { weightMeasurementSyncHandler } from '@/lib/storage/weight-measurements/WeightMeasurementSyncHandler';
import { networkStateManager } from '@/lib/sync/NetworkStateManager';
import { syncQueueManager } from '@/lib/sync/SyncQueueManager';

export interface OfflineInitializationOptions {
    enableNetworkMonitoring?: boolean;
}

/**
 * Initialize all offline services and sync handlers in the correct order
 */
export async function initializeOfflineServices(options: OfflineInitializationOptions = {}): Promise<void> {
    const { enableNetworkMonitoring = true } = options;

    console.log('🔧 Initializing offline infrastructure...');

    try {
        // Step 1: Initialize core infrastructure
        await databaseManager.initialize();

        if (enableNetworkMonitoring) {
            await networkStateManager.initialize();
        }

        await syncQueueManager.initialize();

        // Step 2: Initialize data services (creates tables if needed)
        const [weightInit, bodyInit, fitnessInit, nutritionInit, appSettingsInit] = await Promise.allSettled([
            weightMeasurementOfflineService.initialize(),
            bodyMeasurementOfflineService.initialize(),
            fitnessProfileOfflineService.initialize(),
            nutritionProfileOfflineService.initialize(),
            appSettingsOfflineService.initialize(),
        ]);

        // Check if any failed
        if (weightInit.status === 'rejected') {
            console.warn('Weight measurement service initialization failed:', weightInit.reason);
        }
        if (bodyInit.status === 'rejected') {
            console.warn('Body measurement service initialization failed:', bodyInit.reason);
        }
        if (fitnessInit.status === 'rejected') {
            console.warn('Fitness profile service initialization failed:', fitnessInit.reason);
        }
        if (nutritionInit.status === 'rejected') {
            console.warn('Nutrition profile service initialization failed:', nutritionInit.reason);
        }
        if (appSettingsInit.status === 'rejected') {
            console.warn('App settings service initialization failed:', appSettingsInit.reason);
        }

        // Step 3: Register sync handlers with the queue manager
        syncQueueManager.registerSyncHandler('weight_measurements', weightMeasurementSyncHandler);
        syncQueueManager.registerSyncHandler('body_measurements', bodyMeasurementSyncHandler);
        syncQueueManager.registerSyncHandler('fitness_profiles', fitnessProfileSyncHandler);
        syncQueueManager.registerSyncHandler('nutrition_profiles', nutritionProfileSyncHandler);
        syncQueueManager.registerSyncHandler('app_settings', appSettingsSyncHandler);

        console.log('✅ Offline services initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize offline services:', error);
        throw new Error(`Offline initialization failed: ${error}`);
    }
}

/**
 * Cleanup all offline services (useful for testing or app shutdown)
 */
export async function cleanupOfflineServices(): Promise<void> {
    console.log('🧹 Cleaning up offline services...');

    try {
        syncQueueManager.cleanup();
        networkStateManager.cleanup();
        await databaseManager.close();

        console.log('✅ Offline services cleaned up');
    } catch (error) {
        console.error('⚠️ Error during offline services cleanup:', error);
    }
}
