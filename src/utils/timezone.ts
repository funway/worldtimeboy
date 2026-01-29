import { CITY_ALIASES } from './constants';

// Get all supported timezones
export function getAllTimezones(): string[] {
  try {
    // @ts-expect-error - supportedValuesOf may not be in all TypeScript versions
    if (typeof Intl.supportedValuesOf === 'function') {
      // @ts-expect-error - supportedValuesOf may not be in all TypeScript versions
      const timezones = Intl.supportedValuesOf('timeZone');
      // Ensure UTC timezones are included
      const utcTimezones = ['Etc/UTC', 'Etc/GMT'];
      const allTimezones = [...timezones];
      utcTimezones.forEach(tz => {
        if (!allTimezones.includes(tz)) {
          allTimezones.push(tz);
        }
      });
      return allTimezones;
    }
    // Fallback: return common timezones including UTC
    return [
      'Etc/UTC',
      'Etc/GMT',
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'Europe/London',
      'Europe/Paris',
      'Asia/Shanghai',
      'Asia/Tokyo',
      'Asia/Hong_Kong',
      'Australia/Sydney',
    ];
  } catch (e) {
    // Fallback for older browsers - at least include UTC
    return ['Etc/UTC', 'Etc/GMT'];
  }
}

// Normalize search query (remove spaces, underscores, convert to lowercase)
function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/[\s_-]/g, '');
}

// Format timezone ID to display name (e.g., "America/Vancouver" -> "Vancouver")
export function formatTimezoneName(timezoneId: string): string {
  // Special handling for UTC/GMT
  if (timezoneId === 'Etc/UTC' || timezoneId === 'Etc/GMT') {
    return 'UTC';
  }
  if (timezoneId.startsWith('Etc/GMT')) {
    // Handle Etc/GMT+5, Etc/GMT-5, etc.
    const match = timezoneId.match(/Etc\/GMT([+-]?\d+)/);
    if (match) {
      const offset = match[1];
      return `GMT${offset}`;
    }
    return 'GMT';
  }
  
  const parts = timezoneId.split('/');
  if (parts.length > 1) {
    return parts[parts.length - 1].replace(/_/g, ' ');
  }
  return timezoneId;
}

// Search timezones by query
export function searchTimezones(query: string): Array<{ id: string; name: string; timezone: string }> {
  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = normalizeQuery(query);
  const allTimezones = getAllTimezones();
  const results: Array<{ id: string; name: string; timezone: string }> = [];
  const addedTimezones = new Set<string>();

  // Check city aliases first
  const aliasMatch = CITY_ALIASES[normalizedQuery];
  if (aliasMatch) {
    // Always add alias match even if not in allTimezones (for UTC)
    if (!addedTimezones.has(aliasMatch)) {
      results.push({
        id: aliasMatch,
        name: formatTimezoneName(aliasMatch),
        timezone: aliasMatch,
      });
      addedTimezones.add(aliasMatch);
    }
  }

  // Search in timezone IDs
  for (const tz of allTimezones) {
    if (addedTimezones.has(tz)) continue;
    
    const normalizedTz = normalizeQuery(tz);
    if (normalizedTz.includes(normalizedQuery)) {
      results.push({
        id: tz,
        name: formatTimezoneName(tz),
        timezone: tz,
      });
      addedTimezones.add(tz);
    }
  }

  // Limit results to top 20
  return results.slice(0, 20);
}

// Get user's local timezone
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
