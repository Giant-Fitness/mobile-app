// app/(app)/onboarding/biodata/step-4-weight.tsx

import { ThemedText } from '@/components/base/ThemedText';
import { ThemedView } from '@/components/base/ThemedView';
import { PrimaryButton } from '@/components/buttons/PrimaryButton';
import { ToggleButtonGroup } from '@/components/buttons/ToggleButtonGroup';
import { SectionProgressHeader } from '@/components/navigation/SectionProgressHeader';
import { Colors } from '@/constants/Colors';
import { Sizes } from '@/constants/Sizes';
import { Spaces } from '@/constants/Spaces';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { Picker } from '@react-native-picker/picker';
import { useSharedValue } from 'react-native-reanimated';

type WeightUnitType = 'kgs' | 'lbs';

export default function WeightStepScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const unitOptions = [
        { key: 'kgs', label: 'kgs' },
        { key: 'lbs', label: 'lbs' },
    ];

    const [selectedUnit, setSelectedUnit] = useState<WeightUnitType>('kgs');
    const [weightKg, setWeightKg] = useState(70); // Default 70kg
    const [weightLbs, setWeightLbs] = useState(154); // Default ~154lbs

    // Generate weight options based on unit
    const getWeightOptions = () => {
        if (selectedUnit === 'kgs') {
            return Array.from({ length: 181 }, (_, i) => ({
                value: i + 30,
                label: `${i + 30} kg`,
            })); // 30kg to 210kg
        } else {
            return Array.from({ length: 331 }, (_, i) => ({
                value: i + 70,
                label: `${i + 70} lbs`,
            })); // 70lbs to 400lbs
        }
    };

    const weightOptions = getWeightOptions();
    const currentWeight = selectedUnit === 'kgs' ? weightKg : weightLbs;

    // Initialize from params
    useEffect(() => {
        if (params.Weight && params.weightUnit) {
            const unit = params.weightUnit as WeightUnitType;
            setSelectedUnit(unit);

            if (unit === 'kgs') {
                setWeightKg(Number(params.Weight));
            } else {
                setWeightLbs(Number(params.Weight));
            }
        }
    }, [params]);

    const handleUnitChange = (unit: string) => {
        const newUnit = unit as WeightUnitType;
        if (newUnit === selectedUnit) return;

        if (newUnit === 'lbs') {
            setWeightLbs(Math.round(weightKg * 2.20462));
        } else {
            setWeightKg(Math.round(weightLbs / 2.20462));
        }
        setSelectedUnit(newUnit);
    };

    const handleWeightChange = (weight: number) => {
        if (selectedUnit === 'kgs') {
            setWeightKg(weight);
        } else {
            setWeightLbs(weight);
        }
    };

    const handleNext = () => {
        const weightInKg = selectedUnit === 'kgs' ? weightKg : weightLbs / 2.20462;

        router.push({
            pathname: '/(app)/onboarding/biodata/step-5-activity-level',
            params: {
                ...(params as Record<string, string>),
                weightUnit: selectedUnit,
                Weight: (selectedUnit === 'kgs' ? weightKg : weightLbs).toString(),
                weightKg: weightInKg.toString(),
            },
        });
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Basic Info'
                currentStep={4}
                totalSteps={5}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    What is your weight?
                </ThemedText>

                <View style={styles.unitToggleContainer}>
                    <ToggleButtonGroup options={unitOptions} selectedKey={selectedUnit} onSelect={handleUnitChange} containerStyle={styles.unitToggle} />
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={currentWeight}
                        style={[styles.picker, { color: themeColors.text }]}
                        onValueChange={handleWeightChange}
                        itemStyle={[{ color: themeColors.text }]}
                    >
                        {weightOptions.map((option) => (
                            <Picker.Item key={option.value} label={option.label} value={option.value} />
                        ))}
                    </Picker>
                </View>
            </ThemedView>

            <ThemedView style={styles.buttonContainer}>
                <PrimaryButton text='Next' onPress={handleNext} haptic='impactLight' size='LG' style={styles.continueButton} />
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight + Spaces.XL,
    },
    content: {
        flex: 1,
        padding: Spaces.LG,
        paddingBottom: 0,
    },
    question: {
        marginBottom: Spaces.LG,
        textAlign: 'left',
    },
    unitToggleContainer: {
        marginBottom: Spaces.XL,
        marginHorizontal: Spaces.XL,
    },
    unitToggle: {},
    pickerContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    picker: {
        width: '100%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spaces.LG,
        paddingBottom: Spaces.XXL,
        paddingTop: Spaces.MD,
        backgroundColor: 'transparent',
    },
    continueButton: {
        width: '100%',
    },
});
