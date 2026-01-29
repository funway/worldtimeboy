import { useState, useRef, useEffect } from 'react';
import { Home, X } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { TimezoneWithOffset } from '../types';
import { getTimezoneAbbreviation } from '../utils/timezone';

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

  // Get default label (use custom label or timezone abbreviation)
  const defaultLabel = timezone.label || getTimezoneAbbreviation(timezone.timezone, timezone.currentTime);
  const displayLabel = timezone.label || defaultLabel;

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
      className={`group grid grid-cols-[auto_1fr_auto] gap-1 px-2 py-3 relative cursor-move transition-colors ${
        isDragging ? 'opacity-50' : ''
      } ${dragOver ? 'bg-blue-50 border-t-2 border-t-primary' : ''}`}
      draggable={!!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* First column: Home button and Delete button */}
      <div className="flex flex-col gap-1 items-start">
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
            <Home size={12} strokeWidth={timezone.isHome ? 3 : 2} />
          </button>
        )}
        <button
          className="bg-transparent border-0 text-gray-500 cursor-pointer p-0 leading-none flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:text-red-600"
          onClick={onRemove}
          title="Remove timezone"
        >
          <X size={12} />
        </button>
      </div>

      {/* Second column: Timezone label (editable) and name */}
      <div className="flex flex-col items-start justify-center">
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
            className={`text-sm font-bold text-black leading-tight ${
              onUpdateLabel ? 'cursor-text hover:bg-blue-100 rounded px-1 -mx-1' : ''
            }`}
            onClick={handleLabelClick}
            title={onUpdateLabel ? 'Click to edit label' : ''}
          >
            {displayLabel}
          </div>
        )}
        <div className="text-[10px] text-gray-500 leading-tight">{timezone.name}</div>
      </div>

      {/* Third column: Time and date */}
      <div className="flex flex-col items-end justify-center">
        <div className="text-sm font-bold text-black leading-tight flex items-baseline gap-0.5">
          <span>{displayTimeValue}</span>
          {ampm && <span className="text-[10px] font-normal">{ampm}</span>}
        </div>
        {formattedDateStr && (
          <div className="text-[10px] text-gray-500 leading-tight">{formattedDateStr}</div>
        )}
      </div>
    </div>
  );
}
