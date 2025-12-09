import {
  kgToPounds,
  poundsToKg,
  formatWeightForDisplay,
  parseWeightForStorage,
  cmToInches,
  inchesToCm,
  formatMeasurementForDisplay,
  parseMeasurementForStorage,
} from '../unitConversion';

describe('unitConversion', () => {
  describe('kgToPounds', () => {
    it('should convert kilograms to pounds correctly', () => {
      expect(kgToPounds(100)).toBe(220.5);
      expect(kgToPounds(0)).toBe(0);
      expect(kgToPounds(1)).toBe(2.2);
    });

    it('should round to 1 decimal place', () => {
      expect(kgToPounds(50.555)).toBe(111.5);
      expect(kgToPounds(75.123)).toBe(165.6);
    });

    it('should handle negative values', () => {
      expect(kgToPounds(-10)).toBe(-22);
    });
  });

  describe('poundsToKg', () => {
    it('should convert pounds to kilograms correctly', () => {
      expect(poundsToKg(220.5)).toBeCloseTo(100, 0);
      expect(poundsToKg(0)).toBe(0);
      expect(poundsToKg(2.2)).toBeCloseTo(1, 0);
    });

    it('should round to 2 decimal places', () => {
      expect(poundsToKg(165.347)).toBeCloseTo(75, 1);
    });

    it('should handle negative values', () => {
      expect(poundsToKg(-22)).toBeCloseTo(-10, 1);
    });
  });

  describe('formatWeightForDisplay', () => {
    it('should format weight in kg correctly', () => {
      expect(formatWeightForDisplay(100, 'kgs')).toBe('100 kg');
      expect(formatWeightForDisplay(75.5, 'kgs')).toBe('75.5 kg');
    });

    it('should format weight in lbs correctly', () => {
      expect(formatWeightForDisplay(100, 'lbs')).toBe('220.5 lbs');
      expect(formatWeightForDisplay(50, 'lbs')).toBe('110.2 lbs');
    });

    it('should not show unnecessary decimal places', () => {
      expect(formatWeightForDisplay(100, 'kgs')).toBe('100 kg');
      expect(formatWeightForDisplay(100.0, 'kgs')).toBe('100 kg');
    });
  });

  describe('parseWeightForStorage', () => {
    it('should parse weight in kg correctly', () => {
      expect(parseWeightForStorage(100, 'kgs')).toBe(100);
      expect(parseWeightForStorage('75.5', 'kgs')).toBe(75.5);
      expect(parseWeightForStorage('75.555', 'kgs')).toBe(75.56);
    });

    it('should parse and convert weight in lbs correctly', () => {
      expect(parseWeightForStorage(220.5, 'lbs')).toBeCloseTo(100, 0);
      expect(parseWeightForStorage('220.5', 'lbs')).toBeCloseTo(100, 0);
    });

    it('should return 0 for invalid input', () => {
      expect(parseWeightForStorage('invalid', 'kgs')).toBe(0);
      expect(parseWeightForStorage('NaN', 'lbs')).toBe(0);
    });

    it('should handle string and number inputs', () => {
      expect(parseWeightForStorage('100', 'kgs')).toBe(100);
      expect(parseWeightForStorage(100, 'kgs')).toBe(100);
    });
  });

  describe('cmToInches', () => {
    it('should convert centimeters to inches correctly', () => {
      expect(cmToInches(100)).toBe(39.4);
      expect(cmToInches(0)).toBe(0);
      expect(cmToInches(10)).toBe(3.9);
    });

    it('should round to 1 decimal place', () => {
      expect(cmToInches(50.123)).toBe(19.7);
    });

    it('should handle negative values', () => {
      expect(cmToInches(-100)).toBe(-39.4);
    });
  });

  describe('inchesToCm', () => {
    it('should convert inches to centimeters correctly', () => {
      expect(inchesToCm(39.4)).toBeCloseTo(100, 0);
      expect(inchesToCm(0)).toBe(0);
      expect(inchesToCm(3.9)).toBeCloseTo(10, 0);
    });

    it('should round to 1 decimal place', () => {
      expect(inchesToCm(20.456)).toBeCloseTo(51.9, 0);
    });

    it('should handle negative values', () => {
      expect(inchesToCm(-39.4)).toBeCloseTo(-100, 0);
    });
  });

  describe('formatMeasurementForDisplay', () => {
    it('should format measurement in cm correctly', () => {
      expect(formatMeasurementForDisplay(100, 'cms')).toBe('100 cm');
      expect(formatMeasurementForDisplay(75.5, 'cms')).toBe('75.5 cm');
    });

    it('should format measurement in inches correctly', () => {
      expect(formatMeasurementForDisplay(100, 'inches')).toBe('39.4 in');
      expect(formatMeasurementForDisplay(50, 'inches')).toBe('19.7 in');
    });

    it('should not show unnecessary decimal places', () => {
      expect(formatMeasurementForDisplay(100, 'cms')).toBe('100 cm');
      expect(formatMeasurementForDisplay(100.0, 'cms')).toBe('100 cm');
    });
  });

  describe('parseMeasurementForStorage', () => {
    it('should parse measurement in cm correctly', () => {
      expect(parseMeasurementForStorage(100, 'cms')).toBe(100);
      expect(parseMeasurementForStorage('75.5', 'cms')).toBe(75.5);
      expect(parseMeasurementForStorage('75.55', 'cms')).toBe(75.6);
    });

    it('should parse and convert measurement in inches correctly', () => {
      expect(parseMeasurementForStorage(39.4, 'inches')).toBeCloseTo(100, 0);
      expect(parseMeasurementForStorage('39.4', 'inches')).toBeCloseTo(100, 0);
    });

    it('should return 0 for invalid input', () => {
      expect(parseMeasurementForStorage('invalid', 'cms')).toBe(0);
      expect(parseMeasurementForStorage('NaN', 'inches')).toBe(0);
    });

    it('should handle string and number inputs', () => {
      expect(parseMeasurementForStorage('100', 'cms')).toBe(100);
      expect(parseMeasurementForStorage(100, 'cms')).toBe(100);
    });
  });
});
