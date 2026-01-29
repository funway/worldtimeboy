import { formatInTimeZone } from 'date-fns-tz';
import { TimeScaleConfig } from '../types';
import { getHourAtPosition } from '../utils/timeScale';

interface TimeScaleProps {
  config: TimeScaleConfig;
  timezone: string;
  currentTime: Date;
  hoverPosition: number | null;
  isSelecting: boolean;
  selectedRange: { startHour: number; endHour: number } | null;
  onMouseMove: (position: number) => void;
  onMouseLeave: () => void;
  onClick: (hour: number) => void;
  onDrag: (hour: number) => void;
  onDragEnd: () => void;
  rowIndex: number;
}

export function TimeScale({
  config,
  timezone,
  currentTime,
  hoverPosition,
  onMouseMove,
  onMouseLeave,
  onClick,
  onDrag,
  onDragEnd,
}: TimeScaleProps) {
  const { startHour, dateMarkers } = config;
  const positions = Array.from({ length: 24 }, (_, i) => i);

  // Find which position (0-23) corresponds to hour 0 in this timezone
  const getDateMarker = (position: number): { month: string; day: string } | null => {
    const actualHour = getHourAtPosition(position, startHour);
    // Check if this position corresponds to hour 0
    if (actualHour === 0) {
      const marker = dateMarkers.find((m) => m.hour === 0);
      if (marker) {
        // Format date as month abbreviation and day for the current time in this timezone
        const month = formatInTimeZone(currentTime, timezone, 'MMM');
        const day = formatInTimeZone(currentTime, timezone, 'd');
        return { month, day };
      }
    }
    return null;
  };

  // Determine if this hour is day (6-17) or night (18-5)
  const isDayTime = (hour: number): boolean => {
    return hour >= 6 && hour <= 17;
  };

  // Find positions for 0h and 23h cells
  const getZeroHourPosition = (): number | null => {
    for (let pos = 0; pos < 24; pos++) {
      if (getHourAtPosition(pos, startHour) === 0) {
        return pos;
      }
    }
    return null;
  };

  const get23HourPosition = (): number | null => {
    for (let pos = 0; pos < 24; pos++) {
      if (getHourAtPosition(pos, startHour) === 23) {
        return pos;
      }
    }
    return null;
  };

  const zeroHourPos = getZeroHourPosition();
  const hour23Pos = get23HourPosition();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.floor((x / rect.width) * 24);
    onMouseMove(position);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.floor((x / rect.width) * 24);
    const actualHour = getHourAtPosition(position, startHour);
    onClick(actualHour);
    
    let isDragging = false;
    
    const handleMouseMoveDrag = (e: MouseEvent) => {
      isDragging = true;
      e.preventDefault();
      // Find the time-scale element under the cursor
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const timeScale = element?.closest('.time-scale') as HTMLElement;
      if (!timeScale) return;
      const timeScaleRect = timeScale.getBoundingClientRect();
      const x = e.clientX - timeScaleRect.left;
      const position = Math.floor((x / timeScaleRect.width) * 24);
      // Get startHour from the time-scale's data attribute or calculate it
      // For now, we'll use the current startHour, but this might need adjustment
      const actualHour = getHourAtPosition(position, startHour);
      onDrag(actualHour);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMoveDrag);
      document.removeEventListener('mouseup', handleMouseUp);
      if (isDragging) {
        onDragEnd();
      }
    };

    document.addEventListener('mousemove', handleMouseMoveDrag);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      className="time-scale relative w-full h-full px-2 flex items-center cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseDown={handleMouseDown}
    >
      {positions.map((position) => {
        const actualHour = getHourAtPosition(position, startHour);
        const dateMarker = getDateMarker(position);
        const isDay = isDayTime(actualHour);
        const isZeroHour = position === zeroHourPos;
        const isHovered = hoverPosition === position;

        // Determine background color: 0h-cell uses darker night color
        let bgColor = isDay 
          ? 'bg-day-time text-navy-blue'
          : isZeroHour
          ? 'bg-night-time-dark text-white'
          : 'bg-night-time text-white';
        
        // Add hover highlight with background color change
        if (isHovered) {
          if (isDay) {
            bgColor = 'bg-yellow-200 text-navy-blue'; // 白天高亮：浅黄色
          } else {
            bgColor = isZeroHour 
              ? 'bg-blue-400 text-white' // 0h-cell 高亮：更亮的蓝色
              : 'bg-blue-300 text-white'; // 其他晚上高亮：亮蓝色
          }
        }

        return (
          <div
            key={position}
            className="relative flex-1 flex items-center justify-center h-full"
          >
            {/* h-cell: the inner div with borders and content */}
            <div
              className={`h-cell w-full flex flex-col items-center justify-center transition-colors ${bgColor} ${
                isZeroHour 
                  ? 'border-l rounded-l-md' 
                  : ''
              } ${
                position === 23
                  ? ''
                  : position === hour23Pos
                  ? 'border-r rounded-r-md pr-1'
                  : 'border-r border-r-gray-300/30'
              } border-t border-t-gray-300 border-b border-b-gray-300`}
              style={{ height: '1.5em' }}
            >
              {dateMarker ? (
                <>
                  <span className="text-[10px] font-semibold leading-tight">{dateMarker.month}</span>
                  <span className="text-[10px] font-semibold leading-tight">{dateMarker.day}</span>
                </>
              ) : (
                <span className={`text-sm font-medium`}>
                  {actualHour}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
