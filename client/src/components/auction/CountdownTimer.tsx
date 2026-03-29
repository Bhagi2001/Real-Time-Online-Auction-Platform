import React from 'react';
import { useCountdown } from '../../hooks';

interface CountdownTimerProps {
  endTime: string | Date;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, size = 'md', showLabels = true }) => {
  const { days, hours, minutes, seconds, total } = useCountdown(endTime);
  const isUrgent = total > 0 && total < 3600000;
  const isEnded = total <= 0;

  if (isEnded) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-lg font-bold">Auction Ended</span>
      </div>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');

  const units = [
    { value: pad(days), label: 'Days' },
    { value: pad(hours), label: 'Hours' },
    { value: pad(minutes), label: 'Mins' },
    { value: pad(seconds), label: 'Secs' },
  ].filter((_, i) => days > 0 || i > 0);

  const boxSizes = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <div className={`flex items-center gap-2 ${isUrgent ? 'animate-countdown-pulse' : ''}`}>
      {units.map((unit, i) => (
        <React.Fragment key={unit.label}>
          <div className="flex flex-col items-center">
            <div className={`${boxSizes[size]} flex items-center justify-center rounded-xl font-bold ${
              isUrgent
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                : 'bg-secondary text-white'
            }`}>
              {unit.value}
            </div>
            {showLabels && <span className="text-xs text-gray-500 mt-1">{unit.label}</span>}
          </div>
          {i < units.length - 1 && (
            <span className={`text-xl font-bold mb-4 ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>:</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
