// utils/api/apiConfig.ts

import { authService } from '@/utils/auth';

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { handleApiError } from './errorUtils';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        retryCount?: number;
    }
}
interface ApiConfig {
    BASE_URL: string; // Make this string instead of literal type
    RETRY_ATTEMPTS: number;
    RETRY_DELAY: number;
    TIMEOUT: number;
}

export const API_CONFIG = {
    CATALOG_API: {
        // BASE_URL: 'https://mfr52pxu54.execute-api.ap-south-1.amazonaws.com/v1/',
        BASE_URL: 'https://bd9lpoysuk.execute-api.ap-south-1.amazonaws.com/v1/',
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        TIMEOUT: 10000,
    },
    USERS_API: {
        // BASE_URL: 'https://9tx2oki3g7.execute-api.ap-south-1.amazonaws.com/v1/',
        BASE_URL: 'https://kkftdf4lzk.execute-api.ap-south-1.amazonaws.com/v1',
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        TIMEOUT: 10000,
    },
    FEEDBACK_API: {
        // BASE_URL: 'https://p589brhtni.execute-api.ap-south-1.amazonaws.com/v1/',
        BASE_URL: 'https://kcz0rv962l.execute-api.ap-south-1.amazonaws.com/v1/',
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        TIMEOUT: 10000,
    },
    RECOMMENDATIONS_API: {
        // BASE_URL: 'https://mb4m5mqhk8.execute-api.ap-south-1.amazonaws.com/v1/',
        BASE_URL: 'https://0on6j1nq7k.execute-api.ap-south-1.amazonaws.com/v1/',
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
        TIMEOUT: 10000,
    },
} as const;

export class RetryError extends Error {
    constructor(
        public originalError: AxiosError,
        public attempts: number,
    ) {
        super(`Request failed after ${attempts} attempts`);
        this.name = 'RetryError';
    }
}

// Response parsing helper
const parseResponse = (response: AxiosResponse) => {
    if (response.data.body) {
        try {
            response.data = JSON.parse(response.data.body);
        } catch (error) {
            handleApiError(error, 'ResponseParsing');
        }
    }
    return response;
};

// Error handling helper
// const handleAxiosError = (error: any) => {
//     if (axios.isAxiosError(error)) {
//         if (error.code === 'ECONNABORTED') {
//             console.error('Request timed out:', error.message);
//         } else {
//             console.error('Axios error:', error.message);
//             console.error('Response:', error.response ? JSON.stringify(error.response.data, null, 2) : 'No response');
//         }
//     } else {
//         console.error('Unknown error:', error);
//     }
//     throw error;
// };

// Add retry mechanism to an axios instance
const addRetryInterceptor = (client: AxiosInstance, config: ApiConfig) => {
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const axiosConfig = error.config;
            if (!axiosConfig) {
                return Promise.reject(error);
            }
            axiosConfig.retryCount = axiosConfig.retryCount ?? 0;

            const shouldRetry = (error: AxiosError): boolean => {
                return !error.response || (error.response.status >= 500 && error.response.status <= 599);
            };

            if (axiosConfig.retryCount < config.RETRY_ATTEMPTS && shouldRetry(error)) {
                axiosConfig.retryCount += 1;
                const delay = axiosConfig.retryCount * config.RETRY_DELAY;
                await new Promise((resolve) => setTimeout(resolve, delay));

                // Build the full URL for logging
                const fullUrl = axiosConfig.url?.startsWith('http') ? axiosConfig.url : `${axiosConfig.baseURL || ''}${axiosConfig.url || ''}`;

                console.log(`Retrying request (${axiosConfig.retryCount}/${config.RETRY_ATTEMPTS}) for URL: ${fullUrl}`);
                return client(axiosConfig);
            }

            if (axiosConfig.retryCount >= config.RETRY_ATTEMPTS) {
                return Promise.reject(new RetryError(error, config.RETRY_ATTEMPTS));
            }
            return Promise.reject(error);
        },
    );
};

// Update the client creation function to use the interface
const createApiClient = (config: ApiConfig): AxiosInstance => {
    const client = axios.create({
        baseURL: config.BASE_URL,
        timeout: config.TIMEOUT,
    });
    client.interceptors.response.use(parseResponse);
    addRetryInterceptor(client, config);
    return client;
};

// Create authenticated axios instance
const createAuthenticatedApiClient = (config: ApiConfig): AxiosInstance => {
    const client = createApiClient(config);

    client.interceptors.request.use(async (config) => {
        try {
            const authHeader = await authService.getAccessToken();
            if (authHeader) {
                config.headers.Authorization = authHeader;
            }
            return config;
        } catch (error) {
            console.error('Error setting auth header:', error);
            return Promise.reject(error);
        }
    });

    return client;
};

// Export both authenticated and non-authenticated clients
export const catalogApiClient = createApiClient(API_CONFIG.CATALOG_API);
export const usersApiClient = createApiClient(API_CONFIG.USERS_API);
export const recommendationsApiClient = createApiClient(API_CONFIG.RECOMMENDATIONS_API);
export const feedbackApiClient = createApiClient(API_CONFIG.FEEDBACK_API);

export const authCatalogApiClient = createAuthenticatedApiClient(API_CONFIG.CATALOG_API);
export const authUsersApiClient = createAuthenticatedApiClient(API_CONFIG.USERS_API);
export const authRecommendationsApiClient = createAuthenticatedApiClient(API_CONFIG.RECOMMENDATIONS_API);
export const authFeedbackApiClient = createAuthenticatedApiClient(API_CONFIG.FEEDBACK_API);
