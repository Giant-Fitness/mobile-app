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
    SHORT = 2 * 24 * 60 * 60 * 1000, // 2 days
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
}

export const cacheService = CacheService.getInstance();
