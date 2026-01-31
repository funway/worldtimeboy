import { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { UserPreferences } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences | null;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  loading: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  loading,
}: SettingsModalProps) {
  const currentFormat = preferences?.hourFormat || '24';
  const showUtcOffset = preferences?.showUtcOffset !== false; // Default true

  // Dynamically adjust popup window height when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Calculate required height: header (~60px) + modal content (~220px) + some padding
      const requiredHeight = 280;
      const currentHeight = document.documentElement.scrollHeight;
      const newHeight = Math.max(currentHeight, requiredHeight);
      
      // Set popup height via document.body.style.height
      document.body.style.height = `${newHeight}px`;
    } else {
      // Reset height when modal closes
      document.body.style.height = '';
    }

    return () => {
      // Cleanup: reset height when component unmounts
      if (!isOpen) {
        document.body.style.height = '';
      }
    };
  }, [isOpen]);

  const handleToggleHourFormat = (format: '12' | '24') => {
    onUpdatePreferences({ 
      hourFormat: format,
      showUtcOffset: showUtcOffset 
    });
  };

  const handleToggleUtcOffset = () => {
    onUpdatePreferences({ 
      hourFormat: currentFormat,
      showUtcOffset: !showUtcOffset 
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-lg shadow-xl w-[320px] max-w-[90vw] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-gray-600" />
              <h2 className="text-base font-semibold text-gray-900">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Close"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-4 py-3 space-y-4">
            {/* UTC Offset Toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-gray-900 block">
                  UTC Offset
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Show UTC offset badge
                </p>
              </div>
              {loading ? (
                <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              ) : (
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={showUtcOffset}
                    onChange={handleToggleUtcOffset}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              )}
            </div>

            {/* Hour Format Switch */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-gray-900 block">
                  Hour Format
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  12-hour or 24-hour format
                </p>
              </div>
              {loading ? (
                <div className="flex items-center border border-gray-300 rounded overflow-hidden flex-shrink-0">
                  <div className="px-2.5 py-1 text-sm font-medium invisible">12</div>
                  <div className="w-px bg-gray-300"></div>
                  <div className="px-2.5 py-1 text-sm font-medium invisible">24</div>
                </div>
              ) : (
                <div className="flex items-center border border-gray-300 rounded overflow-hidden flex-shrink-0">
                  <button
                    className={`px-2.5 py-1 text-sm font-medium transition-colors ${
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
                    className={`px-2.5 py-1 text-sm font-medium transition-colors ${
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
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
