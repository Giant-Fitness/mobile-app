// utils/api/apiConfig.ts

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { handleApiError } from './errorUtils';
import { authService } from '@/utils/auth';

declare module 'axios' {
    export interface InternalAxiosRequestConfig {
        retryCount?: number;
    }
}

export const API_CONFIG = {
    BASE_URL: 'https://p6dhi29ete.execute-api.ap-south-1.amazonaws.com/v1',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    TIMEOUT: 10000,
} as const;

export class RetryError extends Error {
    constructor(public originalError: AxiosError, public attempts: number) {
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
const handleAxiosError = (error: any) => {
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out:', error.message);
        } else {
            console.error('Axios error:', error.message);
            console.error('Response:', error.response ? JSON.stringify(error.response.data, null, 2) : 'No response');
        }
    } else {
        console.error('Unknown error:', error);
    }
    throw error;
};

// Add retry mechanism to an axios instance
const addRetryInterceptor = (client: AxiosInstance) => {
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const config = error.config;
            if (!config) {
                return Promise.reject(error);
            }

            config.retryCount = config.retryCount ?? 0;

            const shouldRetry = (error: AxiosError): boolean => {
                return !error.response || (error.response.status >= 500 && error.response.status <= 599);
            };

            if (config.retryCount < API_CONFIG.RETRY_ATTEMPTS && shouldRetry(error)) {
                config.retryCount += 1;

                const delay = config.retryCount * API_CONFIG.RETRY_DELAY;
                await new Promise((resolve) => setTimeout(resolve, delay));

                console.log(`Retrying request (${config.retryCount}/${API_CONFIG.RETRY_ATTEMPTS})`);
                return client(config);
            }

            if (config.retryCount >= API_CONFIG.RETRY_ATTEMPTS) {
                return Promise.reject(new RetryError(error, API_CONFIG.RETRY_ATTEMPTS));
            }

            return Promise.reject(error);
        },
    );
};

// Create base axios instance
const createBaseClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: API_CONFIG.BASE_URL,
        timeout: API_CONFIG.TIMEOUT,
    });

    client.interceptors.response.use(parseResponse);
    addRetryInterceptor(client);

    return client;
};

// Create authenticated axios instance
const createAuthenticatedClient = (): AxiosInstance => {
    const client = createBaseClient();

    // Add auth token to requests
    client.interceptors.request.use(async (config) => {
        try {
            const token = await authService.getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    });

    return client;
};

// Export both authenticated and non-authenticated clients
export const apiClient = createBaseClient();
export const authApiClient = createAuthenticatedClient();
