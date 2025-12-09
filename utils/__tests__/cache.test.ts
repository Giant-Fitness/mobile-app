import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheService, CacheTTL } from '../cache';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(async () => {
    cacheService = CacheService.getInstance();
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CacheService.getInstance();
      const instance2 = CacheService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve data', async () => {
      const key = 'test-key';
      const data = { name: 'Test', value: 123 };

      await cacheService.set(key, data, CacheTTL.SHORT);
      const retrieved = await cacheService.get(key);

      expect(retrieved).toEqual(data);
    });

    it('should return null for non-existent key', async () => {
      const retrieved = await cacheService.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should store different types of data', async () => {
      await cacheService.set('string', 'hello', CacheTTL.SHORT);
      await cacheService.set('number', 42, CacheTTL.SHORT);
      await cacheService.set('boolean', true, CacheTTL.SHORT);
      await cacheService.set('array', [1, 2, 3], CacheTTL.SHORT);
      await cacheService.set('object', { a: 1 }, CacheTTL.SHORT);

      expect(await cacheService.get('string')).toBe('hello');
      expect(await cacheService.get('number')).toBe(42);
      expect(await cacheService.get('boolean')).toBe(true);
      expect(await cacheService.get('array')).toEqual([1, 2, 3]);
      expect(await cacheService.get('object')).toEqual({ a: 1 });
    });
  });

  describe('exists', () => {
    it('should return true for existing key', async () => {
      await cacheService.set('test', 'data', CacheTTL.SHORT);
      const exists = await cacheService.exists('test');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const exists = await cacheService.exists('non-existent');
      expect(exists).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('should return false for existing cache (TTL is ignored)', async () => {
      await cacheService.set('test', 'data', CacheTTL.SHORT);
      const expired = await cacheService.isExpired('test');
      expect(expired).toBe(false);
    });

    it('should return true for non-existent key', async () => {
      const expired = await cacheService.isExpired('non-existent');
      expect(expired).toBe(true);
    });
  });

  describe('needsBackgroundRefresh', () => {
    it('should return true for existing cache', async () => {
      await cacheService.set('test', 'data', CacheTTL.SHORT);
      const needsRefresh = await cacheService.needsBackgroundRefresh('test');
      expect(needsRefresh).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      const needsRefresh = await cacheService.needsBackgroundRefresh('non-existent');
      expect(needsRefresh).toBe(false);
    });
  });

  describe('getCacheAge', () => {
    it('should return age in milliseconds', async () => {
      await cacheService.set('test', 'data', CacheTTL.SHORT);
      const age = await cacheService.getCacheAge('test');
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(100); // Should be very recent
    });

    it('should return null for non-existent key', async () => {
      const age = await cacheService.getCacheAge('non-existent');
      expect(age).toBeNull();
    });
  });

  describe('remove', () => {
    it('should remove cached item', async () => {
      await cacheService.set('test', 'data', CacheTTL.SHORT);
      expect(await cacheService.exists('test')).toBe(true);

      await cacheService.remove('test');
      expect(await cacheService.exists('test')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all cached items', async () => {
      await cacheService.set('test1', 'data1', CacheTTL.SHORT);
      await cacheService.set('test2', 'data2', CacheTTL.SHORT);
      await cacheService.set('test3', 'data3', CacheTTL.SHORT);

      await cacheService.clear();

      expect(await cacheService.exists('test1')).toBe(false);
      expect(await cacheService.exists('test2')).toBe(false);
      expect(await cacheService.exists('test3')).toBe(false);
    });

    it('should not clear non-cache items', async () => {
      await AsyncStorage.setItem('regular-key', 'regular-value');
      await cacheService.set('cache-key', 'cache-value', CacheTTL.SHORT);

      await cacheService.clear();

      const regularValue = await AsyncStorage.getItem('regular-key');
      expect(regularValue).toBe('regular-value');
      expect(await cacheService.exists('cache-key')).toBe(false);
    });
  });

  describe('getBackgroundRefreshKeys', () => {
    it('should return all cache keys', async () => {
      await cacheService.set('test1', 'data1', CacheTTL.SHORT);
      await cacheService.set('test2', 'data2', CacheTTL.SHORT);

      const keys = await cacheService.getBackgroundRefreshKeys();
      expect(keys).toContain('test1');
      expect(keys).toContain('test2');
    });

    it('should return empty array when no cache exists', async () => {
      const keys = await cacheService.getBackgroundRefreshKeys();
      expect(keys).toEqual([]);
    });
  });

  describe('getCacheStats', () => {
    it('should return correct statistics', async () => {
      await cacheService.set('test1', 'data1', CacheTTL.SHORT);
      await cacheService.set('test2', 'data2', CacheTTL.SHORT);

      const stats = await cacheService.getCacheStats();
      expect(stats.totalItems).toBe(2);
      expect(stats.needsBackgroundRefresh).toBe(2);
      expect(stats.expired).toBe(0);
      expect(stats.fresh).toBe(0);
    });

    it('should return zero stats when cache is empty', async () => {
      const stats = await cacheService.getCacheStats();
      expect(stats.totalItems).toBe(0);
      expect(stats.needsBackgroundRefresh).toBe(0);
      expect(stats.expired).toBe(0);
      expect(stats.fresh).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      const mockError = new Error('Storage error');
      jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(mockError);
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      await cacheService.set('test', 'data', CacheTTL.SHORT);

      expect(consoleWarn).toHaveBeenCalledWith(
        'Failed to cache item test:',
        mockError
      );

      consoleWarn.mockRestore();
    });
  });
});
