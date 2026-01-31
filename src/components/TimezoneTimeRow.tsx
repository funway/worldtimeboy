import { TimezoneWithOffset } from '../types';
import { TimeScaleConfig } from '../types';
import { TimezoneInfo } from './TimezoneInfo';
import { TimeScale } from './TimeScale';

interface TimezoneTimeRowProps {
  timezone: TimezoneWithOffset;
  config: TimeScaleConfig;
  hoverPosition: number | null;
  hourFormat: '12' | '24';
  showUtcOffset?: boolean;
  onRemove: () => void;
  onSetHome?: () => void;
  onUpdateLabel?: (label: string) => void;
  onMouseMove: (position: number) => void;
  onMouseLeave: () => void;
  onClick?: (position: number) => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  dragOver?: boolean;
  rowIndex: number;
  onRowDragEnd?: () => void;
  timeScaleRef?: React.RefObject<HTMLDivElement>;
  isCustomTime?: boolean;
}

export function TimezoneTimeRow({
  timezone,
  config,
  hoverPosition,
  hourFormat,
  showUtcOffset = true,
  onRemove,
  onSetHome,
  onUpdateLabel,
  onMouseMove,
  onMouseLeave,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  dragOver,
  rowIndex,
  onRowDragEnd,
  timeScaleRef,
  isCustomTime = false,
}: TimezoneTimeRowProps) {
  // 单数行（index 0, 2, 4...）白色，双数行（index 1, 3, 5...）浅灰色
  const bgColor = rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50';
  
  return (
    <div 
      className={`grid grid-cols-[20%_80%] relative ${bgColor} transition-colors`}
      onDragEnd={onRowDragEnd}
    >
      <TimezoneInfo
        timezone={timezone}
        hourFormat={hourFormat}
        showUtcOffset={showUtcOffset}
        onRemove={onRemove}
        onSetHome={onSetHome}
        onUpdateLabel={onUpdateLabel}
        isDragging={isDragging}
        dragOver={dragOver}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        isCustomTime={isCustomTime}
      />
      <div ref={timeScaleRef} className="relative overflow-x-visible overflow-y-visible min-w-0">
        <TimeScale
          config={config}
          timezone={timezone.timezone}
          currentTime={timezone.currentTime}
          hourFormat={hourFormat}
          hoverPosition={hoverPosition}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
          rowIndex={rowIndex}
        />
      </div>
    </div>
  );
}
