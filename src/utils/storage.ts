import { Timezone, UserPreferences } from '../types';

const STORAGE_KEYS = {
  TIMEZONES: 'timezones',
  PREFERENCES: 'preferences',
} as const;

export async function getTimezones(): Promise<Timezone[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.TIMEZONES], (result) => {
      const timezones: Timezone[] = result[STORAGE_KEYS.TIMEZONES] || [];
      
      // Allow empty list - no need to set home if list is empty
      if (timezones.length === 0) {
        resolve([]);
        return;
      }
      
      // Sort by order first
      const sorted = [...timezones].sort((a, b) => {
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        return orderA - orderB;
      });
      
      // Ensure first timezone is home if no home exists
      if (!sorted.some((tz: Timezone) => tz.isHome)) {
        sorted[0].isHome = true;
        saveTimezones(sorted); // Save without waiting
      }
      
      resolve(sorted);
    });
  });
}

export async function saveTimezones(timezones: Timezone[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.TIMEZONES]: timezones }, () => {
      resolve();
    });
  });
}

export async function addTimezone(timezone: Timezone): Promise<void> {
  const timezones = await getTimezones();
  // Check if timezone already exists
  if (!timezones.find((tz) => tz.timezone === timezone.timezone)) {
    // Set order if not provided
    if (timezone.order === undefined) {
      timezone.order = timezones.length;
    }
    // If this is the first timezone and no home exists, make it home
    if (timezones.length === 0 && !timezone.isHome) {
      timezone.isHome = true;
    }
    // If setting as home, unset other home timezones
    if (timezone.isHome) {
      timezones.forEach(tz => { tz.isHome = false; });
    }
    timezones.push(timezone);
    await saveTimezones(timezones);
  }
}

export async function reorderTimezones(timezoneIds: string[]): Promise<void> {
  const timezones = await getTimezones();
  const reordered: Timezone[] = [];
  
  // Add timezones in the new order
  timezoneIds.forEach((id, index) => {
    const tz = timezones.find(t => t.id === id);
    if (tz) {
      reordered.push({ ...tz, order: index });
    }
  });
  
  // Add any timezones that weren't in the reorder list
  timezones.forEach(tz => {
    if (!reordered.find(r => r.id === tz.id)) {
      reordered.push({ ...tz, order: reordered.length });
    }
  });
  
  await saveTimezones(reordered);
}

export async function setHomeTimezone(timezoneId: string): Promise<void> {
  const timezones = await getTimezones();
  timezones.forEach(tz => {
    tz.isHome = tz.id === timezoneId;
  });
  await saveTimezones(timezones);
}

export async function removeTimezone(timezoneId: string): Promise<void> {
  const timezones = await getTimezones();
  const removed = timezones.find(tz => tz.id === timezoneId);
  const filtered = timezones.filter((tz) => tz.id !== timezoneId);
  
  // If removed timezone was home and there are remaining timezones, set first one as home
  if (removed?.isHome && filtered.length > 0) {
    // Sort by order to ensure we set the first one in the list as home
    const sorted = [...filtered].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
    sorted[0].isHome = true;
    await saveTimezones(sorted);
  } else {
    // Allow empty list - no need to set home if list is empty
    await saveTimezones(filtered);
  }
}

export async function updateTimezoneLabel(timezoneId: string, label: string): Promise<void> {
  const timezones = await getTimezones();
  const updated = timezones.map(tz => {
    if (tz.id === timezoneId) {
      return { ...tz, label };
    }
    return tz;
  });
  await saveTimezones(updated);
}

export async function getPreferences(): Promise<UserPreferences> {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEYS.PREFERENCES], (result) => {
      resolve(
        result[STORAGE_KEYS.PREFERENCES] || {
          hourFormat: '24',
        }
      );
    });
  });
}

export async function savePreferences(preferences: UserPreferences): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.PREFERENCES]: preferences }, () => {
      resolve();
    });
  });
}
