import { ProgramDay } from '@/types';

/**
 * Groups program days into weeks (arrays of ProgramDay)
 * @param programDays - Object of ProgramDay objects with DayId as keys
 * @returns Array of weeks, each week is an array of ProgramDay
 */
export const groupProgramDaysIntoWeeks = (programDays: { [key: string]: ProgramDay }): (ProgramDay | null)[][] => {
    const weeks: { [key: number]: (ProgramDay | null)[] } = {};

    Object.values(programDays).forEach((day) => {
        if (day.DayId) {
            const dayId = parseInt(day.DayId);
            const weekNumber = getWeekNumber(dayId);
            const dayOfWeek = getDayOfWeek(dayId) - 1; // zero-based index

            if (!weeks[weekNumber]) {
                weeks[weekNumber] = Array(7).fill(null);
            }
            weeks[weekNumber][dayOfWeek] = day;
        }
    });

    // Convert weeks object to array sorted by week number
    const sortedWeeks = Object.keys(weeks)
        .sort((a, b) => parseInt(a) - parseInt(b))
        .map((weekNumber) => weeks[parseInt(weekNumber)]);

    return sortedWeeks;
};

/**
 * Groups weeks into months (4 weeks per month)
 * @param weeks - Array of weeks, each week is an array of ProgramDay
 * @returns Array of months, each month is an array of weeks
 */
export const groupWeeksIntoMonths = (weeks: (ProgramDay | null)[][]): (ProgramDay | null)[][][] => {
    const groupedMonths: (ProgramDay | null)[][][] = [];
    for (let i = 0; i < weeks.length; i += 4) {
        groupedMonths.push(weeks.slice(i, i + 4));
    }
    return groupedMonths;
};

/**
 * Calculates the current week number based on the day ID
 * @param dayId - The current day ID (e.g., 40).
 * @returns The week number.
 */
export const getWeekNumber = (dayId: number): number => {
    if (dayId < 1) return 0; // Invalid dayId
    const weekNumber = Math.ceil(dayId / 7);
    return weekNumber;
};

export const getDayOfWeek = (dayId: number): number => {
    if (dayId < 1) return 0; // Invalid dayId
    let dayOfWeek = dayId % 7;
    if (dayOfWeek === 0) {
        dayOfWeek = 7;
    }
    return dayOfWeek;
};

export const getNextDayIds = (currentDayId: string, totalProgramDays: number, numDays: number): string[] => {
    const currentDayNumber = parseInt(currentDayId, 10);
    const daysToFetch = Math.min(numDays, totalProgramDays - currentDayNumber);
    const dayIds = Array.from({ length: daysToFetch }, (_, index) => (currentDayNumber + index + 1).toString());
    return dayIds;
};
