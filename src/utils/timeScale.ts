import { TimeScaleConfig } from '../types';
import { formatInTimeZone } from 'date-fns-tz';

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
 * @param referenceTimezone The reference timezone (first timezone)
 * @param date The date to calculate for
 * @returns TimeScaleConfig with startHour and date markers
 */
export function calculateTimeScaleConfig(
  timezone: string,
  referenceTimezone: string,
  date: Date = new Date()
): TimeScaleConfig {
  const offset = getTimezoneOffset(timezone, referenceTimezone, date);
  
  // Home timezone starts at 0h
  if (timezone === referenceTimezone) {
    return {
      startHour: 0,
      dateMarkers: [
        { hour: 0, date: formatInTimeZone(date, timezone, 'M/d') },
      ],
    };
  }

  // Calculate start hour (offset from reference)
  // This is where position 0 in the time scale corresponds to in actual hours
  let startHour = offset % 24;
  if (startHour < 0) {
    startHour += 24;
  }
  startHour = Math.floor(startHour);

  // Calculate date markers
  const dateMarkers: Array<{ hour: number; date: string }> = [];
  const currentDate = new Date(date);
  
  // Get the date for hour 0 in this timezone
  const hour0Date = formatInTimeZone(currentDate, timezone, 'M/d');
  dateMarkers.push({
    hour: 0, // This is the actual hour (0h), not the position
    date: hour0Date,
  });

  return {
    startHour: startHour,
    dateMarkers,
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
