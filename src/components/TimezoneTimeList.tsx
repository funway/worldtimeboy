import { useState } from 'react';
import { TimezoneWithOffset } from '../types';
import { TimeScaleConfig } from '../types';
import { TimezoneTimeRow } from './TimezoneTimeRow';

interface TimezoneTimeListProps {
  timezones: TimezoneWithOffset[];
  timeScaleConfigs: Array<{ timezone: TimezoneWithOffset; config: TimeScaleConfig }>;
  hoverPosition: number | null;
  hourFormat: '12' | '24';
  onRemove: (timezoneId: string) => void;
  onSetHome: (timezoneId: string) => void;
  onUpdateLabel?: (timezoneId: string, label: string) => void;
  onReorder: (timezoneIds: string[]) => void;
  onMouseMove: (position: number) => void;
  onMouseLeave: () => void;
}


export function TimezoneTimeList({
  timezones,
  timeScaleConfigs,
  hoverPosition,
  hourFormat,
  onRemove,
  onSetHome,
  onUpdateLabel,
  onReorder,
  onMouseMove,
  onMouseLeave,
}: TimezoneTimeListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (timezones.length === 0) {
    return (
      <div className="flex items-center justify-center p-10 text-gray-500 text-sm">
        <p>No timezones added yet. Search and add timezones above.</p>
      </div>
    );
  }

  const handleDragStart = (index: number) => () => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (dropIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null) return;

    const newOrder = [...timeScaleConfigs];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedItem);
    
    const timezoneIds = newOrder.map(({ timezone }) => timezone.id);
    onReorder(timezoneIds);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleRowDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="relative flex-1 overflow-y-auto">
      <div className="relative overflow-x-visible overflow-y-visible">
        {timeScaleConfigs.map(({ timezone, config }, index) => (
          <TimezoneTimeRow
            key={timezone.id}
            timezone={timezone}
            config={config}
            hoverPosition={hoverPosition}
            hourFormat={hourFormat}
            onRemove={() => onRemove(timezone.id)}
            onSetHome={() => onSetHome(timezone.id)}
            onUpdateLabel={onUpdateLabel ? (label: string) => onUpdateLabel(timezone.id, label) : undefined}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onRowDragEnd={handleRowDragEnd}
            isDragging={draggedIndex === index}
            dragOver={dragOverIndex === index}
            rowIndex={index}
          />
        ))}
      </div>
    </div>
  );
}
