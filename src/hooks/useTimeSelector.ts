import { useState, useCallback } from 'react';

export function useTimeSelector() {
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);

  const handleMouseMove = useCallback((position: number) => {
    setHoverPosition(position);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
  }, []);

  return {
    hoverPosition,
    handleMouseMove,
    handleMouseLeave,
  };
}
