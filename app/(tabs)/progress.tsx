import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function ProgressScreen() {
    return (
        <ThemedView style={{justifyContent: 'center', alignItems: 'center'}}>
            <ThemedText>progress</ThemedText>
        </ThemedView>
    );
}