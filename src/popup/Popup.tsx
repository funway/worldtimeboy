import { Settings } from 'lucide-react';
import { useTimezones } from '../hooks/useTimezones';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useTimeScale } from '../hooks/useTimeScale';
import { useTimeSelector } from '../hooks/useTimeSelector';
import { useStorage } from '../hooks/useStorage';
import { TimezoneTimeList } from '../components/TimezoneTimeList';
import { TimezoneSearch } from '../components/TimezoneSearch';

export function Popup() {
  const { timezones, addTimezone, removeTimezone, reorderTimezones, setHomeTimezone } = useTimezones();
  const { preferences } = useStorage();
  const { currentTimes, currentDate } = useCurrentTime(timezones, preferences);
  const timeScaleConfigs = useTimeScale(currentTimes, currentDate);
  const {
    hoverPosition,
    isSelecting,
    selectedRange,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
    handleDrag,
    handleCancelSelection,
  } = useTimeSelector();

  const handleMouseMoveWrapper = (position: number) => {
    handleMouseMove(position);
  };

  const handleClickWrapper = (actualHour: number) => {
    handleClick(actualHour);
  };

  const handleDragWrapper = (actualHour: number) => {
    handleDrag(actualHour);
  };

  return (
    <div className="w-[800px] max-h-[600px] flex flex-col font-sans antialiased">
      
      <header className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-3 border-b border-gray-200 bg-white gap-3">
        <h1 className="text-lg font-semibold text-primary m-0 whitespace-nowrap">worldtimeboy</h1>
        <TimezoneSearch onAddTimezone={addTimezone} />
        <button className="bg-transparent border-0 cursor-pointer p-1 text-gray-600 flex items-center justify-center transition-colors hover:text-primary" title="Settings">
          <Settings size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-visible bg-white min-w-0">
        <TimezoneTimeList
          timezones={currentTimes}
          timeScaleConfigs={timeScaleConfigs}
          hoverPosition={hoverPosition}
          isSelecting={isSelecting}
          selectedRange={selectedRange}
          onRemove={removeTimezone}
          onSetHome={setHomeTimezone}
          onReorder={reorderTimezones}
          onMouseMove={handleMouseMoveWrapper}
          onMouseLeave={handleMouseLeave}
          onClick={handleClickWrapper}
          onDrag={handleDragWrapper}
          onCancelSelection={handleCancelSelection}
        />
      </main>
    </div>
  );
}
