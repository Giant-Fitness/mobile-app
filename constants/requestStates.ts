// constants/requestStates.ts

export const REQUEST_STATE = {
    IDLE: 'IDLE',
    PENDING: 'PENDING',
    FULFILLED: 'FULFILLED',
    REJECTED: 'REJECTED',
} as const;

export type REQUEST_STATE = (typeof REQUEST_STATE)[keyof typeof REQUEST_STATE];
