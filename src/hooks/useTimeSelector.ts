import { useState, useCallback } from 'react';
import { TimeRange } from '../types';

export function useTimeSelector() {
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedRange, setSelectedRange] = useState<TimeRange | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);

  const handleMouseMove = useCallback((position: number) => {
    if (!isSelecting) {
      setHoverPosition(position);
    }
  }, [isSelecting]);

  const handleMouseLeave = useCallback(() => {
    if (!isSelecting) {
      setHoverPosition(null);
    }
  }, [isSelecting]);

  const handleClick = useCallback((actualHour: number) => {
    setIsSelecting(true);
    setDragStart(actualHour);
    setDragEnd(actualHour);
  }, []);

  const handleDrag = useCallback((actualHour: number) => {
    if (isSelecting && dragStart !== null) {
      setDragEnd(actualHour);
    }
  }, [isSelecting, dragStart]);

  const finishSelection = useCallback(() => {
    if (isSelecting && dragStart !== null && dragEnd !== null) {
      const start = Math.min(dragStart, dragEnd);
      const end = Math.max(dragStart, dragEnd);
      
      // Create time range
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(start, 0, 0, 0);
      const endTime = new Date(now);
      endTime.setHours(end, 0, 0, 0);
      
      setSelectedRange({
        startTime,
        endTime,
        startHour: start,
        endHour: end,
      });
    }
  }, [isSelecting, dragStart, dragEnd]);

  const handleDragEnd = useCallback(() => {
    if (isSelecting && dragStart !== null && dragEnd !== null) {
      finishSelection();
    }
  }, [finishSelection, isSelecting, dragStart, dragEnd]);

  const handleCancelSelection = useCallback(() => {
    setIsSelecting(false);
    setSelectedRange(null);
    setDragStart(null);
    setDragEnd(null);
    setHoverPosition(null);
  }, []);

  return {
    hoverPosition,
    isSelecting,
    selectedRange,
    dragStart,
    dragEnd,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleDrag,
    handleDragEnd,
    handleCancelSelection,
  };
}
