// app/(app)/onboarding/biodata/step-3-height.tsx

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

type UnitType = 'inches' | 'cms';

export default function HeightStepScreen() {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];
    const scrollY = useSharedValue(0);
    const params = useLocalSearchParams();

    const unitOptions = [
        { key: 'inches', label: 'ft' },
        { key: 'cms', label: 'cm' },
    ];

    const [selectedUnit, setSelectedUnit] = useState<UnitType>('inches');
    const [totalInches, setTotalInches] = useState(67); // 5'7" default
    const [centimeters, setCentimeters] = useState(173);

    // Generate options based on unit type
    const getPickerOptions = () => {
        if (selectedUnit === 'inches') {
            const options = [];
            for (let feet = 3; feet <= 8; feet++) {
                for (let inches = 0; inches <= 11; inches++) {
                    const totalInches = feet * 12 + inches;
                    options.push({ value: totalInches, label: `${feet} ft ${inches} in` });
                }
            }
            return options;
        } else {
            return Array.from({ length: 161 }, (_, i) => ({
                value: i + 90,
                label: `${i + 90} cm`,
            }));
        }
    };

    const pickerOptions = getPickerOptions();
    const currentValue = selectedUnit === 'inches' ? totalInches : centimeters;

    // Initialize from params
    useEffect(() => {
        if (params.height && params.heightUnit) {
            const unit = params.heightUnit as UnitType;
            setSelectedUnit(unit);

            if (unit === 'inches' && params.heightFeet && params.heightInches) {
                const feet = Number(params.heightFeet);
                const inches = Number(params.heightInches);
                setTotalInches(feet * 12 + inches);
            } else if (unit === 'cms') {
                setCentimeters(Number(params.height));
            }
        }
    }, [params]);

    const handleUnitChange = (unit: string) => {
        const newUnit = unit as UnitType;
        if (newUnit === selectedUnit) return;

        if (newUnit === 'cms') {
            setCentimeters(Math.round(totalInches * 2.54));
        } else {
            setTotalInches(Math.round(centimeters / 2.54));
        }
        setSelectedUnit(newUnit);
    };

    const handleValueChange = (value: number) => {
        if (selectedUnit === 'inches') {
            setTotalInches(value);
        } else {
            setCentimeters(value);
        }
    };

    const handleNext = () => {
        const feet = Math.floor((selectedUnit === 'inches' ? totalInches : centimeters / 2.54) / 12);
        const inches = Math.floor((selectedUnit === 'inches' ? totalInches : centimeters / 2.54) % 12);
        const heightInCm = selectedUnit === 'inches' ? totalInches * 2.54 : centimeters;

        router.push({
            pathname: '/(app)/onboarding/biodata/step-4-weight',
            params: {
                ...(params as Record<string, string>),
                heightUnit: selectedUnit,
                Height: heightInCm.toString(),
                heightFeet: feet.toString(),
                heightInches: inches.toString(),
            },
        });
    };

    return (
        <ThemedView style={styles.container}>
            <SectionProgressHeader
                sectionName='Basic Info'
                currentStep={3}
                totalSteps={5}
                onBackPress={() => router.back()}
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
            />

            <ThemedView style={styles.content}>
                <ThemedText type='titleLarge' style={styles.question}>
                    What is your height?
                </ThemedText>

                <View style={styles.unitToggleContainer}>
                    <ToggleButtonGroup options={unitOptions} selectedKey={selectedUnit} onSelect={handleUnitChange} containerStyle={styles.unitToggle} />
                </View>

                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={currentValue}
                        style={[styles.picker, { color: themeColors.text }]}
                        onValueChange={handleValueChange}
                        itemStyle={[{ color: themeColors.text }]}
                    >
                        {pickerOptions.map((option) => (
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
