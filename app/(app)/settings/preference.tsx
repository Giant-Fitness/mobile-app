import React, {useState} from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useSharedValue } from 'react-native-reanimated';
import { ThemedView } from '@/components/base/ThemedView';
import { ThemedText } from '@/components/base/ThemedText';
import { Colors } from '@/constants/Colors';
import { Spaces } from '@/constants/Spaces';
import { Sizes } from '@/constants/Sizes';
import { RootState } from '@/store/store';
import { setBodyWeightPreference, setLiftWeightPreference } from '@/store/settings/settingsSlice';
import { AnimatedHeader } from '@/components/navigation/AnimatedHeader';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

const UnitsSelectionScreen = () => {
    const dispatch = useDispatch();
    const bodyWeightPreference = useSelector((state: RootState) => state.settings.bodyWeightPreference);
    const liftWeightPreference = useSelector((state: RootState) => state.settings.liftWeightPreference);
    const [tempLiftWeightPreference, setTempLiftWeightPreference] = useState(liftWeightPreference);
    const [tempBodyWeightPreference, setTempBodyWeightPreference] = useState(bodyWeightPreference);

    const scrollY = useSharedValue(0);
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const themeColors = Colors[colorScheme];

    const toggleBodyWeightPreference = () => {
        const newPreference = tempBodyWeightPreference === 'kg' ? 'pounds' : 'kg';
        setTempBodyWeightPreference(newPreference);
    };

    const toggleLiftWeightPreference = () => {
        const newPreference = tempLiftWeightPreference === 'kg' ? 'pounds' : 'kg';
        setTempLiftWeightPreference(newPreference);
   };

    const toPressSave = () => {
        if(bodyWeightPreference !== tempBodyWeightPreference){
            dispatch(setBodyWeightPreference(tempBodyWeightPreference))
            console.log("body weight preference changed")
        }
        if(liftWeightPreference !== tempLiftWeightPreference){
            dispatch(setLiftWeightPreference(tempLiftWeightPreference))
            console.log("lift weight preference changed")

        }

        router.navigate('/(app)/settings');
    }

    const dynamicStyles = StyleSheet.create({
        option: {
            flex: 1,
            paddingVertical: Spaces.MD,
            marginHorizontal: Spaces.XS,
            borderWidth: 1,
            borderRadius: Spaces.XL,
            borderColor: themeColors.text, // Default border color
            backgroundColor: 'transparent', // Non-selected background color
            alignItems: 'center',
        },
        optionSelected: {
            backgroundColor: themeColors.iconSelected, 
            borderColor: themeColors.text, 
        },
        optionText: {
            fontSize: 16,
            color: themeColors.text, 
        },
        optionTextSelected: {
            color: themeColors.background, 
            fontWeight: '600',
        },
        saveButton: {
            position: 'absolute',
            bottom: 15,
            left: 0,
            right: 0,
            marginHorizontal: Spaces.LG, 
            paddingVertical: Spaces.MD,
            borderRadius: Spaces.XL,
            backgroundColor: themeColors.iconSelected,
            alignItems: 'center',
            justifyContent: 'center', 
        },
        
        saveButtonText: {
            fontSize: 16,
            color: themeColors.background,
            fontWeight: '600',
        },
    });

    return (
        <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <AnimatedHeader
                scrollY={scrollY}
                disableColorChange={true}
                headerBackground={themeColors.background}
                title="Select Units"
            />
            <ThemedView style={styles.content}>
                {/* Lift Weight Section */}
                <View style={styles.section}>
                    <ThemedText type="titleMedium" style={styles.sectionTitle}>
                        Lift Weight
                    </ThemedText>
                    <View style={styles.options}>
                        <TouchableOpacity
                            style={[
                                dynamicStyles.option,
                                tempLiftWeightPreference === 'kg' && dynamicStyles.optionSelected,
                            ]}
                            onPress={() => {
                                if (tempLiftWeightPreference !== 'kg') toggleLiftWeightPreference();
                            }}
                        >
                            <ThemedText
                                type="body"
                                style={[
                                    dynamicStyles.optionText,
                                    tempLiftWeightPreference === 'kg' && dynamicStyles.optionTextSelected,
                                ]}
                            >
                                kg
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                dynamicStyles.option,
                                tempLiftWeightPreference === 'pounds' && dynamicStyles.optionSelected,
                            ]}
                            onPress={() => {
                                if (tempLiftWeightPreference !== 'pounds') toggleLiftWeightPreference();
                            }}
                        >
                            <ThemedText
                                type="body"
                                style={[
                                    dynamicStyles.optionText,
                                    tempLiftWeightPreference === 'pounds' && dynamicStyles.optionTextSelected,
                                ]}
                            >
                                lbs
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Body Weight Section */}
                <View style={styles.section}>
                    <ThemedText type="titleMedium" style={styles.sectionTitle}>
                        Body Weight
                    </ThemedText>
                    <View style={styles.options}>
                        <TouchableOpacity
                            style={[
                                dynamicStyles.option,
                                tempBodyWeightPreference === 'kg' && dynamicStyles.optionSelected,
                            ]}
                            onPress={() => {
                                if (tempBodyWeightPreference !== 'kg') toggleBodyWeightPreference();
                            }}
                        >
                            <ThemedText
                                type="body"
                                style={[
                                    dynamicStyles.optionText,
                                    tempBodyWeightPreference === 'kg' && dynamicStyles.optionTextSelected,
                                ]}
                            >
                                kg
                            </ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                dynamicStyles.option,
                                tempBodyWeightPreference === 'pounds' && dynamicStyles.optionSelected,
                            ]}
                            onPress={() => {
                                if (tempBodyWeightPreference !== 'pounds') toggleBodyWeightPreference();
                            }}
                        >
                            <ThemedText
                                type="body"
                                style={[
                                    dynamicStyles.optionText,
                                    tempBodyWeightPreference === 'pounds' && dynamicStyles.optionTextSelected,
                                ]}
                            >
                                lbs
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity style={dynamicStyles.saveButton} onPress={toPressSave}>
                    <ThemedText style={dynamicStyles.saveButtonText}>Save</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Sizes.headerHeight,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spaces.MD,
    },
    section: {
        marginBottom: Spaces.LG,
    },
    sectionTitle: {
        marginBottom: Spaces.SM,
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});

export default UnitsSelectionScreen;
