import { useState } from 'react';
import { Settings } from 'lucide-react';
import { useTimezones } from '../hooks/useTimezones';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { useTimeScale } from '../hooks/useTimeScale';
import { useTimeSelector } from '../hooks/useTimeSelector';
import { useStorage } from '../hooks/useStorage';
import { TimezoneTimeList } from '../components/TimezoneTimeList';
import { TimezoneSearch } from '../components/TimezoneSearch';
import { SettingsModal } from '../components/SettingsModal';

export function Popup() {
  const { timezones, addTimezone, removeTimezone, reorderTimezones, setHomeTimezone, updateTimezoneLabel } = useTimezones();
  const { preferences, updatePreferences, loading } = useStorage();
  const [customTime, setCustomTime] = useState<Date | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { currentTimes, currentDate } = useCurrentTime(timezones, preferences, customTime);
  const timeScaleConfigs = useTimeScale(currentTimes, currentDate);
  
  // Find home timezone
  const homeTimezone = timezones.find(tz => tz.isHome)?.timezone;
  const {
    hoverPosition,
    handleMouseMove,
    handleMouseLeave,
  } = useTimeSelector();

  const currentFormat = preferences?.hourFormat || '24';
  const showUtcOffset = preferences?.showUtcOffset !== false; // Default true

  return (
    <div className="w-[800px] max-h-[600px] flex flex-col font-sans antialiased">
      
      <header className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-3 border-b border-gray-200 bg-white gap-3">
        {/* Title */}
        <h1 className="text-lg m-0 whitespace-nowrap flex items-baseline">
          <span className="font-bold text-primary" style={{ fontFamily: '"Comic Sans MS", "Marker Felt", "Chalkboard", "Segoe Print", cursive' }}>worldtime</span>
          <span className="font-light text-primary">boy</span>
        </h1>

        {/* Search bar */}
        <div className="flex justify-center">
          <TimezoneSearch 
            onAddTimezone={addTimezone}
            homeTimezone={homeTimezone}
            onTimeChange={setCustomTime}
          />
        </div>
        
        {/* Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          title="Settings"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-visible bg-white min-w-0">
        <TimezoneTimeList
          timezones={currentTimes}
          timeScaleConfigs={timeScaleConfigs}
          hoverPosition={hoverPosition}
          hourFormat={currentFormat}
          showUtcOffset={showUtcOffset}
          onRemove={removeTimezone}
          onSetHome={setHomeTimezone}
          onUpdateLabel={updateTimezoneLabel}
          onReorder={reorderTimezones}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          isCustomTime={customTime !== null}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={updatePreferences}
        loading={loading}
      />
    </div>
  );
}
