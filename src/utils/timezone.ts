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
    dict[name] = timezoneId as string;
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
        const formattedName = formatTimezoneName(timezoneId as string);
        dict[formattedName] = timezoneId as string;
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

  // Collect all matches first, then sort by relevance
  const matches: Array<{ name: string; timezone: string; score: number }> = [];
  
  for (const [name, timezoneId] of Object.entries(dict)) {
    const normalizedName = normalizeQuery(name);
    const normalizedTzId = normalizeQuery(timezoneId);
    
    // Calculate match score: exact match = 3, starts with = 2, contains = 1
    let score = 0;
    let matchesName = false;
    let matchesId = false;
    
    if (normalizedName === normalizedQuery) {
      score = 3;
      matchesName = true;
    } else if (normalizedName.startsWith(normalizedQuery)) {
      score = 2;
      matchesName = true;
    } else if (normalizedName.includes(normalizedQuery)) {
      score = 1;
      matchesName = true;
    }
    
    if (!matchesName) {
      if (normalizedTzId === normalizedQuery) {
        score = 3;
        matchesId = true;
      } else if (normalizedTzId.startsWith(normalizedQuery)) {
        score = 2;
        matchesId = true;
      } else if (normalizedTzId.includes(normalizedQuery)) {
        score = 1;
        matchesId = true;
      }
    }
    
    if (matchesName || matchesId) {
      matches.push({ name, timezone: timezoneId, score });
    }
  }
  
  // Sort by score (descending), then by name (ascending)
  matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });
  
  // Add results, avoiding duplicates by timezone ID
  for (const match of matches) {
    if (addedTimezones.has(match.timezone)) continue;
    if (results.length >= MAX_RESULTS) break;
    
    results.push({
      id: match.timezone,
      name: match.name,
      timezone: match.timezone,
    });
    addedTimezones.add(match.timezone);
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
