import { useEffect, useState } from 'react';
import * as storage from '../utils/storage';
import { Timezone, UserPreferences } from '../types';

export function useStorage() {
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    
    // Listen for storage changes
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.timezones) {
        setTimezones(changes.timezones.newValue || []);
      }
      if (changes.preferences) {
        setPreferences(changes.preferences.newValue || null);
      }
    };
    
    chrome.storage.onChanged.addListener(listener);
    
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  async function loadData() {
    const [tzs, prefs] = await Promise.all([
      storage.getTimezones(),
      storage.getPreferences(),
    ]);
    setTimezones(tzs);
    setPreferences(prefs);
    setLoading(false);
  }

  async function addTimezone(timezone: Timezone) {
    await storage.addTimezone(timezone);
    await loadData();
  }

  async function removeTimezone(timezoneId: string) {
    await storage.removeTimezone(timezoneId);
    await loadData();
  }

  async function updatePreferences(newPreferences: UserPreferences) {
    await storage.savePreferences(newPreferences);
    await loadData();
  }

  async function refresh() {
    await loadData();
  }

  return {
    timezones,
    preferences,
    loading,
    addTimezone,
    removeTimezone,
    updatePreferences,
    refresh,
  };
}
