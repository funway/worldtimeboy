import { Home, X } from 'lucide-react';
import { formatInTimeZone } from 'date-fns-tz';
import { TimezoneWithOffset, TimeRange } from '../types';

interface TimezoneInfoProps {
  timezone: TimezoneWithOffset;
  selectedRange: TimeRange | null;
  onRemove: () => void;
  onSetHome?: () => void;
  isDragging?: boolean;
  dragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

// Calculate UTC offset in hours
function getUTCOffset(timezone: string, date: Date = new Date()): number {
  // Format the date in UTC and the target timezone
  const utcFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const tzFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  const utcParts = utcFormatter.formatToParts(date);
  const tzParts = tzFormatter.formatToParts(date);
  
  // Extract time components
  const getValue = (parts: Intl.DateTimeFormatPart[], type: string) => 
    parseInt(parts.find(p => p.type === type)?.value || '0', 10);
  
  // Get full date-time components
  const utcYear = getValue(utcParts, 'year');
  const utcMonth = getValue(utcParts, 'month');
  const utcDay = getValue(utcParts, 'day');
  const utcHour = getValue(utcParts, 'hour');
  const utcMinute = getValue(utcParts, 'minute');
  
  const tzYear = getValue(tzParts, 'year');
  const tzMonth = getValue(tzParts, 'month');
  const tzDay = getValue(tzParts, 'day');
  const tzHour = getValue(tzParts, 'hour');
  const tzMinute = getValue(tzParts, 'minute');
  
  // Create Date objects representing the same moment
  // Parse as if they were UTC times
  const utcTime = Date.UTC(utcYear, utcMonth - 1, utcDay, utcHour, utcMinute);
  const tzTime = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute);
  
  // The difference gives us the offset in milliseconds, convert to hours
  return (tzTime - utcTime) / (1000 * 60 * 60);
}

// Format UTC offset as UTC+N or UTC-N
function formatUTCOffset(offset: number): string {
  const sign = offset >= 0 ? '+' : '';
  return `UTC${sign}${Math.round(offset)}`;
}

export function TimezoneInfo({
  timezone,
  selectedRange,
  onRemove,
  onSetHome,
  isDragging,
  dragOver,
  onDragStart,
  onDragOver,
  onDrop,
}: TimezoneInfoProps) {
  const displayTime = selectedRange
    ? `${String(selectedRange.startHour).padStart(2, '0')}:00 - ${String(selectedRange.endHour).padStart(2, '0')}:00`
    : timezone.formattedTime;

  // Calculate UTC offset
  const utcOffset = getUTCOffset(timezone.timezone, timezone.currentTime);
  
  // Format date as "Thu, Jan 29"
  const formattedDateStr = !selectedRange
    ? formatInTimeZone(timezone.currentTime, timezone.timezone, 'EEE, MMM d')
    : '';

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

      {/* Second column: Timezone name with UTC offset below */}
      <div className="flex flex-col items-start justify-center">
        <div className="text-sm font-bold text-black leading-tight">{timezone.name}</div>
        <div className="text-[10px] text-gray-500 leading-tight">{formatUTCOffset(utcOffset)}</div>
      </div>

      {/* Third column: Time and date */}
      <div className="flex flex-col items-end justify-center">
        {selectedRange ? (
          <>
            <div className="text-sm font-bold text-black">
              {String(selectedRange.startHour).padStart(2, '0')}:00 - {String(selectedRange.endHour).padStart(2, '0')}:00
            </div>
          </>
        ) : (
          <>
            <div className="text-sm font-bold text-black leading-tight">{displayTime}</div>
            {formattedDateStr && (
              <div className="text-[10px] text-gray-500 leading-tight">{formattedDateStr}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
