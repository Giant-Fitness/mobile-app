// utils/weightConversion.ts

// Constants for conversion
const KG_TO_LBS_RATIO = 2.20462262185;

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
 * Formats weight for display based on user preference
 * @param weightKg - Weight in kilograms (as stored in backend)
 * @param unit - User's preferred unit ('kgs' or 'lbs')
 * @returns Formatted weight string with appropriate decimal places
 */
export function formatWeightForDisplay(weightKg: number, unit: 'kgs' | 'lbs'): string {
    if (unit === 'lbs') {
        const lbs = kgToPounds(weightKg);
        return `${lbs.toFixed(1)} lbs`;
    }
    return `${weightKg.toFixed(1)} kg`;
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
