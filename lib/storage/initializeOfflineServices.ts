// lib/storage/initializeOfflineServices.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
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
        const [weightInit, bodyInit, fitnessInit, nutritionInit] = await Promise.allSettled([
            weightMeasurementOfflineService.initialize(),
            bodyMeasurementOfflineService.initialize(),
            fitnessProfileOfflineService.initialize(),
            nutritionProfileOfflineService.initialize(),
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

        // Step 3: Register sync handlers with the queue manager
        syncQueueManager.registerSyncHandler('weight_measurements', weightMeasurementSyncHandler);
        syncQueueManager.registerSyncHandler('body_measurements', bodyMeasurementSyncHandler);
        syncQueueManager.registerSyncHandler('fitness_profiles', fitnessProfileSyncHandler);
        syncQueueManager.registerSyncHandler('nutrition_profiles', nutritionProfileSyncHandler);

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

/**
 * Get initialization status for debugging
 */
export async function getOfflineServicesStatus(): Promise<{
    database: boolean;
    network: boolean;
    syncQueue: boolean;
    weightService: boolean;
    bodyService: boolean;
    fitnessProfileService: boolean;
    nutritionProfileService: boolean;
}> {
    try {
        // These would need to be exposed as public methods on your services
        // For now, we'll do basic checks
        const databaseOk = !!databaseManager.getDatabase();
        const networkOk = !!networkStateManager.getCurrentState();
        const syncQueueOk = !!(await syncQueueManager.getSyncStatus());

        return {
            database: databaseOk,
            network: networkOk,
            syncQueue: syncQueueOk,
            weightService: true, // Assume OK if no errors thrown
            bodyService: true, // Assume OK if no errors thrown
            fitnessProfileService: true, // Assume OK if no errors thrown
            nutritionProfileService: true, // Assume OK if no errors thrown
        };
    } catch (error) {
        console.error('Error checking offline services status:', error);
        return {
            database: false,
            network: false,
            syncQueue: false,
            weightService: false,
            bodyService: false,
            fitnessProfileService: false,
            nutritionProfileService: false,
        };
    }
}
