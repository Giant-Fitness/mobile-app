import {
  groupProgramDaysIntoWeeks,
  groupWeeksIntoMonths,
  getWeekNumber,
  getDayOfWeek,
  getNextDayIds,
} from '../calendar';
import { ProgramDay } from '@/types';

describe('calendar utilities', () => {
  describe('getWeekNumber', () => {
    it('should calculate week number correctly', () => {
      expect(getWeekNumber(1)).toBe(1);
      expect(getWeekNumber(7)).toBe(1);
      expect(getWeekNumber(8)).toBe(2);
      expect(getWeekNumber(14)).toBe(2);
      expect(getWeekNumber(15)).toBe(3);
      expect(getWeekNumber(40)).toBe(6);
    });

    it('should return 0 for invalid dayId', () => {
      expect(getWeekNumber(0)).toBe(0);
      expect(getWeekNumber(-1)).toBe(0);
    });
  });

  describe('getDayOfWeek', () => {
    it('should calculate day of week correctly', () => {
      expect(getDayOfWeek(1)).toBe(1); // Monday
      expect(getDayOfWeek(7)).toBe(7); // Sunday
      expect(getDayOfWeek(8)).toBe(1); // Monday
      expect(getDayOfWeek(14)).toBe(7); // Sunday
      expect(getDayOfWeek(15)).toBe(1); // Monday
    });

    it('should return 0 for invalid dayId', () => {
      expect(getDayOfWeek(0)).toBe(0);
      expect(getDayOfWeek(-1)).toBe(0);
    });
  });

  describe('getNextDayIds', () => {
    it('should return correct next day IDs', () => {
      expect(getNextDayIds('1', 30, 5)).toEqual(['2', '3', '4', '5', '6']);
      expect(getNextDayIds('10', 30, 3)).toEqual(['11', '12', '13']);
    });

    it('should not exceed total program days', () => {
      expect(getNextDayIds('28', 30, 5)).toEqual(['29', '30']);
      expect(getNextDayIds('30', 30, 5)).toEqual([]);
    });

    it('should handle edge cases', () => {
      expect(getNextDayIds('1', 5, 10)).toEqual(['2', '3', '4', '5']);
      expect(getNextDayIds('5', 5, 1)).toEqual([]);
    });
  });

  describe('groupProgramDaysIntoWeeks', () => {
    it('should group program days into weeks correctly', () => {
      const programDays: { [key: string]: ProgramDay } = {
        '1': { DayId: '1' } as ProgramDay,
        '2': { DayId: '2' } as ProgramDay,
        '7': { DayId: '7' } as ProgramDay,
        '8': { DayId: '8' } as ProgramDay,
      };

      const weeks = groupProgramDaysIntoWeeks(programDays);
      expect(weeks).toHaveLength(2);
      expect(weeks[0][0]?.DayId).toBe('1');
      expect(weeks[0][1]?.DayId).toBe('2');
      expect(weeks[0][6]?.DayId).toBe('7');
      expect(weeks[1][0]?.DayId).toBe('8');
    });

    it('should handle empty program days', () => {
      const weeks = groupProgramDaysIntoWeeks({});
      expect(weeks).toEqual([]);
    });

    it('should fill missing days with null', () => {
      const programDays: { [key: string]: ProgramDay } = {
        '1': { DayId: '1' } as ProgramDay,
        '7': { DayId: '7' } as ProgramDay,
      };

      const weeks = groupProgramDaysIntoWeeks(programDays);
      expect(weeks[0]).toHaveLength(7);
      expect(weeks[0][0]?.DayId).toBe('1');
      expect(weeks[0][1]).toBeNull();
      expect(weeks[0][6]?.DayId).toBe('7');
    });

    it('should sort weeks in ascending order', () => {
      const programDays: { [key: string]: ProgramDay } = {
        '15': { DayId: '15' } as ProgramDay,
        '8': { DayId: '8' } as ProgramDay,
        '1': { DayId: '1' } as ProgramDay,
      };

      const weeks = groupProgramDaysIntoWeeks(programDays);
      expect(weeks).toHaveLength(3);
      expect(weeks[0][0]?.DayId).toBe('1');
      expect(weeks[1][0]?.DayId).toBe('8');
      expect(weeks[2][0]?.DayId).toBe('15');
    });
  });

  describe('groupWeeksIntoMonths', () => {
    it('should group weeks into months (4 weeks per month)', () => {
      const weeks: (ProgramDay | null)[][] = [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
      ];

      const months = groupWeeksIntoMonths(weeks);
      expect(months).toHaveLength(2);
      expect(months[0]).toHaveLength(4);
      expect(months[1]).toHaveLength(2);
    });

    it('should handle empty weeks array', () => {
      const months = groupWeeksIntoMonths([]);
      expect(months).toEqual([]);
    });

    it('should handle less than 4 weeks', () => {
      const weeks: (ProgramDay | null)[][] = [
        [null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null],
      ];

      const months = groupWeeksIntoMonths(weeks);
      expect(months).toHaveLength(1);
      expect(months[0]).toHaveLength(2);
    });
  });
});
