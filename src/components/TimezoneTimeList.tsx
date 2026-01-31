import { useState, useRef, useEffect, useCallback } from 'react';
import { TimezoneWithOffset } from '../types';
import { TimeScaleConfig } from '../types';
import { TimezoneTimeRow } from './TimezoneTimeRow';

interface TimezoneTimeListProps {
  timezones: TimezoneWithOffset[];
  timeScaleConfigs: Array<{ timezone: TimezoneWithOffset; config: TimeScaleConfig }>;
  hoverPosition: number | null;
  hourFormat: '12' | '24';
  showUtcOffset?: boolean;
  onRemove: (timezoneId: string) => void;
  onSetHome: (timezoneId: string) => void;
  onUpdateLabel?: (timezoneId: string, label: string) => void;
  onReorder: (timezoneIds: string[]) => void;
  onMouseMove: (position: number) => void;
  onMouseLeave: () => void;
  isCustomTime?: boolean;
}


export function TimezoneTimeList({
  timezones,
  timeScaleConfigs,
  hoverPosition,
  hourFormat,
  showUtcOffset = true,
  onRemove,
  onSetHome,
  onUpdateLabel,
  onReorder,
  onMouseMove,
  onMouseLeave,
  isCustomTime = false,
}: TimezoneTimeListProps) {
  // All state hooks first
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [overlayStyle, setOverlayStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPosition, setStartPosition] = useState<number | null>(null);
  const [endPosition, setEndPosition] = useState<number | null>(null);
  const [draggingBorder, setDraggingBorder] = useState<'left' | 'right' | null>(null);
  const [selectionStyle, setSelectionStyle] = useState<{
    left: number;
    width: number;
    top: number;
    height: number;
    leftBorder: number;
    rightBorder: number;
    timescaleAreaLeft: number;
    timescaleAreaWidth: number;
  } | null>(null);

  // All refs next
  const containerRef = useRef<HTMLDivElement>(null);
  const firstTimeScaleRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef<number | null>(null);
  const endPositionRef = useRef<number | null>(null);
  const draggingBorderRef = useRef<'left' | 'right' | null>(null);
  const isSelectingRef = useRef(false);
  const isDraggingRef = useRef(false);
  
  // Cache for cell dimensions to avoid recalculating on every hover
  const [cachedDimensions, setCachedDimensions] = useState<{
    timeScaleRect: DOMRect;
    containerRect: DOMRect;
    padding: number;
    paddingLeft: number;
    paddingRight: number;
    cellWidth: number;
    verticalPadding: number;
  } | null>(null);

  // Helper function to calculate cell dimensions
  // Using useCallback to ensure stable reference
  const getCellDimensions = useCallback(() => {
    if (!firstTimeScaleRef.current || !containerRef.current) {
      return null;
    }

    const timeScaleElement = firstTimeScaleRef.current.querySelector('.time-scale') as HTMLElement;
    if (!timeScaleElement) {
      return null;
    }

    const timeScaleRect = timeScaleElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Read actual padding from computed styles instead of hardcoding
    const computedStyle = window.getComputedStyle(timeScaleElement);
    const paddingLeft = parseFloat(computedStyle.paddingLeft);
    const paddingRight = parseFloat(computedStyle.paddingRight);
    const padding = paddingLeft; // Use left padding as reference (assuming symmetric)
    
    const cellAreaWidth = timeScaleRect.width - (paddingLeft + paddingRight);
    const cellWidth = cellAreaWidth / 24;
    const verticalPadding = 4;
    
    return {
      timeScaleRect,
      containerRect,
      padding,
      paddingLeft,
      paddingRight,
      cellWidth,
      verticalPadding,
    };
  }, []);

  // Recalculate dimensions only when timeScaleConfigs change or on resize
  useEffect(() => {
    const updateDimensions = () => {
      const dims = getCellDimensions();
      if (dims) {
        setCachedDimensions(dims);
      }
    };

    // Initial calculation
    updateDimensions();

    // Use ResizeObserver to detect size changes
    const timeScaleElement = firstTimeScaleRef.current?.querySelector('.time-scale') as HTMLElement;
    const containerElement = containerRef.current;

    if (!timeScaleElement || !containerElement) return;

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(timeScaleElement);
    resizeObserver.observe(containerElement);

    // Also listen to window resize as fallback
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, [timeScaleConfigs.length, getCellDimensions]);

  // Calculate overlay position and size when hoverPosition changes
  useEffect(() => {
    if (hoverPosition === null || isSelecting) {
      setOverlayStyle(null);
      return;
    }

    // Use cached dimensions instead of recalculating on every hover
    const dims = cachedDimensions;
    if (!dims) {
      setOverlayStyle(null);
      return;
    }

    const { timeScaleRect, containerRect, paddingLeft, cellWidth, verticalPadding } = dims;
    
    // Calculate overlay position relative to container
    const overlayLeft = timeScaleRect.left - containerRect.left + paddingLeft + (hoverPosition * cellWidth);
    const overlayWidth = cellWidth;
    const overlayTop = verticalPadding;
    const overlayHeight = containerRect.height - (verticalPadding * 2);
    
    setOverlayStyle({
      left: overlayLeft,
      width: overlayWidth,
      top: overlayTop,
      height: overlayHeight,
    });
  }, [hoverPosition, isSelecting, cachedDimensions]);

  useEffect(() => {
    if (!isSelecting || startPosition === null || endPosition === null) {
      setSelectionStyle(null);
      return;
    }

    // Use cached dimensions instead of recalculating
    const dims = cachedDimensions;
    if (!dims) {
      setSelectionStyle(null);
      return;
    }

    const { timeScaleRect, containerRect, paddingLeft, cellWidth, verticalPadding } = dims;
    
    // Ensure start <= end
    const minPos = Math.min(startPosition, endPosition);
    const maxPos = Math.max(startPosition, endPosition);
    
    // Calculate selection area
    const selectionLeft = timeScaleRect.left - containerRect.left + paddingLeft + (minPos * cellWidth);
    const selectionWidth = (maxPos - minPos + 1) * cellWidth;
    const selectionTop = verticalPadding;
    const selectionHeight = containerRect.height - (verticalPadding * 2);
    
    // Calculate border positions
    const leftBorder = selectionLeft;
    const rightBorder = selectionLeft + selectionWidth;
    
    // Calculate timescale area (for full overlay)
    const timescaleAreaLeft = timeScaleRect.left - containerRect.left;
    const timescaleAreaWidth = timeScaleRect.width;
    
    setSelectionStyle({
      left: selectionLeft,
      width: selectionWidth,
      top: selectionTop,
      height: selectionHeight,
      leftBorder,
      rightBorder,
      timescaleAreaLeft,
      timescaleAreaWidth,
    });
  }, [isSelecting, startPosition, endPosition, cachedDimensions]);

  // Sync refs with state
  useEffect(() => {
    startPositionRef.current = startPosition;
    endPositionRef.current = endPosition;
    draggingBorderRef.current = draggingBorder;
    isSelectingRef.current = isSelecting;
  }, [startPosition, endPosition, draggingBorder, isSelecting]);

  // Handle mouse move during selection (for dragging borders)
  const handleSelectionMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isSelectingRef.current || !firstTimeScaleRef.current) return;

    const timeScaleElement = firstTimeScaleRef.current.querySelector('.time-scale') as HTMLElement;
    if (!timeScaleElement) return;

    // Use cached dimensions if available, otherwise calculate on the fly
    const dims = cachedDimensions;
    if (!dims) {
      // Fallback: calculate if cache is not available
      const rect = timeScaleElement.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(timeScaleElement);
      const paddingLeft = parseFloat(computedStyle.paddingLeft);
      const paddingRight = parseFloat(computedStyle.paddingRight);
      const cellAreaWidth = rect.width - (paddingLeft + paddingRight);
      const cellWidth = cellAreaWidth / 24;
      const x = e.clientX - rect.left - paddingLeft;
      const position = Math.max(0, Math.min(23, Math.floor(x / cellWidth)));
      
      const currentStart = startPositionRef.current;
      const currentEnd = endPositionRef.current;
      const currentDraggingBorder = draggingBorderRef.current;

      if (currentDraggingBorder === 'left') {
        if (currentStart !== null && currentEnd !== null) {
          const newStart = Math.min(position, currentEnd);
          if (currentEnd - newStart >= 0) {
            setStartPosition(newStart);
          }
        }
      } else if (currentDraggingBorder === 'right') {
        if (currentStart !== null && currentEnd !== null) {
          const newEnd = Math.max(position, currentStart);
          if (newEnd - currentStart >= 0) {
            setEndPosition(newEnd);
          }
        }
      }
      return;
    }

    // Use cached dimensions - only recalculate rect for mouse position
    const rect = timeScaleElement.getBoundingClientRect();
    const { paddingLeft, cellWidth } = dims;
    const x = e.clientX - rect.left - paddingLeft;
    const position = Math.max(0, Math.min(23, Math.floor(x / cellWidth)));

    const currentStart = startPositionRef.current;
    const currentEnd = endPositionRef.current;
    const currentDraggingBorder = draggingBorderRef.current;

    if (currentDraggingBorder === 'left') {
      // Ensure left border doesn't cross right border and minimum width is 1 cell
      if (currentStart !== null && currentEnd !== null) {
        const newStart = Math.min(position, currentEnd);
        if (currentEnd - newStart >= 0) {
          setStartPosition(newStart);
        }
      }
    } else if (currentDraggingBorder === 'right') {
      // Ensure right border doesn't cross left border and minimum width is 1 cell
      if (currentStart !== null && currentEnd !== null) {
        const newEnd = Math.max(position, currentStart);
        if (newEnd - currentStart >= 0) {
          setEndPosition(newEnd);
        }
      }
    }
    // Removed: auto-update endPosition on hover - only allow dragging borders
  }, [cachedDimensions]);

  // Handle mouse up to stop dragging
  const handleSelectionMouseUp = useCallback(() => {
    setDraggingBorder(null);
    // Use setTimeout to prevent click event from firing immediately after drag
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 100);
  }, []);

  // Global mouse event listeners for dragging
  useEffect(() => {
    if (draggingBorder) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleSelectionMouseMove(e);
      };
      
      const handleGlobalMouseUp = () => {
        handleSelectionMouseUp();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [draggingBorder, handleSelectionMouseMove, handleSelectionMouseUp]);

  // Handle click outside to cancel selection
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSelecting && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelecting(false);
        setStartPosition(null);
        setEndPosition(null);
        setDraggingBorder(null);
      }
    };

    if (isSelecting) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSelecting]);

  // Handle click on TimeScale to start or cancel selection
  const handleTimeScaleClick = (position: number) => {
    if (isSelecting) {
      // Cancel selection if already selecting
      setIsSelecting(false);
      setStartPosition(null);
      setEndPosition(null);
      setDraggingBorder(null);
    } else {
      // Start new selection
      setIsSelecting(true);
      setStartPosition(position);
      setEndPosition(position);
    }
  };

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
    <div ref={containerRef} className="relative flex-1 overflow-y-auto">
      <div className="relative overflow-x-visible overflow-y-visible">
        {/* Timezone time rows */}
        {timeScaleConfigs.map(({ timezone, config }, index) => (
          <TimezoneTimeRow
            key={timezone.id}
            timezone={timezone}
            config={config}
            hoverPosition={hoverPosition}
            hourFormat={hourFormat}
            showUtcOffset={showUtcOffset}
            onRemove={() => onRemove(timezone.id)}
            onSetHome={() => onSetHome(timezone.id)}
            onUpdateLabel={onUpdateLabel ? (label: string) => onUpdateLabel(timezone.id, label) : undefined}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onClick={handleTimeScaleClick}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver(index)}
            onDrop={handleDrop(index)}
            onRowDragEnd={handleRowDragEnd}
            isDragging={draggedIndex === index}
            dragOver={dragOverIndex === index}
            rowIndex={index}
            timeScaleRef={index === 0 ? firstTimeScaleRef : undefined}
            isCustomTime={isCustomTime}
          />
        ))}

        {/* Vertical highlight overlay */}
        {overlayStyle && hoverPosition !== null && !isSelecting && (
          <div
            className="absolute pointer-events-none z-10 border-2 border-primary opacity-50 rounded-md"
            style={{
              left: `${overlayStyle.left}px`,
              width: `${overlayStyle.width}px`,
              top: `${overlayStyle.top}px`,
              height: `${overlayStyle.height}px`,
            }}
          />
        )}
        
        {/* Full screen overlay when selecting */}
        {isSelecting && selectionStyle && (
          <>
            {/* Semi-transparent overlay covering all timescales - left part */}
            {selectionStyle.left > selectionStyle.timescaleAreaLeft && (
              <div
                className="absolute bg-black opacity-60 z-20 cursor-pointer"
                style={{
                  left: `${selectionStyle.timescaleAreaLeft}px`,
                  width: `${selectionStyle.left - selectionStyle.timescaleAreaLeft}px`,
                  top: `${selectionStyle.top}px`,
                  height: `${selectionStyle.height}px`,
                }}
                onClick={() => {
                  // Don't cancel if we just finished dragging
                  if (!isDraggingRef.current) {
                    setIsSelecting(false);
                    setStartPosition(null);
                    setEndPosition(null);
                    setDraggingBorder(null);
                  }
                }}
              />
            )}
            
            {/* Semi-transparent overlay covering all timescales - right part */}
            {selectionStyle.left + selectionStyle.width < selectionStyle.timescaleAreaLeft + selectionStyle.timescaleAreaWidth && (
              <div
                className="absolute bg-black opacity-60 z-20 cursor-pointer"
                style={{
                  left: `${selectionStyle.left + selectionStyle.width}px`,
                  width: `${(selectionStyle.timescaleAreaLeft + selectionStyle.timescaleAreaWidth) - (selectionStyle.left + selectionStyle.width)}px`,
                  top: `${selectionStyle.top}px`,
                  height: `${selectionStyle.height}px`,
                }}
                onClick={() => {
                  // Don't cancel if we just finished dragging
                  if (!isDraggingRef.current) {
                    setIsSelecting(false);
                    setStartPosition(null);
                    setEndPosition(null);
                    setDraggingBorder(null);
                  }
                }}
              />
            )}
            
            {/* Selection area - transparent background with highlighted borders */}
            <div
              className="absolute z-30 rounded-md cursor-pointer"
              style={{
                left: `${selectionStyle.left}px`,
                width: `${selectionStyle.width}px`,
                top: `${selectionStyle.top}px`,
                height: `${selectionStyle.height}px`,
                backgroundColor: 'transparent',
              }}
              onClick={(e) => {
                // Don't cancel if we just finished dragging or clicking on borders
                const target = e.target as HTMLElement;
                if (!target.closest('[data-draggable-border]') && !isDraggingRef.current) {
                  setIsSelecting(false);
                  setStartPosition(null);
                  setEndPosition(null);
                  setDraggingBorder(null);
                }
              }}
            >
              {/* Left draggable border */}
              <div
                data-draggable-border="left"
                className="absolute top-0 bottom-0 bg-primary cursor-ew-resize hover:opacity-80 z-40 transition-opacity"
                style={{
                  left: '0px',
                  width: '2px',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  isDraggingRef.current = true;
                  setDraggingBorder('left');
                }}
              />
              
              {/* Right draggable border */}
              <div
                data-draggable-border="right"
                className="absolute top-0 bottom-0 bg-primary cursor-ew-resize hover:opacity-80 z-40 transition-opacity"
                style={{
                  right: '0px',
                  width: '2px',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  isDraggingRef.current = true;
                  setDraggingBorder('right');
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
