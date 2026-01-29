import { useStorage } from './useStorage';
import { Timezone } from '../types';
import { formatTimezoneName } from '../utils/timezone';
import * as storage from '../utils/storage';

export function useTimezones() {
  const { timezones, addTimezone, removeTimezone, loading, refresh } = useStorage();

  // Generate a unique ID for a timezone
  function generateTimezoneId(timezone: string): string {
    return `${timezone}-${Date.now()}`;
  }

  // Add a timezone by IANA ID
  async function addTimezoneById(timezoneId: string) {
    const timezone: Timezone = {
      id: generateTimezoneId(timezoneId),
      name: formatTimezoneName(timezoneId),
      timezone: timezoneId,
    };
    await addTimezone(timezone);
    await refresh();
  }

  // Reorder timezones
  async function reorderTimezones(timezoneIds: string[]) {
    await storage.reorderTimezones(timezoneIds);
    await refresh();
  }

  // Set home timezone
  async function setHomeTimezone(timezoneId: string) {
    await storage.setHomeTimezone(timezoneId);
    await refresh();
  }

  return {
    timezones,
    loading,
    addTimezone: addTimezoneById,
    removeTimezone,
    reorderTimezones,
    setHomeTimezone,
  };
}
