// utils/auth.ts

import * as SecureStore from 'expo-secure-store';
import { fetchAuthSession } from 'aws-amplify/auth';

export const authService = {
    storeAuthData: async () => {
        try {
            // Get auth session
            const session = await fetchAuthSession();

            if (session.tokens) {
                // Store tokens
                if (session.tokens.accessToken) {
                    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, session.tokens.accessToken.toString());
                }
                if (session.tokens.idToken) {
                    await SecureStore.setItemAsync(STORAGE_KEYS.ID_TOKEN, session.tokens.idToken.toString());
                }

                // Store user info from ID token
                if (session.tokens.idToken?.payload) {
                    const userInfo = {
                        sub: session.tokens.idToken.payload.sub,
                        email: session.tokens.idToken.payload.email,
                        email_verified: session.tokens.idToken.payload.email_verified,
                        auth_time: session.tokens.idToken.payload.auth_time,
                        username: session.tokens.idToken.payload['cognito:username'],
                    };
                    await SecureStore.setItemAsync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
                    if (userInfo.sub) {
                        await SecureStore.setItemAsync(STORAGE_KEYS.USER_ID, userInfo.sub);
                    }
                }
            }

            return {
                success: true,
                hasTokens: !!session.tokens,
            };
        } catch (error) {
            console.error('Error in storeAuthData:', {
                name: (error as Error).name,
                message: (error as Error).message,
                code: (error as any).code, // 'code' might not be part of the standard Error type
                stack: (error as Error).stack,
            });
            throw error;
        }
    },

    clearAuthData: async () => {
        try {
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_ID);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.ID_TOKEN);
            await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_INFO);
        } catch (error) {
            console.error('Error clearing auth data:', error);
            throw error;
        }
    },

    refreshSession: async () => {
        try {
            const session = await fetchAuthSession({ forceRefresh: true });
            return session;
        } catch (error) {
            console.error('Error refreshing session:', error);
            throw error;
        }
    },

    // Helper methods
    getUserId: async () => {
        return await SecureStore.getItemAsync(STORAGE_KEYS.USER_ID);
    },

    getAccessToken: async () => {
        return await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
    },

    getUserInfo: async () => {
        const userInfoStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER_INFO);
        return userInfoStr ? JSON.parse(userInfoStr) : null;
    },

    checkSession: async () => {
        try {
            const session = await fetchAuthSession();
            return {
                isAuthenticated: !!session.tokens,
                session,
            };
        } catch (error) {
            console.log(error);
            return {
                isAuthenticated: false,
                session: null,
            };
        }
    },
};

const STORAGE_KEYS = {
    USER_ID: 'userId',
    ACCESS_TOKEN: 'accessToken',
    ID_TOKEN: 'idToken',
    USER_INFO: 'userInfo',
};
