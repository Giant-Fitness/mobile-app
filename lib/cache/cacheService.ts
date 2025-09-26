// lib/cache/cacheService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number; // TTL in milliseconds (kept for compatibility but ignored)
}

export enum CacheTTL {
    VERY_LONG = 14 * 24 * 60 * 60 * 1000, // 14 days
    LONG = 7 * 24 * 60 * 60 * 1000, // 7 days
    SHORT = 1 * 24 * 60 * 60 * 1000, // 1 day
}

export class CacheService {
    private static instance: CacheService;

    public static getInstance(): CacheService {
        if (!CacheService.instance) {
            CacheService.instance = new CacheService();
        }
        return CacheService.instance;
    }

    private generateKey(key: string): string {
        return `cache_${key}`;
    }

    async set<T>(key: string, data: T, ttl: CacheTTL): Promise<void> {
        try {
            const cacheItem: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl,
            };
            await AsyncStorage.setItem(this.generateKey(key), JSON.stringify(cacheItem));
        } catch (error) {
            console.warn(`Failed to cache item ${key}:`, error);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const cached = await AsyncStorage.getItem(this.generateKey(key));
            if (!cached) return null;

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            return cacheItem.data;
        } catch (error) {
            console.warn(`Failed to get cached item ${key}:`, error);
            return null;
        }
    }

    /**
     * Check if cache is expired (IGNORING TTL FOR NOW)
     * Always returns false since we're ignoring TTLs
     */
    async isExpired(key: string): Promise<boolean> {
        try {
            const cached = await AsyncStorage.getItem(this.generateKey(key));
            if (!cached) return true; // No cache = expired

            // IGNORING TTL - cache is never considered "expired" for blocking purposes
            return false;
        } catch (error) {
            console.warn(`Failed to check expiration for ${key}:`, error);
            return true;
        }
    }

    /**
     * Check if item needs background refresh (IGNORING TTL FOR NOW)
     * Always returns true if cache exists - we'll refresh everything in background
     */
    async needsBackgroundRefresh(key: string): Promise<boolean> {
        try {
            const cached = await AsyncStorage.getItem(this.generateKey(key));
            if (!cached) return false; // No cache = no background refresh needed (will be fetched fresh)

            // IGNORING TTL - always refresh in background if cache exists
            return true;
        } catch (error) {
            console.warn(`Failed to check background refresh need for ${key}:`, error);
            return false;
        }
    }

    /**
     * Get cache age in milliseconds
     */
    async getCacheAge(key: string): Promise<number | null> {
        try {
            const cached = await AsyncStorage.getItem(this.generateKey(key));
            if (!cached) return null;

            const cacheItem: CacheItem<any> = JSON.parse(cached);
            return Date.now() - cacheItem.timestamp;
        } catch (error) {
            console.warn(`Failed to get cache age for ${key}:`, error);
            return null;
        }
    }

    /**
     * Check if cache exists (regardless of expiration)
     */
    async exists(key: string): Promise<boolean> {
        try {
            const cached = await AsyncStorage.getItem(this.generateKey(key));
            return cached !== null;
        } catch (error) {
            console.warn(`Failed to check existence for ${key}:`, error);
            return false;
        }
    }

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.generateKey(key));
        } catch (error) {
            console.warn(`Failed to remove cached item ${key}:`, error);
        }
    }

    async clear(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
            await AsyncStorage.multiRemove(cacheKeys);
        } catch (error) {
            console.warn('Failed to clear cache:', error);
        }
    }

    /**
     * Get keys that are expired (IGNORING TTL - returns empty array)
     */
    async getExpiredKeys(): Promise<string[]> {
        // IGNORING TTL - no keys are considered "expired"
        return [];
    }

    /**
     * Get keys that need background refresh (ALL existing cache keys)
     */
    async getBackgroundRefreshKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith('cache_'));

            // Return all cache keys since we're refreshing everything in background
            return cacheKeys.map((key) => key.replace('cache_', ''));
        } catch (error) {
            console.warn('Failed to get background refresh keys:', error);
            return [];
        }
    }

    /**
     * Get cache statistics for debugging
     */
    async getCacheStats(): Promise<{
        totalItems: number;
        needsBackgroundRefresh: number;
        expired: number;
        fresh: number;
    }> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith('cache_'));

            // Since we're ignoring TTL:
            // - expired = 0 (nothing is considered expired)
            // - needsBackgroundRefresh = totalItems (everything gets refreshed)
            // - fresh = 0 (nothing is considered "fresh enough" to skip refresh)

            return {
                totalItems: cacheKeys.length,
                needsBackgroundRefresh: cacheKeys.length,
                expired: 0,
                fresh: 0,
            };
        } catch (error) {
            console.warn('Failed to get cache stats:', error);
            return {
                totalItems: 0,
                needsBackgroundRefresh: 0,
                expired: 0,
                fresh: 0,
            };
        }
    }
}

export const cacheService = CacheService.getInstance();
