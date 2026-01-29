import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchTimezones } from '../utils/timezone';
import { parseTimeString, isTimeString } from '../utils/timeParser';
import { utcToZonedTime } from 'date-fns-tz';

/**
 * Create a UTC Date object from a time in a specific timezone
 * Uses iterative approach to find the correct UTC time
 */
function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string
): Date {
  // Validate inputs
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
    return new Date(); // Return current time if invalid
  }
  
  // Start with a guess: UTC time with the same components
  let utcDate = new Date(Date.UTC(year, month, day, hour, minute, 0));
  
  // Check if date is valid
  if (isNaN(utcDate.getTime())) {
    return new Date(); // Return current time if invalid
  }
  
  // Iterate to find the correct UTC time
  // Check what this UTC time shows in the target timezone
  for (let i = 0; i < 5; i++) {
    const zoned = utcToZonedTime(utcDate, timezone);
    const diffHours = hour - zoned.getHours();
    const diffMinutes = minute - zoned.getMinutes();
    
    // If match, we're done
    if (diffHours === 0 && diffMinutes === 0) {
      break;
    }
    
    // Adjust UTC date by the difference
    const newUtcDate = new Date(utcDate.getTime() + (diffHours * 60 + diffMinutes) * 60 * 1000);
    
    // Check if new date is valid
    if (isNaN(newUtcDate.getTime())) {
      break;
    }
    
    utcDate = newUtcDate;
  }
  
  return utcDate;
}

interface TimezoneSearchProps {
  onAddTimezone: (timezoneId: string) => void;
  homeTimezone?: string;
  onTimeChange?: (time: Date | null) => void;
}

export function TimezoneSearch({ onAddTimezone, homeTimezone, onTimeChange }: TimezoneSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; timezone: string }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      setResults([]);
      setShowResults(false);
      setSelectedIndex(-1);
      // Clear custom time when query is empty
      if (onTimeChange) {
        onTimeChange(null);
      }
      return;
    }

    // Check if input is a time string
    if (isTimeString(trimmedQuery) && homeTimezone && onTimeChange) {
      const parsedTime = parseTimeString(trimmedQuery);
      if (parsedTime) {
        // Get current date in home timezone to preserve date
        const now = new Date();
        const zonedNow = utcToZonedTime(now, homeTimezone);
        
        // Create date components in home timezone
        const year = zonedNow.getFullYear();
        const month = zonedNow.getMonth();
        const day = zonedNow.getDate();
        const hour = parsedTime.hour;
        const minute = parsedTime.minute;
        
        // Create UTC date from timezone-specific time
        const utcDate = createDateInTimezone(year, month, day, hour, minute, homeTimezone);
        onTimeChange(utcDate);
      }
      
      // Don't show timezone search results when input is a time
      setResults([]);
      setShowResults(false);
      return;
    }

    // Otherwise, search for timezones
    const searchResults = searchTimezones(trimmedQuery);
    setResults(searchResults);
    setShowResults(true);
    setSelectedIndex(-1);
    
    // Clear custom time when searching for timezones
    if (onTimeChange) {
      onTimeChange(null);
    }
  }, [query, homeTimezone, onTimeChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // 滚动到选中的项
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  const handleSelect = (timezoneId: string) => {
    onAddTimezone(timezoneId);
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex].timezone);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative flex-1 max-w-[400px]" ref={searchRef}>
      <div className="flex items-center bg-white border border-gray-300 rounded px-3 py-2">
        <Search size={16} className="mr-2 text-gray-500 flex-shrink-0" />
        <input
          type="text"
          className="flex-1 border-0 outline-none text-sm"
          placeholder="Place or timezone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {showResults && results.length > 0 && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 bg-white border border-t-0 border-gray-300 rounded-b max-h-[300px] overflow-y-auto z-[100] shadow-lg"
        >
          {results.map((result, index) => (
            <div
              key={result.id}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`px-3 py-2.5 cursor-pointer flex justify-between items-center border-b border-gray-100 transition-colors last:border-b-0 ${
                selectedIndex === index
                  ? 'bg-blue-100 hover:bg-blue-100'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSelect(result.timezone)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-sm font-bold text-gray-800">{result.name}</span>
              <span className="text-xs text-gray-500">{result.timezone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
