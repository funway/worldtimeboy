import { useMemo } from 'react';
import { TimezoneWithOffset } from '../types';
import { calculateTimeScaleConfig } from '../utils/timeScale';

export function useTimeScale(
  timezones: TimezoneWithOffset[],
  currentDate: Date
) {
  const timeScaleConfigs = useMemo(() => {
    if (timezones.length === 0) return [];
    
    // Find home timezone, or use first one as fallback
    const homeTimezone = timezones.find(tz => tz.isHome) || timezones[0];
    const referenceTimezone = homeTimezone.timezone;
    
    // Sort timezones by order if available
    const sortedTimezones = [...timezones].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
    
    return sortedTimezones.map((tz) => ({
      timezone: tz,
      config: calculateTimeScaleConfig(tz.timezone, referenceTimezone, currentDate),
    }));
  }, [timezones, currentDate]);

  return timeScaleConfigs;
}
