import { useState } from 'react';
import { useTimezones } from '../hooks/useTimezones';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useTimeScale } from '../hooks/useTimeScale';
import { useTimeSelector } from '../hooks/useTimeSelector';
import { useStorage } from '../hooks/useStorage';
import { TimezoneTimeList } from '../components/TimezoneTimeList';
import { TimezoneSearch } from '../components/TimezoneSearch';

export function Popup() {
  const { timezones, addTimezone, removeTimezone, reorderTimezones, setHomeTimezone, updateTimezoneLabel } = useTimezones();
  const { preferences, updatePreferences, loading } = useStorage();
  const [customTime, setCustomTime] = useState<Date | null>(null);
  const { currentTimes, currentDate } = useCurrentTime(timezones, preferences, customTime);
  const timeScaleConfigs = useTimeScale(currentTimes, currentDate);
  
  // Find home timezone
  const homeTimezone = timezones.find(tz => tz.isHome)?.timezone;
  const {
    hoverPosition,
    handleMouseMove,
    handleMouseLeave,
  } = useTimeSelector();

  const handleToggleHourFormat = (format: '12' | '24') => {
    updatePreferences({ hourFormat: format });
  };

  const currentFormat = preferences?.hourFormat || '24';

  return (
    <div className="w-[800px] max-h-[600px] flex flex-col font-sans antialiased">
      
      <header className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-3 border-b border-gray-200 bg-white gap-3">
        <h1 className="text-lg m-0 whitespace-nowrap flex items-baseline">
          <span className="font-bold text-primary" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkboard", "Segoe Print", cursive' }}>worldtime</span>
          <span className="font-light text-primary">boy</span>
        </h1>
        <div className="flex justify-center">
          <TimezoneSearch 
            onAddTimezone={addTimezone}
            homeTimezone={homeTimezone}
            onTimeChange={setCustomTime}
          />
        </div>
        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
          {loading ? (
            // Placeholder to maintain layout during loading - invisible but maintains size
            <>
              <div className="px-3 py-1 text-sm font-medium invisible">
                12
              </div>
              <div className="w-px bg-gray-300"></div>
              <div className="px-3 py-1 text-sm font-medium invisible">
                24
              </div>
            </>
          ) : (
            <>
              <button
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currentFormat === '12'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleToggleHourFormat('12')}
                title="12-hour format"
              >
                12
              </button>
              <div className="w-px bg-gray-300"></div>
              <button
                className={`px-3 py-1 text-sm font-medium transition-colors ${
                  currentFormat === '24'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => handleToggleHourFormat('24')}
                title="24-hour format"
              >
                24
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-visible bg-white min-w-0">
        <TimezoneTimeList
          timezones={currentTimes}
          timeScaleConfigs={timeScaleConfigs}
          hoverPosition={hoverPosition}
          hourFormat={currentFormat}
          onRemove={removeTimezone}
          onSetHome={setHomeTimezone}
          onUpdateLabel={updateTimezoneLabel}
          onReorder={reorderTimezones}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          isCustomTime={customTime !== null}
        />
      </main>
    </div>
  );
}
