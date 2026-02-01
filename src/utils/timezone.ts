import cityTimezones from '../data/city-timezones.json';

// Module-level cache for timezone dictionary
let cachedTimezoneDict: Record<string, string> | null = null;

// Normalize search query (remove spaces and underscores, convert to lowercase, preserve +-)
function normalizeQuery(query: string): string {
  return query.toLowerCase().replace(/[\s_]/g, '');
}

// Format timezone ID to display name (e.g., "America/New_York" -> "New York")
export function formatTimezoneName(timezoneId: string): string {
  const parts = timezoneId.split('/');
  if (parts.length > 1) {
    // Replace underscores with spaces in the last part
    return parts[parts.length - 1].replace(/_/g, ' ');
  }

  // Handle single-part timezone IDs (replace underscores with spaces)
  return timezoneId.replace(/_/g, ' ');
}

// Build integrated timezone dictionary
// Key: display name, Value: timezone ID
function buildTimezoneDictionary(): Record<string, string> {
  if (cachedTimezoneDict) {
    return cachedTimezoneDict;
  }

  const dict: Record<string, string> = {};

  // Step 1: Load city-timezones.json first
  for (const [name, timezoneId] of Object.entries(cityTimezones)) {
    dict[name] = timezoneId;
  }

  // Step 2: Load all timezones from Intl.supportedValuesOf
  try {
    // @ts-expect-error - supportedValuesOf may not be in all TypeScript versions
    if (typeof Intl.supportedValuesOf === 'function') {
      // @ts-expect-error - supportedValuesOf may not be in all TypeScript versions
      const timezones = Intl.supportedValuesOf('timeZone');
      // Ensure UTC timezones are included
      const utcTimezones = ['Etc/UTC', 'Etc/GMT'];
      const timezoneSet = new Set(timezones);
      utcTimezones.forEach(tz => timezoneSet.add(tz));
      const allTimezones = Array.from(timezoneSet);

      // Add each timezone with formatted name as key
      // System-generated names override city-timezones.json entries
      for (const timezoneId of allTimezones) {
        const formattedName = formatTimezoneName(timezoneId);
        dict[formattedName] = timezoneId;
      }
    } else {
      // Fallback: add common timezones
      const fallbackTimezones = [
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

      for (const timezoneId of fallbackTimezones) {
        const formattedName = formatTimezoneName(timezoneId);
        dict[formattedName] = timezoneId;
      }
    }
  } catch (e) {
    // Fallback for older browsers - at least include UTC
    const fallbackTimezones = ['Etc/UTC', 'Etc/GMT'];
    for (const timezoneId of fallbackTimezones) {
      const formattedName = formatTimezoneName(timezoneId);
      dict[formattedName] = timezoneId;
    }
  }

  cachedTimezoneDict = dict;
  return dict;
}

// Search timezones by query
export function searchTimezones(query: string): Array<{ id: string; name: string; timezone: string }> {
  if (!query.trim()) {
    return [];
  }

  const dict = buildTimezoneDictionary();
  const normalizedQuery = normalizeQuery(query);
  const results: Array<{ id: string; name: string; timezone: string }> = [];
  const addedTimezones = new Set<string>();
  const MAX_RESULTS = 20;

  // Search in both display names (priority) and timezone IDs in a single pass
  for (const [name, timezoneId] of Object.entries(dict)) {
    if (addedTimezones.has(timezoneId)) continue;
    if (results.length >= MAX_RESULTS) break;

    // Priority 1: Check display name first
    const normalizedName = normalizeQuery(name);
    const matchesName = normalizedName.includes(normalizedQuery);
    
    // Priority 2: Check timezone ID if name doesn't match (avoid unnecessary normalization)
    const matchesId = !matchesName && normalizeQuery(timezoneId).includes(normalizedQuery);

    if (matchesName || matchesId) {
      results.push({
        id: timezoneId,
        name: name,
        timezone: timezoneId,
      });
      addedTimezones.add(timezoneId);
    }
  }

  return results;
}

// Get user's local timezone
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// Get timezone abbreviation using Intl.DateTimeFormat
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short'
  });
  const parts = formatter.formatToParts(date);
  const tzNamePart = parts.find(part => part.type === 'timeZoneName');
  return tzNamePart?.value || '';
}
