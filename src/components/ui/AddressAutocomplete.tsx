'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/Input';

interface AddressSuggestion {
  display_name: string;
  place_id: number;
}

interface AddressAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
}

export function AddressAutocomplete({
  label = 'Address',
  value,
  onChange,
  error,
  placeholder = 'Enter Address',
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [manualFields, setManualFields] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=0`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        },
      );

      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      const data = (await response.json()) as AddressSuggestion[];
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (isManual) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 350);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions, isManual]);

  // Sync external value changes
  useEffect(() => {
    if (!isManual) {
      setQuery(value);
    }
  }, [value, isManual]);

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleManualChange = (field: keyof typeof manualFields, val: string) => {
    const next = { ...manualFields, [field]: val };
    setManualFields(next);

    const parts = [
      next.street,
      next.city,
      next.state,
      next.postalCode,
      next.country,
    ].filter((p) => p.trim() !== '');

    onChange(parts.join(', '));
  };

  return (
    <div ref={containerRef} className='relative'>
      {!isManual ? (
        <>
          <Input
            label={label}
            value={query}
            onChange={(event) => {
              const newValue = event.target.value;
              setQuery(newValue);
              onChange(newValue);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            error={error}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className='absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-950'>
              {suggestions.map((suggestion) => (
                <li key={suggestion.place_id}>
                  <button
                    type='button'
                    className='w-full px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    onClick={() => {
                      setQuery(suggestion.display_name);
                      onChange(suggestion.display_name);
                      setShowSuggestions(false);
                    }}>
                    {suggestion.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <div className='space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50'>
          <p className='text-sm font-medium text-slate-900 dark:text-slate-50'>
            Enter Address Manually
          </p>
          <Input
            label='Street Address'
            placeholder='Enter Street Address'
            value={manualFields.street}
            onChange={(e) => handleManualChange('street', e.target.value)}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='City'
              placeholder='Enter City'
              value={manualFields.city}
              onChange={(e) => handleManualChange('city', e.target.value)}
            />
            <Input
              label='State/Province'
              placeholder='Enter State'
              value={manualFields.state}
              onChange={(e) => handleManualChange('state', e.target.value)}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Postal Code'
              placeholder='Enter Postal Code'
              value={manualFields.postalCode}
              onChange={(e) => handleManualChange('postalCode', e.target.value)}
            />
            <Input
              label='Country'
              placeholder='Enter Country'
              value={manualFields.country}
              onChange={(e) => handleManualChange('country', e.target.value)}
            />
          </div>
          {error && <p className='text-xs text-rose-500'>{error}</p>}
        </div>
      )}

      <div className='mt-2 flex items-center gap-2'>
        <label className='flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400'>
          <input
            type='checkbox'
            checked={isManual}
            onChange={(event) => {
              const isChecked = event.target.checked;
              setIsManual(isChecked);
              if (isChecked) {
                setSuggestions([]);
                setShowSuggestions(false);
                // Pre-fill manual fields roughly if there's a query
                if (query && !manualFields.street) {
                  const parts = query.split(',').map((p) => p.trim());
                  if (parts.length > 0) {
                    handleManualChange('street', parts[0] || '');
                    if (parts.length > 1) handleManualChange('city', parts[1] || '');
                  }
                }
              }
            }}
            className='h-4 w-4 rounded border-slate-300 dark:border-slate-600'
          />
          Enter address manually
        </label>
      </div>
    </div>
  );
}
