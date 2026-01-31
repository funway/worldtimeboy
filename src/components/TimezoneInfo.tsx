import { useState, useRef, useEffect } from 'react';
import { Home, X } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { TimezoneWithOffset } from '../types';
import { getTimezoneAbbreviation } from '../utils/timezone';
import { getTimezoneOffset } from '../utils/timeScale';

interface TimezoneInfoProps {
  timezone: TimezoneWithOffset;
  hourFormat: '12' | '24';
  onRemove: () => void;
  onSetHome?: () => void;
  onUpdateLabel?: (label: string) => void;
  isDragging?: boolean;
  dragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isCustomTime?: boolean;
}

export function TimezoneInfo({
  timezone,
  hourFormat,
  onRemove,
  onSetHome,
  onUpdateLabel,
  isDragging,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
  isCustomTime = false,
}: TimezoneInfoProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [labelValue, setLabelValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse time string to separate time and am/pm for 12-hour format
  const parseTimeDisplay = (timeStr: string) => {
    if (hourFormat === '12' && timeStr.includes(' ')) {
      const parts = timeStr.split(' ');
      const time = parts[0];
      const ampm = parts.slice(1).join(' '); // Handle cases like "AM" or "PM"
      return { time, ampm };
    }
    return { time: timeStr, ampm: null };
  };

  const displayTime = timezone.formattedTime;
  const { time: displayTimeValue, ampm } = parseTimeDisplay(displayTime);

  // Format date as "Thu, Jan 29"
  const formattedDateStr = formatInTimeZone(timezone.currentTime, timezone.timezone, 'EEE, MMM d');

  // Get display label (use custom label or timezone abbreviation)
  const displayLabel = timezone.label || getTimezoneAbbreviation(timezone.timezone, timezone.currentTime);

  // Calculate UTC offset in hours
  const utcOffset = getTimezoneOffset(timezone.timezone, 'Etc/UTC', timezone.currentTime);
  const formattedUtcOffset = utcOffset > 0 ? `+${utcOffset}` : `${utcOffset}`;

  // Initialize label value when entering edit mode
  useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      setLabelValue(displayLabel);
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel, displayLabel]);

  const handleLabelClick = (e: React.MouseEvent) => {
    if (onUpdateLabel && !isDragging) {
      e.stopPropagation();
      setIsEditingLabel(true);
    }
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    if (onUpdateLabel && labelValue.trim() !== '') {
      onUpdateLabel(labelValue.trim());
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setIsEditingLabel(false);
      setLabelValue(displayLabel);
    }
  };

  return (
    <div
      className={`group grid grid-cols-[auto_minmax(0,1fr)_minmax(0,auto)] gap-1 px-1 relative cursor-move transition-colors ${
        isDragging ? 'opacity-50' : ''
      } ${dragOver ? 'bg-blue-50 border-t-2 border-t-primary' : ''}`}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* First column: Home button and Delete button */}
      <div className="flex flex-col pt-3.5 gap-1 items-start">
        {onSetHome && (
          <button
            className={`bg-transparent border-0 cursor-pointer p-0 leading-none flex items-center justify-center transition-all ${
              timezone.isHome
                ? 'text-gray-600 disabled:opacity-100 disabled:cursor-not-allowed opacity-100'
                : 'text-gray-600 hover:text-primary opacity-0 group-hover:opacity-100'
            }`}
            onClick={onSetHome}
            disabled={timezone.isHome}
            title={timezone.isHome ? 'Home timezone' : 'Set as home timezone'}
          >
            <Home size={12} strokeWidth={timezone.isHome ? 4 : 3} />
          </button>
        )}
        <button
          className="bg-transparent border-0 text-gray-500 cursor-pointer p-0 leading-none flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:text-red-600"
          onClick={onRemove}
          title="Remove timezone"
        >
          <X size={12} strokeWidth={3} />
        </button>
      </div>

      {/* Second column: Timezone label (editable) and name */}
      <div className="flex flex-col items-start py-3 justify-center min-w-0 overflow-hidden">
        {isEditingLabel ? (
          <input
            ref={inputRef}
            type="text"
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            className="text-sm font-bold text-black leading-tight bg-white border border-blue-500 rounded px-1 py-0 w-16 focus:outline-none focus:ring-1 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className={`text-sm font-bold text-black leading-tight w-full ${
              onUpdateLabel ? 'cursor-text hover:bg-blue-100 rounded px-1 -mx-1' : ''
            }`}
            onClick={handleLabelClick}
            title={displayLabel}
          >
            <div className="flex items-start w-full min-w-0 gap-1">
              <span className="truncate flex-initial min-w-0">
                {displayLabel}
              </span>
              
              <span className="text-[9px] text-gray-600 font-mono font-medium 
              leading-none bg-gray-100 rounded px-1 py-1 whitespace-nowrap shrink-0">
                {formattedUtcOffset}
              </span>
            </div>
          </div>
        )}
        <div className="text-[10px] text-gray-500 leading-tight truncate w-full" title={timezone.name}>
          {timezone.name}
        </div>
      </div>

      {/* Third column: Time and date */}
      <div className="flex flex-col items-end py-3 justify-center min-w-0 max-w-[140px] overflow-hidden">
        <div 
          className={`text-sm font-bold leading-tight flex items-baseline gap-0.5 truncate w-full justify-end transition-colors ${
            isCustomTime ? 'text-primary' : 'text-black'
          }`}
          title={`${displayTimeValue}${ampm ? ` ${ampm}` : ''}`}
        >
          <span className="truncate">{displayTimeValue}</span>
          {ampm && <span className="text-[10px] font-normal flex-shrink-0">{ampm}</span>}
        </div>
        {formattedDateStr && (
          <div className={`text-[10px] leading-tight truncate w-full text-right transition-colors ${
            isCustomTime ? 'text-primary/70' : 'text-gray-500'
          }`} title={formattedDateStr}>
            {formattedDateStr}
          </div>
        )}
      </div>
    </div>
  );
}
