// app/settings/settings.tsx

import React from 'react';
import { ThemedView } from '@/components/base/ThemedView';
import { useNavigation } from '@react-navigation/native';
import { AnimatedHeader } from '@/components/layout/AnimatedHeader';
import { useSharedValue } from 'react-native-reanimated';

export default function ProgressScreen() {
    const navigation = useNavigation();
    const scrollY = useSharedValue(0);

    React.useEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    return (
        <ThemedView>
            <AnimatedHeader scrollY={scrollY} disableColorChange={true} title='Settings' />
        </ThemedView>
    );
}
