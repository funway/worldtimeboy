import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchTimezones } from '../utils/timezone';

interface TimezoneSearchProps {
  onAddTimezone: (timezoneId: string) => void;
}

export function TimezoneSearch({ onAddTimezone }: TimezoneSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string; timezone: string }>>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchTimezones(query);
      setResults(searchResults);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setShowResults(false);
      setSelectedIndex(-1);
    }
  }, [query]);

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
              <span className="font-medium text-gray-800">{result.name}</span>
              <span className="text-xs text-gray-500">{result.timezone}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
