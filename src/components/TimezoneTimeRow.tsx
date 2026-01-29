import { TimezoneWithOffset } from '../types';
import { TimeScaleConfig } from '../types';
import { TimezoneInfo } from './TimezoneInfo';
import { TimeScale } from './TimeScale';

interface TimezoneTimeRowProps {
  timezone: TimezoneWithOffset;
  config: TimeScaleConfig;
  hoverPosition: number | null;
  hourFormat: '12' | '24';
  onRemove: () => void;
  onSetHome?: () => void;
  onUpdateLabel?: (label: string) => void;
  onMouseMove: (position: number) => void;
  onMouseLeave: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  dragOver?: boolean;
  rowIndex: number;
  onRowDragEnd?: () => void;
}

export function TimezoneTimeRow({
  timezone,
  config,
  hoverPosition,
  hourFormat,
  onRemove,
  onSetHome,
  onUpdateLabel,
  onMouseMove,
  onMouseLeave,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  dragOver,
  rowIndex,
  onRowDragEnd,
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
        onRemove={onRemove}
        onSetHome={onSetHome}
        onUpdateLabel={onUpdateLabel}
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
          hourFormat={hourFormat}
          hoverPosition={hoverPosition}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          rowIndex={rowIndex}
        />
      </div>
    </div>
  );
}
