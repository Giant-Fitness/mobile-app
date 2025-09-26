// lib/api/errorUtils.ts

import axios from 'axios';

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public code?: string,
        public originalError?: any,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export enum ErrorCode {
    TIMEOUT = 'TIMEOUT',
    NETWORK = 'NETWORK',
    AUTH = 'AUTH',
    SERVER = 'SERVER',
    NOT_FOUND = 'NOT_FOUND',
    VALIDATION = 'VALIDATION',
    UNKNOWN = 'UNKNOWN',
}

export const handleApiError = (error: unknown, context?: string): never => {
    const prefix = context ? `[${context}] ` : '';

    if (error instanceof ApiError) {
        console.error(`${prefix}${error.message}`, {
            statusCode: error.statusCode,
            code: error.code,
        });
        throw error;
    }

    if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        let apiError: ApiError;

        if (error.code === 'ECONNABORTED') {
            apiError = new ApiError(`${prefix}Request timed out after ${error.config?.timeout}ms`, statusCode, ErrorCode.TIMEOUT, error);
        } else if (!error.response) {
            apiError = new ApiError(`${prefix}Network error occurred`, undefined, ErrorCode.NETWORK, error);
        } else {
            switch (statusCode) {
                case 401:
                case 403:
                    apiError = new ApiError(`${prefix}Authentication failed`, statusCode, ErrorCode.AUTH, error);
                    break;
                case 404:
                    apiError = new ApiError(`${prefix}Resource not found`, statusCode, ErrorCode.NOT_FOUND, error);
                    break;
                case 422:
                    apiError = new ApiError(`${prefix}Validation error`, statusCode, ErrorCode.VALIDATION, error);
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    apiError = new ApiError(`${prefix}Server error occurred`, statusCode, ErrorCode.SERVER, error);
                    break;
                default:
                    apiError = new ApiError(`${prefix}Request failed`, statusCode, ErrorCode.UNKNOWN, error);
            }
        }

        console.error(apiError.message, {
            url: error.config?.url,
            method: error.config?.method,
            statusCode,
            data: error.response?.data,
        });

        throw apiError;
    }

    // Handle non-Axios errors
    const apiError = new ApiError(`${prefix}An unexpected error occurred`, undefined, ErrorCode.UNKNOWN, error);

    console.error(apiError.message, { error });
    throw apiError;
};

// Type guard for checking if an error is an ApiError
export const isApiError = (error: unknown): error is ApiError => {
    return error instanceof ApiError;
};
