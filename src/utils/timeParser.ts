/**
 * Parse time string in various formats and return hour and minute
 * Supports formats like:
 * - "14:30" (24-hour)
 * - "2:30 PM" (12-hour)
 * - "2:30pm" (12-hour lowercase)
 * - "14:30:00" (with seconds)
 * - "2:30" (12-hour, assumes AM if no AM/PM)
 */
export function parseTimeString(timeStr: string): { hour: number; minute: number } | null {
  if (!timeStr || !timeStr.trim()) {
    return null;
  }

  const trimmed = timeStr.trim();
  
  // Match patterns like "14:30", "2:30 PM", "2:30pm", "14:30:00", "11pm"
  const patterns = [
    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?$/i,  // "14:30" or "2:30 PM"
    /^(\d{1,2})\s*(AM|PM|am|pm)$/i,  // "11pm" or "11 PM"
  ];

  for (let i = 0; i < patterns.length; i++) {
    const match = trimmed.match(patterns[i]);
    if (match) {
      let hour = parseInt(match[1], 10);
      let minute = 0;
      let ampm: string | undefined;
      
      if (i === 0) {
        // First pattern: has minutes
        minute = match[2] ? parseInt(match[2], 10) : 0;
        ampm = match[3]?.toUpperCase();
      } else {
        // Second pattern: no minutes, just hour and AM/PM
        ampm = match[2]?.toUpperCase();
      }

      // Validate initial hour range (before AM/PM conversion)
      if (isNaN(hour) || hour < 0 || hour > 23 || isNaN(minute) || minute < 0 || minute > 59) {
        continue;
      }

      // Handle 12-hour format
      // If hour > 12 and has AM/PM, ignore AM/PM (treat as 24-hour format)
      if (ampm && hour <= 12) {
        if (ampm === 'PM' && hour !== 12) {
          hour += 12;
        } else if (ampm === 'AM' && hour === 12) {
          hour = 0;
        }
      }

      // Validate final hour range (after AM/PM conversion)
      if (hour < 0 || hour > 23) {
        continue;
      }

      return { hour, minute };
    }
  }

  return null;
}

/**
 * Check if a string looks like a time string
 */
export function isTimeString(str: string): boolean {
  return parseTimeString(str) !== null;
}
