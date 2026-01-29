// City alias mapping for timezone search
export const CITY_ALIASES: Record<string, string> = {
  beijing: 'Asia/Shanghai',
  peking: 'Asia/Shanghai',
  'hong kong': 'Asia/Hong_Kong',
  hongkong: 'Asia/Hong_Kong',
  'new york': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
  'san francisco': 'America/Los_Angeles',
  'mexico city': 'America/Mexico_City',
  mumbai: 'Asia/Kolkata',
  delhi: 'Asia/Kolkata',
  // UTC timezone aliases
  utc: 'Etc/UTC',
  gmt: 'Etc/GMT',
  'gmt+0': 'Etc/GMT',
  'gmt-0': 'Etc/GMT',
};

// Default popup dimensions
export const POPUP_WIDTH = 900;
export const POPUP_MAX_HEIGHT = 600;

// Time scale configuration
export const HOURS_PER_DAY = 24;
export const TIME_SCALE_HEIGHT = 60; // Height of time scale in pixels
