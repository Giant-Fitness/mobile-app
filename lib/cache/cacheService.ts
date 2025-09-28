// lib/cache/cacheService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CacheItem<T> {
    data: T;
    timestamp: number;
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

    async set<T>(key: string, data: T): Promise<void> {
        try {
            const cacheItem: CacheItem<T> = {
                data,
                timestamp: Date.now(),
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
}

export const cacheService = CacheService.getInstance();
