// utils/unitConversion.ts

// Constants for conversion
const KG_TO_LBS_RATIO = 2.20462262185;
const CM_TO_INCHES_RATIO = 0.393701;

/**
 * Converts kilograms to pounds with precision handling
 * @param weightKg - Weight in kilograms
 * @returns Weight in pounds, rounded to 1 decimal place
 */
export function kgToPounds(weightKg: number): number {
    // Convert exactly, then round to 1 decimal
    return Math.round(weightKg * KG_TO_LBS_RATIO * 10) / 10;
}

/**
 * Converts pounds to kilograms with precision handling
 * @param weightLbs - Weight in pounds
 * @returns Weight in kilograms, stored with 2 decimal places
 */
export function poundsToKg(weightLbs: number): number {
    // Convert exactly, then round to 2 decimals for storage
    return Math.round((weightLbs / KG_TO_LBS_RATIO) * 100) / 100;
}

/**
 * Helper function to format numbers without unnecessary decimal places
 * @param num - Number to format
 * @param maxDecimals - Maximum decimal places to show
 * @returns Formatted string without trailing zeros
 */
function formatNumberClean(num: number, maxDecimals: number): string {
    // Check if it's a whole number
    if (num % 1 === 0) {
        return num.toString();
    }

    // Format with max decimals and remove trailing zeros
    const formatted = num.toFixed(maxDecimals);
    return formatted.replace(/\.?0+$/, '');
}

/**
 * Formats weight for display based on user preference
 * @param weightKg - Weight in kilograms (as stored in backend)
 * @param unit - User's preferred unit ('kgs' or 'lbs')
 * @returns Formatted weight string with appropriate decimal places (no unnecessary decimals)
 */
export function formatWeightForDisplay(weightKg: number, unit: 'kgs' | 'lbs'): string {
    if (unit === 'lbs') {
        const lbs = kgToPounds(weightKg);
        return `${formatNumberClean(lbs, 1)} lbs`;
    }
    return `${formatNumberClean(weightKg, 1)} kg`;
}

/**
 * Parses user input weight and converts to kg for storage
 * @param weight - Weight value from user input
 * @param unit - User's current unit ('kgs' or 'lbs')
 * @returns Weight in kilograms for storage
 */
export function parseWeightForStorage(weight: string | number, unit: 'kgs' | 'lbs'): number {
    const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;
    if (isNaN(numWeight)) return 0;

    if (unit === 'lbs') {
        return poundsToKg(numWeight);
    }
    return Math.round(numWeight * 100) / 100; // Store kg with 2 decimal precision
}

/**
 * Converts centimeters to inches with precision handling
 * @param lengthCm - Length in centimeters
 * @returns Length in inches, rounded to 1 decimal place
 */
export function cmToInches(lengthCm: number): number {
    // Convert exactly, then round to 1 decimal
    return Math.round(lengthCm * CM_TO_INCHES_RATIO * 10) / 10;
}

/**
 * Converts inches to centimeters with precision handling
 * @param lengthInches - Length in inches
 * @returns Length in centimeters, stored with 1 decimal place
 */
export function inchesToCm(lengthInches: number): number {
    // Convert exactly, then round to 1 decimal for storage
    return Math.round((lengthInches / CM_TO_INCHES_RATIO) * 10) / 10;
}

/**
 * Formats body measurement for display based on user preference
 * @param measurementCm - Measurement in centimeters (as stored in backend)
 * @param unit - User's preferred unit ('cms' or 'inches')
 * @returns Formatted measurement string with appropriate decimal places (no unnecessary decimals)
 */
export function formatMeasurementForDisplay(measurementCm: number, unit: 'cms' | 'inches'): string {
    if (unit === 'inches') {
        const inches = cmToInches(measurementCm);
        return `${formatNumberClean(inches, 1)} in`;
    }
    return `${formatNumberClean(measurementCm, 1)} cm`;
}

/**
 * Parses user input measurement and converts to cm for storage
 * @param measurement - Measurement value from user input
 * @param unit - User's current unit ('cms' or 'inches')
 * @returns Measurement in centimeters for storage
 */
export function parseMeasurementForStorage(measurement: string | number, unit: 'cms' | 'inches'): number {
    const numMeasurement = typeof measurement === 'string' ? parseFloat(measurement) : measurement;
    if (isNaN(numMeasurement)) return 0;

    if (unit === 'inches') {
        return inchesToCm(numMeasurement);
    }
    return Math.round(numMeasurement * 10) / 10; // Store cm with 1 decimal precision
}
