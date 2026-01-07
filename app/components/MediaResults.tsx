'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Media {
  id: string;
  name: string;
  type: string;
  traffic: string;
  width: number;
  height: number;
  lat: string;
  long: string;
  city_name: string;
  state_name: string;
}

interface MediaResultsProps {
  media: Media[];
  isLoading: boolean;
  selectedMedia: Media | null;
  onMediaSelect: (media: Media | null) => void;
}

export function MediaResults({ media, isLoading, selectedMedia, onMediaSelect }: MediaResultsProps) {
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTraffic, setSelectedTraffic] = useState<string[]>([]);
  const [selectedWidths, setSelectedWidths] = useState<string[]>([]);
  const [selectedHeights, setSelectedHeights] = useState<string[]>([]);
  const [showTrafficDropdown, setShowTrafficDropdown] = useState(false);
  const [showWidthDropdown, setShowWidthDropdown] = useState(false);
  const [showHeightDropdown, setShowHeightDropdown] = useState(false);

  // Get unique width values from media
  const availableWidths = Array.from(new Set(
    media
      .filter(m => m.width)
      .map(m => m.width.toString())
  )).sort((a, b) => Number(a) - Number(b));

  // Get unique height values from media
  const availableHeights = Array.from(new Set(
    media
      .filter(m => m.height)
      .map(m => m.height.toString())
  )).sort((a, b) => Number(a) - Number(b));

  // Get unique traffic values from media
  const availableTraffic = Array.from(new Set(media.map(m => m.traffic).filter(Boolean)));

  // Filter media based on selected filters
  const filteredMedia = media.filter(item => {
    if (selectedWidths.length > 0 && !selectedWidths.includes(item.width.toString())) {
      return false;
    }
    if (selectedHeights.length > 0 && !selectedHeights.includes(item.height.toString())) {
      return false;
    }
    if (selectedTraffic.length > 0 && !selectedTraffic.includes(item.traffic)) {
      return false;
    }
    return true;
  });

  const displayedMedia = filteredMedia;
  const activeFiltersCount = selectedWidths.length + selectedHeights.length + selectedTraffic.length;

  // Scroll to selected item
  useEffect(() => {
    if (selectedMedia && itemRefs.current[selectedMedia.id]) {
      itemRefs.current[selectedMedia.id]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedMedia]);
  if (isLoading) {
    return (
      <section className="flex flex-col bg-white h-full overflow-hidden rounded-lg border-2 border-gray-200">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#f5f5f5] rounded-xl p-4 animate-pulse">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (media.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center bg-white h-full px-6 rounded-lg border-2 border-gray-200">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No media found</h3>
          <p className="mt-1 text-xs text-gray-500">Try adjusting your search filters</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col bg-white h-full overflow-hidden rounded-lg border-2 border-gray-200">
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-medium leading-8">Results ({displayedMedia.length})</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              showFilters ? 'bg-gray-200' : 'hover:bg-gray-100'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
              <circle cx="7" cy="6" r="2" fill="currentColor"></circle>
              <circle cx="17" cy="12" r="2" fill="currentColor"></circle>
              <circle cx="14" cy="18" r="2" fill="currentColor"></circle>
            </svg>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="space-y-3 pb-4 border-b border-gray-200">
            {/* Width Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  if (availableWidths.length > 0) {
                    setShowWidthDropdown(!showWidthDropdown);
                    setShowHeightDropdown(false);
                    setShowTrafficDropdown(false);
                  }
                }}
                disabled={availableWidths.length === 0}
                className={`w-full flex items-center justify-between bg-[#ebebeb] px-4 py-[14px] rounded-lg transition-colors ${
                  availableWidths.length > 0 ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717]">
                  {selectedWidths.length > 0 ? `Width (${selectedWidths.length})` : 'Width'}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              {showWidthDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {availableWidths.map((width) => (
                    <button
                      key={width}
                      onClick={() => {
                        if (selectedWidths.includes(width)) {
                          setSelectedWidths(selectedWidths.filter(w => w !== width));
                        } else {
                          setSelectedWidths([...selectedWidths, width]);
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center justify-between"
                    >
                      <span>{width}</span>
                      {selectedWidths.includes(width) && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Height Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  if (availableHeights.length > 0) {
                    setShowHeightDropdown(!showHeightDropdown);
                    setShowWidthDropdown(false);
                    setShowTrafficDropdown(false);
                  }
                }}
                disabled={availableHeights.length === 0}
                className={`w-full flex items-center justify-between bg-[#ebebeb] px-4 py-[14px] rounded-lg transition-colors ${
                  availableHeights.length > 0 ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717]">
                  {selectedHeights.length > 0 ? `Height (${selectedHeights.length})` : 'Height'}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              {showHeightDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {availableHeights.map((height) => (
                    <button
                      key={height}
                      onClick={() => {
                        if (selectedHeights.includes(height)) {
                          setSelectedHeights(selectedHeights.filter(h => h !== height));
                        } else {
                          setSelectedHeights([...selectedHeights, height]);
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center justify-between"
                    >
                      <span>{height}</span>
                      {selectedHeights.includes(height) && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Traffic Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  if (availableTraffic.length > 0) {
                    setShowTrafficDropdown(!showTrafficDropdown);
                    setShowWidthDropdown(false);
                    setShowHeightDropdown(false);
                  }
                }}
                disabled={availableTraffic.length === 0}
                className={`w-full flex items-center justify-between bg-[#ebebeb] px-4 py-[14px] rounded-lg transition-colors ${
                  availableTraffic.length > 0 ? 'hover:bg-gray-200' : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <span className="text-sm font-medium tracking-[-0.084px] leading-5 text-[#171717]">
                  {selectedTraffic.length > 0 ? `Traffic (${selectedTraffic.length})` : 'Traffic'}
                </span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              {showTrafficDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {availableTraffic.map((traffic) => (
                    <button
                      key={traffic}
                      onClick={() => {
                        if (selectedTraffic.includes(traffic)) {
                          setSelectedTraffic(selectedTraffic.filter(t => t !== traffic));
                        } else {
                          setSelectedTraffic([...selectedTraffic, traffic]);
                        }
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center justify-between"
                    >
                      <span>{traffic}</span>
                      {selectedTraffic.includes(traffic) && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8L6 11L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setSelectedWidths([]);
                  setSelectedHeights([]);
                  setSelectedTraffic([]);
                }}
                className="text-xs text-gray-600 hover:text-gray-900 px-4"
              >
                Clear all filters
              </button>
            )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-3"
        onClick={(e) => {
          // If clicking in the scroll area (not on a card), deselect
          const target = e.target as HTMLElement;
          if (target.classList.contains('space-y-2') || target === e.currentTarget) {
            onMediaSelect(null);
          }
        }}
      >
        <div className="space-y-2">
          {displayedMedia.map((item) => {
            const size = item.width && item.height
              ? `${item.width} x ${item.height}`
              : 'N/A';
            const isSelected = selectedMedia?.id === item.id;

            return (
              <div
                key={item.id}
                ref={(el) => { itemRefs.current[item.id] = el; }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMediaSelect(item);
                }}
                className={`bg-[#f5f5f5] rounded-xl p-4 hover:bg-gray-200 transition-colors cursor-pointer ${
                  isSelected ? 'border-2 border-gray-900' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <h3 className="text-base font-medium text-[#171717] truncate">
                        {item.name}
                      </h3>
                      {(!item.lat || !item.long) && (
                        <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 rounded">
                          No Location
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 leading-tight mb-1">
                      Traffic: {item.traffic || 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500 leading-tight">
                      Size: {size}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-400">
                      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
