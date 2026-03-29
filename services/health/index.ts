// services/health/index.ts
// Export all health service modules

export * from './HealthPlatform';
export * from './AppleHealthService';
export * from './HealthConnectService';
export * from './HealthPlatformManager';

// Convenience exports
export { healthPlatformManager as healthManager } from './HealthPlatformManager';
export { appleHealthService } from './AppleHealthService';
export { healthConnectService } from './HealthConnectService';
