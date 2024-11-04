// components/progress/MeasurementList.tsx

import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Spaces } from '@/constants/Spaces';

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
