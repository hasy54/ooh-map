'use client';

import { useState, useEffect, useRef } from 'react';

interface State {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
}

interface MediaType {
  name: string;
}

interface RideBookingProps {
  onSearch: (stateId: number, cityId: number, mediaType: string) => void;
  onSelectionChange?: () => void;
}

export function RideBooking({ onSearch, onSelectionChange }: RideBookingProps) {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([]);

  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [selectedMediaType, setSelectedMediaType] = useState<string>('');

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMediaTypeDropdown, setShowMediaTypeDropdown] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prevStateRef = useRef<number | null>(null);
  const prevCityRef = useRef<number | null>(null);

  // Fetch states on mount
  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(data => setStates(data))
      .catch(err => console.error('Error fetching states:', err));
  }, []);

  // Handle state changes and reset cascade
  useEffect(() => {
    // Check if state actually changed (not just initial mount)
    const stateChanged = prevStateRef.current !== null && prevStateRef.current !== selectedState;

    if (selectedState) {
      // Fetch cities for the selected state
      fetch(`/api/cities?state_id=${selectedState}`)
        .then(res => res.json())
        .then(data => setCities(data))
        .catch(err => console.error('Error fetching cities:', err));

      // Only reset if state actually changed (not initial selection)
      if (stateChanged) {
        setSelectedCity(null);
        setMediaTypes([]);
        setSelectedMediaType('');
        onSelectionChange?.();
      }
    } else {
      setCities([]);
      if (selectedCity !== null) {
        setSelectedCity(null);
        setMediaTypes([]);
        setSelectedMediaType('');
        onSelectionChange?.();
      }
    }

    // Update previous state
    prevStateRef.current = selectedState;
  }, [selectedState]);

  // Handle city changes and reset cascade
  useEffect(() => {
    // Check if city actually changed (not just initial mount)
    const cityChanged = prevCityRef.current !== null && prevCityRef.current !== selectedCity;

    if (selectedState && selectedCity) {
      // Fetch media types for selected state + city
      fetch(`/api/media-types?state_id=${selectedState}&city_id=${selectedCity}`)
        .then(res => res.json())
        .then(data => setMediaTypes(data))
        .catch(err => console.error('Error fetching media types:', err));

      // Only reset media type if city actually changed (not initial selection)
      if (cityChanged) {
        setSelectedMediaType('');
        onSelectionChange?.();
      }
    } else {
      setMediaTypes([]);
      if (selectedMediaType !== '') {
        setSelectedMediaType('');
      }
    }

    // Update previous city
    prevCityRef.current = selectedCity;
  }, [selectedState, selectedCity]);

  const handleSearch = () => {
    if (selectedState && selectedCity && selectedMediaType) {
      onSearch(selectedState, selectedCity, selectedMediaType);
    }
  };

  const handleStateDropdownToggle = () => {
    setShowStateDropdown(!showStateDropdown);
    setShowCityDropdown(false);
    setShowMediaTypeDropdown(false);
  };

  const handleCityDropdownToggle = () => {
    if (selectedState) {
      setShowCityDropdown(!showCityDropdown);
      setShowStateDropdown(false);
      setShowMediaTypeDropdown(false);
    }
  };

  const handleMediaTypeDropdownToggle = () => {
    if (selectedState && selectedCity) {
      setShowMediaTypeDropdown(!showMediaTypeDropdown);
      setShowStateDropdown(false);
      setShowCityDropdown(false);
    }
  };

  // Keyboard search handler
  const handleKeyPress = (key: string) => {
    setSearchQuery(prev => prev + key);

    // Clear search query after 1 second of no typing
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery('');
    }, 1000);
  };

  // Filter items based on search query
  const getFilteredStates = () => {
    if (!searchQuery) return states;
    return states.filter(s => s.name.toLowerCase().startsWith(searchQuery.toLowerCase()));
  };

  const getFilteredCities = () => {
    if (!searchQuery) return cities;
    return cities.filter(c => c.name.toLowerCase().startsWith(searchQuery.toLowerCase()));
  };

  const getFilteredMediaTypes = () => {
    if (!searchQuery) return mediaTypes;
    return mediaTypes.filter(m => m.name.toLowerCase().startsWith(searchQuery.toLowerCase()));
  };

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if a dropdown is open and it's a letter key
      if ((showStateDropdown || showCityDropdown || showMediaTypeDropdown) &&
          e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStateDropdown, showCityDropdown, showMediaTypeDropdown]);

  // Reset search query when dropdowns close
  useEffect(() => {
    if (!showStateDropdown && !showCityDropdown && !showMediaTypeDropdown) {
      setSearchQuery('');
    }
  }, [showStateDropdown, showCityDropdown, showMediaTypeDropdown]);

  return (
    <section className="flex flex-col items-center gap-[14px] bg-white px-6 py-8 overflow-y-auto h-full rounded-lg max-md:px-4 max-md:py-6 max-md:gap-3">
      <div className="w-full max-w-[448px] max-md:mb-4">
        <h1 className="text-2xl font-medium leading-8 max-md:text-3xl max-md:text-center max-md:font-semibold">Find OOH Media</h1>
      </div>

      {/* State and City Selectors */}
      <div className="flex gap-3 w-full max-w-[448px]">
        {/* State Selector */}
        <div className="flex-1 relative min-w-0">
          {/* Native select for mobile */}
          <select
            value={selectedState ?? ''}
            onChange={(e) => setSelectedState(e.target.value ? Number(e.target.value) : null)}
            className="hidden max-md:block w-full bg-[#ebebeb] px-4 py-[14px] rounded-lg text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717] appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23171717' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">Select State</option>
            {states.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>

          {/* Custom dropdown for desktop */}
          <button
            onClick={handleStateDropdownToggle}
            className="w-full flex items-center justify-between gap-2 bg-[#ebebeb] px-4 py-[14px] rounded-lg hover:bg-gray-200 transition-colors max-md:hidden"
          >
            <span className="text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717] truncate flex-1 min-w-0">
              {selectedState ? states.find(s => s.id === selectedState)?.name : 'Select State'}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {showStateDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden max-md:hidden">
              {getFilteredStates().length > 0 ? (
                getFilteredStates().map((state) => (
                  <button
                    key={state.id}
                    onClick={() => {
                      setSelectedState(state.id);
                      setShowStateDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm whitespace-normal break-words"
                  >
                    {state.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>

        {/* City Selector */}
        <div className="flex-1 relative min-w-0">
          {/* Native select for mobile */}
          <select
            value={selectedCity ?? ''}
            onChange={(e) => setSelectedCity(e.target.value ? Number(e.target.value) : null)}
            disabled={!selectedState}
            className={`hidden max-md:block w-full bg-[#ebebeb] px-4 py-[14px] rounded-lg text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717] appearance-none ${
              !selectedState ? 'opacity-50' : ''
            }`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23171717' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>

          {/* Custom dropdown for desktop */}
          <button
            onClick={handleCityDropdownToggle}
            disabled={!selectedState}
            className={`w-full flex items-center justify-between gap-2 bg-[#ebebeb] px-4 py-[14px] rounded-lg transition-colors max-md:hidden ${
              selectedState ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            <span className="text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717] truncate flex-1 min-w-0">
              {selectedCity ? cities.find(c => c.id === selectedCity)?.name : 'Select City'}
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
              <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {showCityDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden max-md:hidden">
              {getFilteredCities().length > 0 ? (
                getFilteredCities().map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      setSelectedCity(city.id);
                      setShowCityDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm whitespace-normal break-words"
                  >
                    {city.name}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media Type Selector */}
      <div className="w-full max-w-[448px] relative">
        {/* Native select for mobile */}
        <select
          value={selectedMediaType}
          onChange={(e) => setSelectedMediaType(e.target.value)}
          disabled={!selectedState || !selectedCity}
          className={`hidden max-md:block w-full bg-[#ebebeb] px-4 py-[14px] rounded-lg text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717] appearance-none ${
            !selectedState || !selectedCity ? 'opacity-50' : ''
          }`}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 6L8 10L12 6' stroke='%23171717' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            paddingRight: '2.5rem'
          }}
        >
          <option value="">Media Type</option>
          {mediaTypes.map((mediaType, idx) => (
            <option key={idx} value={mediaType.name}>
              {mediaType.name}
            </option>
          ))}
        </select>

        {/* Custom dropdown for desktop */}
        <button
          onClick={handleMediaTypeDropdownToggle}
          disabled={!selectedState || !selectedCity}
          className={`w-full flex items-center justify-between gap-2 bg-[#ebebeb] px-4 py-[14px] rounded-lg transition-colors max-md:hidden ${
            selectedState && selectedCity ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <span className="text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717] truncate flex-1 min-w-0">
            {selectedMediaType || 'Media Type'}
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        {showMediaTypeDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden max-md:hidden">
            {getFilteredMediaTypes().length > 0 ? (
              getFilteredMediaTypes().map((mediaType, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedMediaType(mediaType.name);
                    setShowMediaTypeDropdown(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm whitespace-normal break-words"
                >
                  {mediaType.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Search Button */}
      <div className="w-full max-w-[448px]">
        <button
          onClick={handleSearch}
          disabled={!selectedState || !selectedCity || !selectedMediaType}
          className={`w-full py-4 rounded-lg text-base font-medium leading-6 tracking-[-0.176px] transition-colors ${
            selectedState && selectedCity && selectedMediaType
              ? 'bg-[#171717] text-white hover:bg-gray-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Search
        </button>
      </div>
    </section>
  );
}
