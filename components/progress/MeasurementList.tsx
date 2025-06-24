// components/progress/MeasurementList.tsx

import { Spaces } from '@/constants/Spaces';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

interface MeasurementListProps {
    data: any[];
    renderTile: (item: any) => React.ReactNode;
}

export const MeasurementList: React.FC<MeasurementListProps> = ({ data, renderTile }) => {
    return (
        <ScrollView style={styles.container}>
            {data.map((item, index) => (
                <View key={index} style={styles.tileContainer}>
                    {renderTile(item)}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spaces.MD,
    },
    tileContainer: {
        marginBottom: Spaces.SM,
    },
});
