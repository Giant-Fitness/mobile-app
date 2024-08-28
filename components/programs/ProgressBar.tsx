import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const ProgressBar = ({ parts = 11, highlightedParts = 0, barColor = '#1c691e', backgroundColor = '#ecf0f1' }) => {
    const screenWidth = Dimensions.get('window').width;
    const partWidth = Math.ceil(screenWidth / parts);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            {Array.from({ length: parts }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.part,
                        {
                            width: partWidth,
                            backgroundColor: index < highlightedParts ? barColor : backgroundColor,
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 3,
    },
    part: {
        height: '100%',
        marginHorizontal: 1,
    },
});

export default ProgressBar;
