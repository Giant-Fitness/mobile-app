// lib/storage/initializeOfflineServices.ts

import { databaseManager } from '@/lib/database/DatabaseManager';
import { appSettingsOfflineService } from '@/lib/storage/app-settings/AppSettingsOfflineService';
import { appSettingsSyncHandler } from '@/lib/storage/app-settings/AppSettingsSyncHandler';
import { bodyMeasurementOfflineService } from '@/lib/storage/body-measurements/BodyMeasurementOfflineService';
import { bodyMeasurementSyncHandler } from '@/lib/storage/body-measurements/BodyMeasurementSyncHandler';
import { exerciseSubstitutionOfflineService } from '@/lib/storage/exercise-substitutions/ExerciseSubstitutionOfflineService';
import { exerciseSubstitutionSyncHandler } from '@/lib/storage/exercise-substitutions/ExerciseSubstitutionSyncHandler';
import { fitnessProfileOfflineService } from '@/lib/storage/fitness-profile/FitnessProfileOfflineService';
import { fitnessProfileSyncHandler } from '@/lib/storage/fitness-profile/FitnessProfileSyncHandler';
import { nutritionLogOfflineService } from '@/lib/storage/nutrition-logs/NutritionLogOfflineService';
import { nutritionLogSyncHandler } from '@/lib/storage/nutrition-logs/NutritionLogSyncHandler';
import { programProgressOfflineService } from '@/lib/storage/program-progress/ProgramProgressOfflineService';
import { programProgressSyncHandler } from '@/lib/storage/program-progress/ProgramProgressSyncHandler';
import { weightMeasurementOfflineService } from '@/lib/storage/weight-measurements/WeightMeasurementOfflineService';
import { weightMeasurementSyncHandler } from '@/lib/storage/weight-measurements/WeightMeasurementSyncHandler';
import { networkStateManager } from '@/lib/sync/NetworkStateManager';
import { syncQueueManager } from '@/lib/sync/SyncQueueManager';

import { exerciseSetModificationOfflineService } from './exercise-set-modifications/ExerciseSetModificationOfflineService';
import { exerciseSetModificationSyncHandler } from './exercise-set-modifications/ExerciseSetModificationSyncHandler';
import { macroTargetOfflineService } from './macro-targets/MacroTargetOfflineService';
import { macroTargetSyncHandler } from './macro-targets/MacroTargetSyncHandler';
import { nutritionGoalOfflineService } from './nutrition-goals/NutritionGoalOfflineService';
import { nutritionGoalSyncHandler } from './nutrition-goals/NutritionGoalSyncHandler';

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
        const [
            weightInit,
            bodyInit,
            fitnessInit,
            appSettingsInit,
            programProgressInit,
            exerciseSubstitutionInit,
            exerciseSetModificationInit,
            nutritionGoalInit,
            macroTargetInit,
            nutritionLogInit,
        ] = await Promise.allSettled([
            programProgressOfflineService.initialize(),
            weightMeasurementOfflineService.initialize(),
            bodyMeasurementOfflineService.initialize(),
            fitnessProfileOfflineService.initialize(),
            appSettingsOfflineService.initialize(),
            exerciseSubstitutionOfflineService.initialize(),
            exerciseSetModificationOfflineService.initialize(),
            nutritionGoalOfflineService.initialize(),
            macroTargetOfflineService.initialize(),
            nutritionLogOfflineService.initialize(),
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
        if (appSettingsInit.status === 'rejected') {
            console.warn('App settings service initialization failed:', appSettingsInit.reason);
        }
        if (programProgressInit.status === 'rejected') {
            console.warn('Program progress service initialization failed:', programProgressInit.reason);
        }
        if (exerciseSubstitutionInit.status === 'rejected') {
            console.warn('Exercise substitution service initialization failed:', exerciseSubstitutionInit.reason);
        }
        if (exerciseSetModificationInit.status === 'rejected') {
            console.warn('Exercise set modification service initialization failed:', exerciseSetModificationInit.reason);
        }
        if (nutritionGoalInit.status === 'rejected') {
            console.warn('Nutrition goal service initialization failed:', nutritionGoalInit.reason);
        }
        if (macroTargetInit.status === 'rejected') {
            console.warn('Macro target service initialization failed:', macroTargetInit.reason);
        }
        if (nutritionLogInit.status === 'rejected') {
            console.warn('Nutrition log service initialization failed:', nutritionLogInit.reason);
        }

        // Step 3: Register sync handlers with the queue manager
        syncQueueManager.registerSyncHandler('program_progress', programProgressSyncHandler);
        syncQueueManager.registerSyncHandler('weight_measurements', weightMeasurementSyncHandler);
        syncQueueManager.registerSyncHandler('body_measurements', bodyMeasurementSyncHandler);
        syncQueueManager.registerSyncHandler('fitness_profiles', fitnessProfileSyncHandler);
        syncQueueManager.registerSyncHandler('app_settings', appSettingsSyncHandler);
        syncQueueManager.registerSyncHandler('exercise_substitutions', exerciseSubstitutionSyncHandler);
        syncQueueManager.registerSyncHandler('exercise_set_modifications', exerciseSetModificationSyncHandler);
        syncQueueManager.registerSyncHandler('nutrition_goals', nutritionGoalSyncHandler);
        syncQueueManager.registerSyncHandler('macro_targets', macroTargetSyncHandler);
        syncQueueManager.registerSyncHandler('nutrition_logs', nutritionLogSyncHandler);

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
