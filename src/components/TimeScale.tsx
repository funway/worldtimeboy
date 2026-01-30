import { TimeScaleConfig } from '../types';
import { getHourAtPosition } from '../utils/timeScale';

interface TimeScaleProps {
  config: TimeScaleConfig;
  timezone: string;
  currentTime: Date;
  hourFormat: '12' | '24';
  hoverPosition: number | null;
  onMouseMove: (position: number) => void;
  onMouseLeave: () => void;
  onClick?: (position: number) => void;
  rowIndex: number;
}

export function TimeScale({
  config,
  hourFormat,
  hoverPosition,
  onMouseMove,
  onMouseLeave,
  onClick,
}: TimeScaleProps) {
  const { startHour, dateMarkers } = config;
  const positions = Array.from({ length: 24 }, (_, i) => i);

  const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Convert 24-hour format to 12-hour format
  const convertTo12Hour = (hour24: number): { hour: number; ampm: string } => {
    if (hour24 === 0) {
      return { hour: 12, ampm: 'AM' };
    } else if (hour24 === 12) {
      return { hour: 12, ampm: 'PM' };
    } else if (hour24 < 12) {
      return { hour: hour24, ampm: 'AM' };
    } else {
      return { hour: hour24 - 12, ampm: 'PM' };
    }
  };

  // Find which position (0-23) corresponds to hour 0 in this timezone
  const getDateMarker = (position: number): { month: string; day: string } | null => {
    const actualHour = getHourAtPosition(position, startHour);
    // Check if this position corresponds to hour 0
    if (actualHour === 0) {
      const marker = dateMarkers.find((m) => m.hour === 0);
      if (marker) {
        // marker.date is already the correct date for this timezone's 0h-cell, in "M/d" format
        const [monthNum, day] = marker.date.split('/');
        const monthIndex = parseInt(monthNum, 10) - 1;
        const monthAbbr = MONTH_ABBR[monthIndex] ?? '';
        return { month: monthAbbr, day };
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const padding = 8; // px-2
    const cellAreaWidth = rect.width - (padding * 2);
    const cellWidth = cellAreaWidth / 24;
    const x = e.clientX - rect.left - padding;
    const position = Math.max(0, Math.min(23, Math.floor(x / cellWidth)));
    onClick(position);
  };

  return (
    <div 
      className="time-scale relative w-full h-full px-2 flex items-center cursor-default"
      onMouseMove={handleMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
    >
      {positions.map((position) => {
        const actualHour = getHourAtPosition(position, startHour);
        const dateMarker = getDateMarker(position);
        const isDay = isDayTime(actualHour);
        const isZeroHour = position === zeroHourPos;
        const is23Hour = position === hour23Pos;
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
              className={`h-cell w-full flex flex-col items-center justify-center py-1 transition-colors ${bgColor} ${
                isZeroHour 
                  ? 'border-l rounded-l-md' 
                  : ''
              } ${
                is23Hour
                  ? 'border-r rounded-r-md pr-1'
                  : position === 23
                  ? ''
                  : 'border-r border-r-gray-300/30'
              } border-t border-t-gray-300 border-b border-b-gray-300`}
            >
              {dateMarker ? (
                <>
                  <span className="text-[10px] font-semibold leading-tight">{dateMarker.month}</span>
                  <span className="text-[10px] font-semibold leading-tight">{dateMarker.day}</span>
                </>
              ) : hourFormat === '12' ? (
                (() => {
                  const { hour, ampm } = convertTo12Hour(actualHour);
                  return (
                    <>
                      <span className="text-[10px] font-medium leading-tight">{hour}</span>
                      <span className="text-[8px] font-normal leading-tight">{ampm}</span>
                    </>
                  );
                })()
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
