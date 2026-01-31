import { TimeScaleConfig } from '../types';
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

/**
 * Calculate the offset in hours between two timezones at a given time
 */
export function getTimezoneOffset(
  timezone1: string,
  timezone2: string,
  date: Date = new Date()
): number {
  const date1 = new Date(
    date.toLocaleString('en-US', { timeZone: timezone1 })
  );
  const date2 = new Date(
    date.toLocaleString('en-US', { timeZone: timezone2 })
  );
  return (date1.getTime() - date2.getTime()) / (1000 * 60 * 60);
}

/**
 * Calculate time scale configuration for a timezone
 * @param timezone The timezone ID
 * @param referenceTimezone The reference timezone (home timezone or first timezone).
 *                          Used as the base for calculating baseTime - all time scale rows
 *                          use the same referenceTimezone to ensure position 0 represents
 *                          the same absolute time across all rows.
 * @param date The date to calculate for
 * @returns TimeScaleConfig with startHour, date markers, and baseTime
 */
export function calculateTimeScaleConfig(
  timezone: string,
  referenceTimezone: string,
  date: Date = new Date()
): TimeScaleConfig {
  /**
   * 核心思想：
   * - 先确定一个共同的基准绝对时间：referenceTimezone 当天 00:00 对应的 UTC 时间（baseTime）
   * - 对于任意一行：
   *   - position p 代表的绝对时间是 baseTime + p 小时
   *   - 该行在该绝对时间下显示的 hour = formatInTimeZone(baseTime + p, timezone, 'H')
   * - 这样既保证了所有行的“同一列”是同一个绝对时间，也能正确算出 0h-cell 的日期
   */

  // 1. 计算 referenceTimezone 当天 00:00 对应的 UTC 时间，作为整条 timescale 的 baseTime
  const refDateStr = formatInTimeZone(date, referenceTimezone, 'yyyy-MM-dd');
  const [refYear, refMonth, refDay] = refDateStr.split('-').map(Number);
  const refLocalMidnight = new Date(refYear, refMonth - 1, refDay, 0, 0, 0);
  const baseTime = zonedTimeToUtc(refLocalMidnight, referenceTimezone);

  // 2. 计算该 timezone 在 baseTime 时刻的 hour，作为 startHour
  const startHour = parseInt(
    formatInTimeZone(baseTime, timezone, 'H'),
    10
  );

  // 3. 计算该行 0h-cell 落在哪个 position：解 (position + startHour) % 24 === 0
  const zeroHourPosition = (24 - (startHour % 24) + 24) % 24;

  // 4. 计算该 0h-cell 对应的绝对时间，并在该 timezone 下格式化日期
  const zeroHourInstant = new Date(
    baseTime.getTime() + zeroHourPosition * 60 * 60 * 1000
  );

  const hour0Date = formatInTimeZone(zeroHourInstant, timezone, 'M/d');

  const dateMarkers: Array<{ hour: number; date: string }> = [
    {
      hour: 0,
      date: hour0Date,
    },
  ];

  return {
    startHour,
    dateMarkers,
    baseTime,
  };
}

/**
 * Get the hour at a specific position in the time scale
 * @param position Position (0-23) in the time scale
 * @param startHour Starting hour of the time scale
 * @returns The actual hour (0-23)
 */
export function getHourAtPosition(position: number, startHour: number): number {
  return (position + startHour) % 24;
}

/**
 * Get the position in time scale for a specific hour
 * @param hour The hour (0-23)
 * @param startHour Starting hour of the time scale
 * @returns Position in time scale (0-23)
 */
export function getPositionForHour(hour: number, startHour: number): number {
  let position = hour - startHour;
  if (position < 0) {
    position += 24;
  }
  return position % 24;
}
