import { TimezoneWithOffset, TimeRange } from '../types';
import { TimeScaleConfig } from '../types';
import { TimezoneInfo } from './TimezoneInfo';
import { TimeScale } from './TimeScale';

interface TimezoneTimeRowProps {
  timezone: TimezoneWithOffset;
  config: TimeScaleConfig;
  hoverPosition: number | null;
  isSelecting: boolean;
  selectedRange: TimeRange | null;
  onRemove: () => void;
  onSetHome?: () => void;
  onMouseMove: (position: number) => void;
  onMouseLeave: () => void;
  onClick: (actualHour: number) => void;
  onDrag: (actualHour: number) => void;
  onDragEnd: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  dragOver?: boolean;
  rowIndex: number;
}

export function TimezoneTimeRow({
  timezone,
  config,
  hoverPosition,
  isSelecting,
  selectedRange,
  onRemove,
  onSetHome,
  onMouseMove,
  onMouseLeave,
  onClick,
  onDrag,
  onDragEnd,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  dragOver,
  rowIndex,
}: TimezoneTimeRowProps) {
  // 单数行（index 0, 2, 4...）白色，双数行（index 1, 3, 5...）浅灰色
  const bgColor = rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  
  return (
    <div className={`grid grid-cols-[25%_75%] relative ${bgColor} transition-colors`}>
      <TimezoneInfo
        timezone={timezone}
        selectedRange={selectedRange}
        onRemove={onRemove}
        onSetHome={onSetHome}
        isDragging={isDragging}
        dragOver={dragOver}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
      />
      <div className="relative overflow-x-visible overflow-y-visible min-w-0">
        <TimeScale
          config={config}
          timezone={timezone.timezone}
          currentTime={timezone.currentTime}
          hoverPosition={hoverPosition}
          isSelecting={isSelecting}
          selectedRange={selectedRange ? { startHour: selectedRange.startHour, endHour: selectedRange.endHour } : null}
          onMouseMove={(position) => onMouseMove(position)}
          onMouseLeave={onMouseLeave}
          onClick={(actualHour) => onClick(actualHour)}
          onDrag={(actualHour) => onDrag(actualHour)}
          onDragEnd={onDragEnd}
          rowIndex={rowIndex}
        />
      </div>
    </div>
  );
}
