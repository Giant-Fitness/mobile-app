// app/(tabs)/index.tsx

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function ProgramsScreen() {
    return (
        <ThemedView style={{justifyContent: 'center', alignItems: 'center'}}>
            <ThemedText>Programs</ThemedText>
        </ThemedView>
    );
}