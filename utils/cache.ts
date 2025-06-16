// utils/cache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number; // TTL in milliseconds
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
     * Check if cache is expired (legacy method - kept for compatibility)
     * Note: This should not be used for blocking user experience anymore
     */
    async isExpired(key: string): Promise<boolean> {
        try {
            const cached = await AsyncStorage.getItem(this.generateKey(key));
            if (!cached) return true;

            const cacheItem: CacheItem<any> = JSON.parse(cached);
            const age = Date.now() - cacheItem.timestamp;
            return age > cacheItem.ttl;
        } catch (error) {
            console.warn(`Failed to check expiration for ${key}:`, error);
            return true;
        }
    }

    /**
     * Check if item needs background refresh based on TTL
     * This is used for background refresh decisions, not blocking user experience
     */
    async needsBackgroundRefresh(key: string): Promise<boolean> {
        try {
            const cached = await AsyncStorage.getItem(this.generateKey(key));
            if (!cached) return false; // No cache = no background refresh needed (will be fetched fresh)

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
     * Get keys that are expired (legacy method - use getBackgroundRefreshKeys instead)
     */
    async getExpiredKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
            const expiredKeys: string[] = [];

            for (const key of cacheKeys) {
                const originalKey = key.replace('cache_', '');
                if (await this.isExpired(originalKey)) {
                    expiredKeys.push(originalKey);
                }
            }

            return expiredKeys;
        } catch (error) {
            console.warn('Failed to get expired keys:', error);
            return [];
        }
    }

    /**
     * Get keys that need background refresh
     */
    async getBackgroundRefreshKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith('cache_'));
            const refreshKeys: string[] = [];

            for (const key of cacheKeys) {
                const originalKey = key.replace('cache_', '');
                if (await this.needsBackgroundRefresh(originalKey)) {
                    refreshKeys.push(originalKey);
                }
            }

            return refreshKeys;
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

            let needsBackgroundRefresh = 0;
            let expired = 0;
            let fresh = 0;

            for (const key of cacheKeys) {
                const originalKey = key.replace('cache_', '');
                const needsRefresh = await this.needsBackgroundRefresh(originalKey);
                const isExpired = await this.isExpired(originalKey);

                if (isExpired) {
                    expired++;
                } else if (needsRefresh) {
                    needsBackgroundRefresh++;
                } else {
                    fresh++;
                }
            }

            return {
                totalItems: cacheKeys.length,
                needsBackgroundRefresh,
                expired,
                fresh,
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
