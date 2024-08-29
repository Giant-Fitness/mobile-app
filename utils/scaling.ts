// utils/scaling.ts

import { scale as s, verticalScale as vs, moderateScale as ms } from 'react-native-size-matters';

// Define a consistent moderate scaling factor
const DEFAULT_MODERATE_FACTOR = 0.5;

export const scale = (size: number) => s(size); // Use scale directly if needed
export const verticalScale = (size: number) => vs(size); // For vertical adjustments
export const moderateScale = (size: number, factor: number = DEFAULT_MODERATE_FACTOR) => ms(size, factor);
