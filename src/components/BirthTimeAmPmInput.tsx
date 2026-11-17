import React from 'react';
import { Clock } from 'lucide-react';

export interface BirthTimeAmPmInputProps {
  value: string;
  onChange: (newTob24: string) => void;
  className?: string;
  compact?: boolean;
}

/**
 * Formats a 24-hour "HH:mm" string (e.g., "09:30" or "14:20") into a clear
 * 12-hour AM / PM display string (e.g., "09:30 AM" or "02:20 PM").
 */
export function formatTime12HourAmPm(tob24?: string): string {
  const clean = (tob24 || '09:30').trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '09:30 AM';

  let h24 = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (isNaN(h24) || h24 < 0 || h24 > 23) h24 = 9;
  const minVal = isNaN(m) || m < 0 || m > 59 ? 30 : m;

  const period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  return `${String(h12).padStart(2, '0')}:${String(minVal).padStart(2, '0')} ${period}`;
}

export function parse24HourTo12HourParts(tob24?: string): {
  hour12: number;
  minute: number;
  period: 'AM' | 'PM';
} {
  const clean = (tob24 || '09:30').trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (!match) {
    return { hour12: 9, minute: 30, period: 'AM' };
  }
  let h24 = parseInt(match[1], 10);
  let m = parseInt(match[2], 10);
  if (isNaN(h24) || h24 < 0 || h24 > 23) h24 = 9;
  if (isNaN(m) || m < 0 || m > 59) m = 30;

  const period: 'AM' | 'PM' = h24 >= 12 ? 'PM' : 'AM';
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;

  return { hour12, minute: m, period };
}

export function build24HourFrom12HourParts(
  hour12: number,
  minute: number,
  period: 'AM' | 'PM'
): string {
  let h24 = hour12 % 12;
  if (period === 'PM') {
    h24 += 12;
  }
  return `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_60 = Array.from({ length: 60 }, (_, i) => i);

export const BirthTimeAmPmInput: React.FC<BirthTimeAmPmInputProps> = ({
  value,
  onChange,
  className = '',
  compact = false,
}) => {
  const { hour12, minute, period } = parse24HourTo12HourParts(value);

  const handleHourChange = (newHour12: number) => {
    onChange(build24HourFrom12HourParts(newHour12, minute, period));
  };

  const handleMinuteChange = (newMinute: number) => {
    onChange(build24HourFrom12HourParts(hour12, newMinute, period));
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    onChange(build24HourFrom12HourParts(hour12, minute, newPeriod));
  };

  return (
    <div
      className={`w-full flex items-center justify-between gap-1.5 bg-slate-950 border border-amber-500/35 rounded-xl px-2.5 ${
        compact ? 'h-[38px]' : 'h-[42px]'
      } ${className}`}
    >
      <div className="flex items-center gap-1 min-w-0">
        <Clock className="w-3.5 h-3.5 text-amber-400/90 shrink-0" />

        {/* 12-Hour Selector (01 to 12) */}
        <select
          aria-label="Birth Hour (1 to 12)"
          value={hour12}
          onChange={(e) => handleHourChange(Number(e.target.value))}
          className="bg-slate-900 border border-amber-500/30 rounded-lg px-1.5 py-0.5 text-xs font-mono font-bold text-amber-100 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          {HOURS_12.map((h) => (
            <option key={h} value={h}>
              {String(h).padStart(2, '0')}
            </option>
          ))}
        </select>

        <span className="text-amber-400 font-mono font-black text-xs">:</span>

        {/* Minute Selector (00 to 59) */}
        <select
          aria-label="Birth Minute (00 to 59)"
          value={minute}
          onChange={(e) => handleMinuteChange(Number(e.target.value))}
          className="bg-slate-900 border border-amber-500/30 rounded-lg px-1.5 py-0.5 text-xs font-mono font-bold text-amber-100 focus:outline-none focus:border-amber-400 cursor-pointer"
        >
          {MINUTES_60.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, '0')}
            </option>
          ))}
        </select>
      </div>

      {/* Explicit AM / PM Toggle Buttons */}
      <div className="inline-flex items-center rounded-lg bg-slate-900 p-0.5 border border-amber-500/35 shrink-0">
        <button
          type="button"
          onClick={() => handlePeriodChange('AM')}
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black transition-all cursor-pointer ${
            period === 'AM'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-amber-300/75 hover:text-amber-100'
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => handlePeriodChange('PM')}
          className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black transition-all cursor-pointer ${
            period === 'PM'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-amber-300/75 hover:text-amber-100'
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
};
