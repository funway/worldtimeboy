import { useTimezones } from '../hooks/useTimezones';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useTimeScale } from '../hooks/useTimeScale';
import { useTimeSelector } from '../hooks/useTimeSelector';
import { useStorage } from '../hooks/useStorage';
import { TimezoneTimeList } from '../components/TimezoneTimeList';
import { TimezoneSearch } from '../components/TimezoneSearch';

export function Popup() {
  const { timezones, addTimezone, removeTimezone, reorderTimezones, setHomeTimezone, updateTimezoneLabel } = useTimezones();
  const { preferences, updatePreferences } = useStorage();
  const { currentTimes, currentDate } = useCurrentTime(timezones, preferences);
  const timeScaleConfigs = useTimeScale(currentTimes, currentDate);
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
        <h1 className="text-lg font-semibold text-primary m-0 whitespace-nowrap">worldtimeboy</h1>
        <div className="flex justify-center">
          <TimezoneSearch onAddTimezone={addTimezone} />
        </div>
        <div className="flex items-center border border-gray-300 rounded overflow-hidden">
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
        />
      </main>
    </div>
  );
}
