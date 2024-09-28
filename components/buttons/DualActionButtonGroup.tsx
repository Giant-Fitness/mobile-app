// components/buttons/DualActionButtonGroup.tsx

import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SlideUpActionButton } from '@/components/buttons/SlideUpActionButton';
import { Spaces } from '@/constants/Spaces';

type DualActionButtonGroupProps = {
  scrollY: Animated.Value;
  primaryButton: React.ReactNode;
  secondaryButton: React.ReactNode;
};

export const DualActionButtonGroup: React.FC<DualActionButtonGroupProps> = ({
  scrollY,
  primaryButton,
  secondaryButton
}) => {
  return (
    <SlideUpActionButton scrollY={scrollY}>
      <View style={styles.buttonGroup}>
        <View style={styles.button}>{secondaryButton}</View>
        <View style={styles.button}>{primaryButton}</View>
      </View>
    </SlideUpActionButton>
  );
};

const styles = StyleSheet.type;

export const DualActionButtonGroup: React.FC<DualActionButtonGroupProps> = ({
  scrollY,
  primaryButton,
  secondaryButton
}) => {
  return (
    <SlideUpActionButton scrollY={scrollY}>
      <View style={styles.buttonGroup}>
        <View style={styles.button}>{secondaryButton}</View>
        <View style={styles.button}>{primaryButton}</View>
      </View>
    </SlideUpActionButton>
  );
};

const styles = StyleSheet.create({
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: Spaces.XS,
  },
});