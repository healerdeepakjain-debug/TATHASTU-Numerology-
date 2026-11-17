import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, CheckCircle2, Compass } from 'lucide-react';
import { CityLocation } from '../types';
import { searchCityGeocode } from '../utils/astrologyAndCities';

export interface SelectedCityResult {
  formattedPob: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
}

interface CityAutocompleteInputProps {
  value: string;
  lat?: number;
  lng?: number;
  onChangeText: (text: string) => void;
  onSelectCity: (result: SelectedCityResult) => void;
  placeholder?: string;
  inputClassName?: string;
  showCoordinatesBadge?: boolean;
  required?: boolean;
}

export const CityAutocompleteInput: React.FC<CityAutocompleteInputProps> = ({
  value,
  lat,
  lng,
  onChangeText,
  onSelectCity,
  placeholder = 'Type first 3 letters of Birth City (e.g. Del, Mum, Jai)...',
  inputClassName,
  showCoordinatesBadge = true,
  required = false,
}) => {
  const [suggestions, setSuggestions] = useState<CityLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract primary city query before comma so typing 3+ letters triggers suggestions
  const primaryQuery = (value || '').split(',')[0].trim();
  const hasMinThreeChars = primaryQuery.length >= 3;

  useEffect(() => {
    let active = true;
    if (!hasMinThreeChars) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      const results = await searchCityGeocode(primaryQuery);
      if (active) {
        setSuggestions(results);
        setHighlightedIndex(0);
        setIsLoading(false);
      }
    }, 120);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [primaryQuery, hasMinThreeChars]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatLocationLabel = (loc: CityLocation): string => {
    const parts = [loc.city];
    if (loc.state && loc.state.toLowerCase() !== loc.city.toLowerCase()) {
      parts.push(loc.state);
    }
    if (loc.country) {
      parts.push(loc.country);
    }
    return parts.join(', ');
  };

  const handleChooseLocation = (loc: CityLocation) => {
    const formattedPob = formatLocationLabel(loc);
    onChangeText(formattedPob);
    onSelectCity({
      formattedPob,
      city: loc.city,
      state: loc.state || '',
      country: loc.country,
      lat: Number(loc.lat.toFixed(4)),
      lng: Number(loc.lng.toFixed(4)),
    });
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' && isOpen && suggestions[highlightedIndex]) {
      e.preventDefault();
      handleChooseLocation(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const displayLat = typeof lat === 'number' && !isNaN(lat) ? lat : 28.6139;
  const displayLng = typeof lng === 'number' && !isNaN(lng) ? lng : 77.209;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className="w-3.5 h-3.5 text-amber-400/75 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          required={required}
          value={value}
          onFocus={() => {
            if (primaryQuery.length >= 3) {
              setIsOpen(true);
            }
          }}
          onChange={(e) => {
            const nextVal = e.target.value;
            onChangeText(nextVal);
            const nextPrimary = nextVal.split(',')[0].trim();
            if (nextPrimary.length >= 3) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={
            inputClassName ||
            'w-full bg-slate-950 border border-amber-500/35 rounded-xl pl-9 pr-8 py-2.5 text-xs text-amber-100 focus:outline-none focus:border-amber-400'
          }
          autoComplete="off"
        />
        <Search className="w-3.5 h-3.5 text-amber-400/50 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Helper & Locked Latitude/Longitude Status */}
      {showCoordinatesBadge && (
        <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[10px]">
          <span className="text-amber-300/80 flex items-center gap-1">
            {primaryQuery.length > 0 && primaryQuery.length < 3 ? (
              <span className="text-amber-400 font-semibold">
                Type {3 - primaryQuery.length} more letter{3 - primaryQuery.length > 1 ? 's' : ''} for City, State & Country suggestions...
              </span>
            ) : (
              <span className="text-emerald-300/90 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>3-Letter City Search Active</span>
              </span>
            )}
          </span>
          <span className="font-mono text-amber-200/90 bg-slate-950/90 px-2 py-0.5 rounded border border-amber-500/25 flex items-center gap-1">
            <Compass className="w-2.5 h-2.5 text-amber-400" />
            <span>
              Lat: {displayLat.toFixed(4)}°{displayLat >= 0 ? 'N' : 'S'}, Lng: {displayLng.toFixed(4)}°{displayLng >= 0 ? 'E' : 'W'}
            </span>
          </span>
        </div>
      )}

      {/* 3-Character Dropdown Suggestions */}
      {isOpen && hasMinThreeChars && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-slate-950 border-2 border-amber-400/70 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800/80">
          <div className="px-3 py-1.5 bg-slate-900/95 text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
            <span>Select 1 Right Birth City (City, State & Country)</span>
            <span className="font-mono text-emerald-300">Exact Lat / Lng</span>
          </div>

          {isLoading && suggestions.length === 0 ? (
            <div className="px-3.5 py-3 text-xs text-amber-200/80 font-mono">
              Searching cities matching "{primaryQuery}"...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-3.5 py-3 text-xs text-slate-400">
              No matching city found for "{primaryQuery}". Try typing the nearest district or city name.
            </div>
          ) : (
            suggestions.map((loc, idx) => {
              const formatted = formatLocationLabel(loc);
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={`${loc.city}-${loc.state}-${loc.country}-${idx}`}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleChooseLocation(loc);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    isHighlighted ? 'bg-amber-500/20' : 'hover:bg-amber-500/15'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="truncate">
                      <div className="text-xs font-bold text-amber-100 truncate">
                        {loc.city}
                        {loc.state ? `, ${loc.state}` : ''}
                      </div>
                      <div className="text-[10px] text-amber-300/80 truncate">
                        {formatted}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-900 border border-emerald-500/40 font-mono text-[10px] text-emerald-300 font-bold">
                      {loc.lat.toFixed(4)}°{loc.lat >= 0 ? 'N' : 'S'}, {loc.lng.toFixed(4)}°{loc.lng >= 0 ? 'E' : 'W'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
