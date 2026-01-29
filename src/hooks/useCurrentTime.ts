import { useEffect, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { Timezone, TimezoneWithOffset, UserPreferences } from '../types';
import { getTimezoneOffset } from '../utils/timeScale';

export function useCurrentTime(
  timezones: Timezone[],
  preferences: UserPreferences | null
) {
  const [currentTimes, setCurrentTimes] = useState<TimezoneWithOffset[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (timezones.length === 0) {
      setCurrentTimes([]);
      return;
    }

    const updateTimes = () => {
      const now = new Date();
      setCurrentDate(now);
      
      // Find home timezone, or use first one as fallback
      const homeTimezone = timezones.find(tz => tz.isHome) || timezones[0];
      const referenceTimezone = homeTimezone?.timezone;
      if (!referenceTimezone) return;

      // Sort timezones by order if available
      const sortedTimezones = [...timezones].sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
      });

      const times: TimezoneWithOffset[] = sortedTimezones.map((tz) => {
        const offset = getTimezoneOffset(tz.timezone, referenceTimezone, now);
        const hourFormat = preferences?.hourFormat || '24';
        
        const timeFormat = hourFormat === '12' ? 'h:mm a' : 'HH:mm';
        const formattedTime = formatInTimeZone(now, tz.timezone, timeFormat);
        const formattedDate = formatInTimeZone(now, tz.timezone, 'yyyy-MM-dd');
        const dayOfWeek = formatInTimeZone(now, tz.timezone, 'EEEE');

        return {
          ...tz,
          offset,
          currentTime: now,
          formattedTime,
          formattedDate,
          dayOfWeek,
        };
      });

      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);

    return () => clearInterval(interval);
  }, [timezones, preferences]);

  return { currentTimes, currentDate };
}
