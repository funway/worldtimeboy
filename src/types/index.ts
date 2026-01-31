export interface Timezone {
  id: string;
  name: string;
  timezone: string; // IANA timezone ID, e.g., "Asia/Shanghai"
  label?: string; // Custom timezone abbreviation label (e.g., "HKT", "PKT", "PST")
  isHome?: boolean; // Whether this is the home timezone
  order?: number; // Order index for sorting
}

export interface TimezoneWithOffset extends Timezone {
  offset: number; // Offset in hours from the home timezone
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  dayOfWeek: string;
}

export interface TimeRange {
  startTime: Date;
  endTime: Date;
  startHour: number; // 0-23 (for home timezone reference)
  endHour: number; // 0-23 (for home timezone reference)
  startPosition: number; // 0-23, position in the time scale
  endPosition: number; // 0-23, position in the time scale
}

export interface UserPreferences {
  hourFormat: '12' | '24';
  showUtcOffset?: boolean;
}

export interface TimeScaleConfig {
  startHour: number; // 0-23, where the time scale starts
  dateMarkers: Array<{ hour: number; date: string }>; // Where to show date markers (M/D)
  baseTime: Date; // The absolute UTC time for position 0 (referenceTimezone's midnight)
}
