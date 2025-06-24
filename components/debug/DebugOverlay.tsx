// components/debug/DebugOverlay.tsx
import { ThemedText } from '@/components/base/ThemedText';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DebugItem {
    label: string;
    value: any;
}

interface DebugOverlayProps {
    items: DebugItem[];
}

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ items }) => {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <>
            <TouchableOpacity style={styles.debugTrigger} onPress={() => setIsVisible(!isVisible)}>
                <View style={styles.debugDot} />
            </TouchableOpacity>

            {isVisible && (
                <ScrollView style={styles.debugContainer} contentContainerStyle={styles.debugContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
                        <ThemedText style={styles.closeText}>Close Debug</ThemedText>
                    </TouchableOpacity>
                    {items.map((item, index) => (
                        <View key={index} style={styles.debugRow}>
                            <ThemedText style={styles.debugLabel}>{item.label}:</ThemedText>
                            <ThemedText style={styles.debugValue}>
                                {typeof item.value === 'object' ? JSON.stringify(item.value, null, 2) : String(item.value)}
                            </ThemedText>
                        </View>
                    ))}
                </ScrollView>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    debugTrigger: {
        position: 'absolute',
        top: 550,
        right: 30,
        zIndex: 9999,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    debugDot: {
        width: 30,
        height: 30,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
    },
    debugContainer: {
        position: 'absolute',
        top: 80,
        left: 10,
        right: 10,
        maxHeight: 400,
        backgroundColor: 'rgba(0,0,0,0.9)',
        borderRadius: 10,
        zIndex: 9999,
    },
    debugContent: {
        padding: 10,
    },
    closeButton: {
        alignItems: 'center',
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.3)',
        marginBottom: 10,
    },
    closeText: {
        color: '#fff',
        fontSize: 12,
    },
    debugRow: {
        marginBottom: 5,
    },
    debugLabel: {
        color: '#FFA500',
        fontWeight: 'bold',
        fontSize: 12,
    },
    debugValue: {
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'monospace',
    },
});
