// utils/auth.ts

import * as SecureStore from 'expo-secure-store';
import { fetchAuthSession, signOut as amplifySignOut } from 'aws-amplify/auth';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { cacheService } from './cache'; // Import your cache service

const STORAGE_KEYS = {
    USER_ID: 'userId',
    ACCESS_TOKEN: 'accessToken',
    ID_TOKEN: 'idToken',
    USER_INFO: 'userInfo',
    AUTH_PROVIDER: 'authProvider',
};

export const authService = {
    storeAuthData: async () => {
        try {
            const session = await fetchAuthSession();

            if (!session.tokens) {
                return { success: false, hasTokens: false };
            }

            const promises = [];

            // Store access token
            if (session.tokens.accessToken) {
                promises.push(SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, session.tokens.accessToken.toString()));
            }

            // Store ID token
            if (session.tokens.idToken) {
                promises.push(SecureStore.setItemAsync(STORAGE_KEYS.ID_TOKEN, session.tokens.idToken.toString()));

                // Determine and store the auth provider
                const payload = session.tokens.idToken.payload;
                let authProvider = 'cognito';

                // Safe handling of identities with proper type checks
                if (payload && 'identities' in payload) {
                    const identities = payload.identities;

                    // Careful type narrowing to ensure we have a valid array of identities
                    if (Array.isArray(identities) && identities.length > 0) {
                        const firstIdentity = identities[0];

                        // Type check to ensure the identity has providerType
                        if (
                            typeof firstIdentity === 'object' &&
                            firstIdentity !== null &&
                            'providerType' in firstIdentity &&
                            typeof firstIdentity.providerType === 'string'
                        ) {
                            authProvider = firstIdentity.providerType.toLowerCase();
                        }
                    }
                }

                promises.push(SecureStore.setItemAsync(STORAGE_KEYS.AUTH_PROVIDER, authProvider));
            }

            // Store user info
            if (session.tokens.idToken?.payload) {
                const payload = session.tokens.idToken.payload;

                const userInfo = {
                    sub: payload.sub || '',
                    email: typeof payload.email === 'string' ? payload.email : '',
                    email_verified: payload.email_verified || false,
                    auth_time: payload.auth_time || 0,
                    username: typeof payload['cognito:username'] === 'string' ? payload['cognito:username'] : '',
                    role: typeof payload['custom:role'] === 'string' ? payload['custom:role'] : 'USER',
                    subStatus: typeof payload['custom:subStatus'] === 'string' ? payload['custom:subStatus'] : 'FREE',
                };

                promises.push(SecureStore.setItemAsync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo)));

                if (userInfo.sub) {
                    promises.push(SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userInfo.sub));
                }
            }

            await Promise.all(promises);

            return {
                success: true,
                hasTokens: true,
            };
        } catch (error) {
            console.error('Error in storeAuthData:', {
                name: (error as Error).name,
                message: (error as Error).message,
                code: (error as any).code,
            });
            throw error;
        }
    },

    signOut: async () => {
        try {
            // Get the auth provider to determine the right sign-out flow
            const authProvider = (await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_PROVIDER)) || 'cognito';

            // For Google authentication, use a more cautious approach
            if (authProvider === 'google') {
                // First clear local auth data
                await authService.clearAuthData();

                // Close any open browser sessions to prevent redirects (iOS only)
                if (Platform.OS === 'ios') {
                    WebBrowser.dismissAuthSession();
                }

                // Then perform a local-only sign out (no global sign out)
                await amplifySignOut({ global: false });

                return true;
            } else {
                // For Cognito email/password auth, use normal sign out
                await amplifySignOut({ global: false });
                await authService.clearAuthData();
                return true;
            }
        } catch (error) {
            console.error('Error signing out:', error);
            // Even if there's an error with Amplify, clear local data
            try {
                await authService.clearAuthData();
            } catch (clearError) {
                console.error('Error clearing auth data during sign-out failure:', clearError);
            }
            return false;
        }
    },

    // Enhanced clearAuthData to include cache clearing
    clearAuthData: async () => {
        try {
            // Clear secure store auth data
            const keys = Object.values(STORAGE_KEYS);
            await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));

            // Clear all cached data
            await cacheService.clear();

            console.log('All auth data and cache cleared successfully');
        } catch (error) {
            console.error('Error clearing auth data and cache:', error);
            throw error;
        }
    },

    isTokenExpired: async () => {
        try {
            const session = await fetchAuthSession();
            const expiry = session.tokens?.accessToken?.payload?.exp;
            if (typeof expiry !== 'number') {
                return true;
            }

            const expirationTime = expiry * 1000;
            const currentTime = Date.now();
            const timeUntilExpiry = expirationTime - currentTime;

            // Refresh if token expires in less than 5 minutes
            return timeUntilExpiry < 300000;
        } catch {
            return true;
        }
    },

    getAccessToken: async () => {
        try {
            // First try to get a fresh session token
            const session = await fetchAuthSession();
            const freshToken = session.tokens?.accessToken?.toString();

            // If we got a fresh token and it's different from stored one
            if (freshToken) {
                const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
                if (freshToken !== storedToken) {
                    // Update stored token if different
                    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, freshToken);
                }
                return `Bearer ${freshToken}`;
            }

            // If we couldn't get a fresh session, fall back to stored token
            const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            if (!storedToken) {
                throw new Error('No access token found');
            }

            // Check if stored token is expired
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                // Token is expired, try to refresh
                const refreshedSession = await authService.refreshSession();
                if (refreshedSession.tokens?.accessToken) {
                    await authService.storeAuthData(); // Store all new tokens
                    return `Bearer ${refreshedSession.tokens.accessToken.toString()}`;
                }
            }

            return `Bearer ${storedToken}`;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    },

    refreshSession: async () => {
        try {
            const session = await fetchAuthSession({ forceRefresh: true });
            if (!session.tokens) {
                throw new Error('No tokens in refreshed session');
            }
            return session;
        } catch (error) {
            console.error('Error refreshing session:', error);
            throw error;
        }
    },

    getUserId: async () => {
        const userId = await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
        if (!userId) {
            throw new Error('No user ID found');
        }
        return userId;
    },

    getUserInfo: async () => {
        const userInfoStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER_INFO);
        if (!userInfoStr) {
            return null;
        }
        return JSON.parse(userInfoStr);
    },

    checkSession: async () => {
        try {
            const session = await fetchAuthSession();
            return {
                isAuthenticated: !!session.tokens,
                session,
            };
        } catch (error) {
            console.error('Session check failed:', error);
            return {
                isAuthenticated: false,
                session: null,
            };
        }
    },

    getAuthProvider: async () => {
        return (await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_PROVIDER)) || 'cognito';
    },
};
