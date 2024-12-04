// utils/auth.ts

import * as SecureStore from 'expo-secure-store';
import { fetchAuthSession } from 'aws-amplify/auth';

const STORAGE_KEYS = {
    USER_ID: 'userId',
    ACCESS_TOKEN: 'accessToken',
    ID_TOKEN: 'idToken',
    USER_INFO: 'userInfo',
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
            }

            // Store user info
            if (session.tokens.idToken?.payload) {
                const userInfo = {
                    sub: session.tokens.idToken.payload.sub,
                    email: session.tokens.idToken.payload.email,
                    email_verified: session.tokens.idToken.payload.email_verified,
                    auth_time: session.tokens.idToken.payload.auth_time,
                    username: session.tokens.idToken.payload['cognito:username'],
                    role: session.tokens.idToken.payload['custom:role'] || 'USER',
                    subStatus: session.tokens.idToken.payload['custom:subStatus'] || 'FREE',
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

    clearAuthData: async () => {
        const keys = Object.values(STORAGE_KEYS);
        await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key))).catch((error) => {
            console.error('Error clearing auth data:', error);
            throw error;
        });
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
};
