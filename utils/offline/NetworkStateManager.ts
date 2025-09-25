// utils/offline/NetworkStateManager.ts

import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface NetworkState {
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string;
    details: any;
}

export interface NetworkStateCallback {
    (state: NetworkState): void;
}

export interface NetworkReconnectCallback {
    (): void;
}

export class NetworkStateManager {
    private static instance: NetworkStateManager;
    private subscription: NetInfoSubscription | null = null;
    private currentState: NetworkState | null = null;
    private stateChangeCallbacks: Set<NetworkStateCallback> = new Set();
    private reconnectCallbacks: Set<NetworkReconnectCallback> = new Set();
    private wasOffline = false;
    private isInitialized = false;

    public static getInstance(): NetworkStateManager {
        if (!NetworkStateManager.instance) {
            NetworkStateManager.instance = new NetworkStateManager();
        }
        return NetworkStateManager.instance;
    }

    /**
     * Initialize network monitoring
     * Should be called once during app startup
     */
    public async initialize(): Promise<void> {
        if (this.isInitialized) {
            console.warn('NetworkStateManager already initialized');
            return;
        }

        try {
            // Get initial network state
            const initialState = await NetInfo.fetch();
            this.currentState = this.transformNetInfoState(initialState);
            this.wasOffline = !this.isOnline();

            // Start monitoring network changes
            this.subscription = NetInfo.addEventListener((state: NetInfoState) => {
                this.handleNetworkStateChange(state);
            });

            this.isInitialized = true;
            console.log('NetworkStateManager initialized:', this.currentState);
        } catch (error) {
            console.error('Failed to initialize NetworkStateManager:', error);
            throw new Error('Network monitoring initialization failed');
        }
    }

    /**
     * Clean up network monitoring
     */
    public cleanup(): void {
        if (this.subscription) {
            this.subscription();
            this.subscription = null;
        }
        this.stateChangeCallbacks.clear();
        this.reconnectCallbacks.clear();
        this.isInitialized = false;
        console.log('NetworkStateManager cleaned up');
    }

    /**
     * Check if device is currently online
     * In development, be more lenient with internet reachability
     */
    public isOnline(): boolean {
        if (!this.currentState) {
            return false;
        }

        // In development, only require connection, not internet reachability
        if (__DEV__) {
            // Only require connection in dev mode
            return this.currentState.isConnected;
        }

        // Production: require both connection and internet reachability
        return this.currentState.isConnected && this.currentState.isInternetReachable;
    }

    /**
     * Get current network state
     */
    public getCurrentState(): NetworkState | null {
        return this.currentState;
    }

    /**
     * Add callback for network state changes
     */
    public onStateChange(callback: NetworkStateCallback): () => void {
        this.stateChangeCallbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.stateChangeCallbacks.delete(callback);
        };
    }

    /**
     * Add callback for network reconnection events
     * Called when device goes from offline to online
     */
    public onReconnect(callback: NetworkReconnectCallback): () => void {
        this.reconnectCallbacks.add(callback);

        // Return unsubscribe function
        return () => {
            this.reconnectCallbacks.delete(callback);
        };
    }

    /**
     * Wait for network connection
     * Resolves immediately if already online, otherwise waits for reconnection
     */
    public async waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
        if (this.isOnline()) {
            return true;
        }

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                unsubscribe();
                resolve(false);
            }, timeoutMs);

            const unsubscribe = this.onReconnect(() => {
                clearTimeout(timeout);
                unsubscribe();
                resolve(true);
            });
        });
    }

    /**
     * Force refresh network state
     * Useful for manual sync triggers
     */
    public async refreshNetworkState(): Promise<NetworkState> {
        try {
            const freshState = await NetInfo.fetch();
            const transformedState = this.transformNetInfoState(freshState);

            // Update current state and trigger callbacks if changed
            const previouslyOnline = this.isOnline();
            this.currentState = transformedState;

            // Trigger callbacks
            this.notifyStateChangeCallbacks();

            // Check for reconnection
            const nowOnline = this.isOnline();
            if (!previouslyOnline && nowOnline) {
                this.notifyReconnectCallbacks();
            }

            return transformedState;
        } catch (error) {
            console.error('Failed to refresh network state:', error);
            throw error;
        }
    }

    /**
     * Get network type (wifi, cellular, etc.)
     */
    public getNetworkType(): string {
        return this.currentState?.type || 'unknown';
    }

    /**
     * Check if on expensive connection (cellular vs wifi)
     */
    public isExpensiveConnection(): boolean {
        const type = this.getNetworkType().toLowerCase();
        return type === 'cellular' || type === 'mobile';
    }

    private handleNetworkStateChange(netInfoState: NetInfoState): void {
        const newState = this.transformNetInfoState(netInfoState);
        const previouslyOnline = this.isOnline();

        this.currentState = newState;

        // Notify state change callbacks
        this.notifyStateChangeCallbacks();

        const nowOnline = this.isOnline();

        // Track offline/online transitions
        if (previouslyOnline && !nowOnline) {
            this.wasOffline = true;
            console.log('Network went offline');
        } else if (!previouslyOnline && nowOnline && this.wasOffline) {
            this.wasOffline = false;
            console.log('Network reconnected');
            this.notifyReconnectCallbacks();
        }
    }

    private transformNetInfoState(netInfoState: NetInfoState): NetworkState {
        return {
            isConnected: netInfoState.isConnected ?? false,
            isInternetReachable: netInfoState.isInternetReachable ?? false,
            type: netInfoState.type || 'unknown',
            details: netInfoState.details,
        };
    }

    private notifyStateChangeCallbacks(): void {
        if (!this.currentState) return;

        this.stateChangeCallbacks.forEach((callback) => {
            try {
                callback(this.currentState!);
            } catch (error) {
                console.error('Error in network state change callback:', error);
            }
        });
    }

    private notifyReconnectCallbacks(): void {
        this.reconnectCallbacks.forEach((callback) => {
            try {
                callback();
            } catch (error) {
                console.error('Error in network reconnect callback:', error);
            }
        });
    }
}

// Export singleton instance for convenience
export const networkStateManager = NetworkStateManager.getInstance();
