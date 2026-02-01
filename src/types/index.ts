/**
 * 表示一个时区对象，用于存储和管理用户选择的时区相关信息
 */
export interface Timezone {
  id: string;        // 唯一标识符
  label?: string;    // 自定义时区缩写标签（如 "HKT", "PKT", "PST"）
  isHome?: boolean;  // 是否为主时区（home timezone）
  order?: number;    // 排序索引，用于展示顺序
  name: string;      // 时区的名称（如 "China Standard Time", "Beijing"）
  timezone: string;  // IANA 时区 ID，例如 "Asia/Shanghai"
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
