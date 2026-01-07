'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { RideBooking } from './components/RideBooking';
import { MediaResults } from './components/MediaResults';

// Dynamically import MapView with SSR disabled to avoid Leaflet window errors
const MapView = dynamic(() => import('./components/MapView').then(mod => ({ default: mod.MapView })), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-full bg-[#f5f5f5] rounded-lg overflow-hidden flex items-center justify-center max-h-full">
      <div className="text-gray-600 text-sm">Loading map...</div>
    </div>
  ),
});

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

type MobileScreen = 'search' | 'results' | 'details';

export default function Home() {
  const [showResults, setShowResults] = useState(false);
  const [mediaResults, setMediaResults] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [mobileScreen, setMobileScreen] = useState<MobileScreen>('search');
  const [isMobile, setIsMobile] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'forward' | 'backward'>('forward');

  // Helper to navigate with direction
  const navigateToScreen = (newScreen: MobileScreen, direction: 'forward' | 'backward') => {
    setAnimationDirection(direction);
    setMobileScreen(newScreen);
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = async (stateId: number, cityId: number, mediaType: string) => {
    // Navigate to results screen on mobile immediately
    if (isMobile) {
      navigateToScreen('results', 'forward');
      setIsLoading(true);
    } else {
      setIsLoading(true);
      setShowResults(true);
    }

    setSelectedMedia(null);

    try {
      const params = new URLSearchParams({
        state_id: stateId.toString(),
        city_id: cityId.toString(),
        media_type: mediaType,
      });

      const response = await fetch(`/api/media?${params}`);
      const data = await response.json();
      setMediaResults(data);

      if (!isMobile) {
        setShowResults(true);
      }

      // Auto-select first result
      if (data.length > 0 && !isMobile) {
        setSelectedMedia(data[0]);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
      setMediaResults([]);
      setSelectedMedia(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaSelect = (media: Media | null) => {
    setSelectedMedia(media);

    // Navigate to details screen on mobile when media is selected
    if (isMobile && media) {
      navigateToScreen('details', 'forward');
    }

    // Only close details if not pinned
    if (!isPinned) {
      setShowDetails(false);
    }
  };

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const handleTogglePin = () => {
    setIsPinned(!isPinned);
  };

  const handleSelectionChange = () => {
    // Clear search results and selection when state/city changes
    setShowResults(false);
    setMediaResults([]);
    setSelectedMedia(null);
    setShowDetails(false);
    setIsPinned(false);
  };

  // Mobile view: Sheet-based navigation
  if (isMobile) {
    return (
      <main className="h-[calc(100vh-49px)] overflow-hidden w-screen bg-white">
        {/* Mobile Header with Back Button */}
        {mobileScreen !== 'search' && (
          <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => {
                if (mobileScreen === 'details') {
                  navigateToScreen('results', 'backward');
                  setSelectedMedia(null);
                } else if (mobileScreen === 'results') {
                  navigateToScreen('search', 'backward');
                  setShowResults(false);
                  setMediaResults([]);
                }
              }}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            >
              <i className="ri-arrow-left-line text-xl text-gray-900"></i>
            </button>
            <h2 className="text-lg font-medium text-gray-900">
              {mobileScreen === 'results' ? 'Results' : 'Details'}
            </h2>
          </div>
        )}

        {/* Mobile Screens with Swipe Functionality */}
        <AnimatePresence mode="wait" initial={false} custom={animationDirection}>
          {mobileScreen === 'search' && (
            <motion.div
              key="search"
              custom={animationDirection}
              variants={{
                initial: (direction: 'forward' | 'backward') => ({
                  x: direction === 'forward' ? 0 : 300,
                  opacity: direction === 'forward' ? 1 : 0
                }),
                animate: { x: 0, opacity: 1 },
                exit: (direction: 'forward' | 'backward') => ({
                  x: direction === 'forward' ? -300 : 300,
                  opacity: 0
                })
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full flex items-center justify-center"
            >
              <div className="w-full max-w-[448px]">
                <RideBooking onSearch={handleSearch} onSelectionChange={handleSelectionChange} />
              </div>
            </motion.div>
          )}

          {mobileScreen === 'results' && (
            <motion.div
              key="results"
              custom={animationDirection}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                // Swipe right to go back (threshold: 100px)
                if (info.offset.x > 100) {
                  navigateToScreen('search', 'backward');
                  setShowResults(false);
                  setMediaResults([]);
                }
              }}
              variants={{
                initial: (direction: 'forward' | 'backward') => ({
                  x: direction === 'forward' ? 300 : -300,
                  opacity: 0
                }),
                animate: { x: 0, opacity: 1 },
                exit: (direction: 'forward' | 'backward') => ({
                  x: direction === 'forward' ? -300 : 300,
                  opacity: 0
                })
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
            >
              <MediaResults
                media={mediaResults}
                isLoading={isLoading}
                selectedMedia={selectedMedia}
                onMediaSelect={handleMediaSelect}
              />
            </motion.div>
          )}

          {mobileScreen === 'details' && selectedMedia && (
            <motion.div
              key="details"
              custom={animationDirection}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, info) => {
                // Swipe right to go back (threshold: 100px)
                if (info.offset.x > 100) {
                  navigateToScreen('results', 'backward');
                  setSelectedMedia(null);
                }
              }}
              variants={{
                initial: (direction: 'forward' | 'backward') => ({
                  x: direction === 'forward' ? 300 : -300,
                  opacity: 0
                }),
                animate: { x: 0, opacity: 1 },
                exit: (direction: 'forward' | 'backward') => ({
                  x: direction === 'forward' ? -300 : 300,
                  opacity: 0
                })
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full overflow-y-auto bg-white"
            >
              {/* Small Map - Scrollable with content */}
              <div className="h-[250px] w-full">
                <MapView
                  media={[selectedMedia]}
                  selectedMedia={selectedMedia}
                  onMediaSelect={() => {}}
                  onShowDetails={() => {}}
                  showDetails={false}
                />
              </div>

              {/* Details Content */}
              <div className="p-6 pb-32">
                {/* Title */}
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">{selectedMedia.name}</h3>

                {/* No Location Banner */}
                {(!selectedMedia.lat || !selectedMedia.long) && (
                  <div className="bg-[#f5f5f5] rounded-lg px-4 py-3 mb-6 flex items-start gap-3">
                    <i className="ri-map-pin-line text-gray-500 text-lg mt-0.5"></i>
                    <p className="text-sm text-gray-700 flex-1">Location data not available for this media</p>
                  </div>
                )}

                {/* Image Placeholder */}
                <div className="bg-[#f5f5f5] rounded-lg h-[200px] mb-6 flex items-center justify-center">
                  <div className="text-center">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="text-gray-400 mx-auto mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                      <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="text-sm text-gray-500">No images available</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Type</label>
                    <p className="text-base text-gray-900 font-medium">{selectedMedia.type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Traffic</label>
                    <p className="text-base text-gray-900 font-medium">{selectedMedia.traffic || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Width</label>
                    <p className="text-base text-gray-900 font-medium">{selectedMedia.width || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Height</label>
                    <p className="text-base text-gray-900 font-medium">{selectedMedia.height || 'N/A'}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">Location</label>
                    <p className="text-base text-gray-900 font-medium">
                      {selectedMedia.city_name || 'N/A'}, {selectedMedia.state_name || 'N/A'}
                    </p>
                    {selectedMedia.lat && selectedMedia.long && (
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedMedia.lat}, {selectedMedia.long}
                      </p>
                    )}
                  </div>
                </div>

                {/* Book Now Button */}
                <button
                  onClick={() => {
                    const message = `Hi, I am interested in this listing:\n\n*${selectedMedia.name}*\n\nDetails:\n- Type: ${selectedMedia.type || 'N/A'}\n- Traffic: ${selectedMedia.traffic || 'N/A'}\n- Size: ${selectedMedia.width && selectedMedia.height ? `${selectedMedia.width} x ${selectedMedia.height}` : 'N/A'}\n- Location: ${selectedMedia.city_name || 'N/A'}, ${selectedMedia.state_name || 'N/A'}\n${selectedMedia.lat && selectedMedia.long ? `- Coordinates: ${selectedMedia.lat}, ${selectedMedia.long}` : ''}\n\nCan you please share more details?`;
                    const whatsappUrl = `https://wa.me/919892320184?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="w-full bg-[#171717] text-white py-4 rounded-lg font-semibold text-base hover:bg-gray-800 active:bg-gray-900 transition-colors shadow-lg"
                >
                  Book now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    );
  }

  // Desktop view: Original layout
  return (
    <main className="flex gap-6 h-[calc(100vh-64px)] p-6 overflow-hidden w-screen max-w-full box-border">
      <motion.div
        animate={{
          width: showResults ? '22%' : '100%',
          maxWidth: showResults ? '320px' : '448px',
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="flex-shrink-0 overflow-hidden min-w-[280px]"
      >
        <RideBooking onSearch={handleSearch} onSelectionChange={handleSelectionChange} />
      </motion.div>

      <AnimatePresence mode="wait">
        {showResults && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: -20 }}
            animate={{ width: '22%', opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="flex-shrink-0 overflow-hidden min-w-[280px] max-w-[320px] max-md:w-full max-md:max-w-full max-md:min-w-full max-md:h-[400px]"
          >
            <MediaResults
              media={mediaResults}
              isLoading={isLoading}
              selectedMedia={selectedMedia}
              onMediaSelect={handleMediaSelect}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          flexGrow: showResults ? 1 : 1,
        }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className={`overflow-hidden flex flex-col gap-6 ${showResults ? 'flex-1 min-w-0' : 'flex-1 min-w-0'} max-md:w-full max-md:h-[500px] max-md:gap-4`}
      >
        {/* Map Row */}
        <div className={`${showDetails || (selectedMedia && (!selectedMedia.lat || !selectedMedia.long)) ? 'flex-1 min-h-0' : 'h-full'} max-md:h-[300px]`}>
          <MapView
            media={showResults ? mediaResults : []}
            selectedMedia={selectedMedia}
            onMediaSelect={handleMediaSelect}
            onShowDetails={handleToggleDetails}
            showDetails={showDetails}
          />
        </div>

        {/* No Location Banner Row */}
        <AnimatePresence>
          {selectedMedia && (!selectedMedia.lat || !selectedMedia.long) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#f5f5f5] rounded-lg px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0"
            >
              <p className="text-sm text-gray-700">Location data not available for this media</p>
              <button
                onClick={handleToggleDetails}
                className="flex-shrink-0 bg-[#171717] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-gray-800 transition-colors"
              >
                Show details
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Card Row */}
        <AnimatePresence>
          {showDetails && selectedMedia && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0"
            >
              <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden h-[380px] flex flex-col max-md:h-auto max-md:max-h-[500px]">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-4 flex-shrink-0 gap-3 max-md:px-4 max-md:py-3">
                  <h2 className="text-xl font-medium text-[#171717] truncate min-w-0 max-md:text-lg" title={selectedMedia.name}>{selectedMedia.name}</h2>
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={handleTogglePin}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors flex-shrink-0 ${
                        isPinned ? 'bg-gray-200' : 'hover:bg-gray-100'
                      }`}
                      title={isPinned ? 'Unpin details' : 'Pin details'}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.i
                        key={isPinned ? 'pinned' : 'unpinned'}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                        className={isPinned ? 'ri-unpin-fill text-base' : 'ri-pushpin-2-line text-base'}
                      />
                    </motion.button>
                    <button
                      onClick={() => {
                        setShowDetails(false);
                        setIsPinned(false);
                      }}
                      className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                      title="Close details"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-2 gap-6 px-6 pb-6 flex-1 min-h-0 max-md:grid-cols-1 max-md:px-4 max-md:pb-4 max-md:gap-4">
                  {/* Image Slider Column */}
                  <div className="bg-[#f5f5f5] rounded-lg overflow-hidden flex items-center justify-center max-md:h-[150px]">
                    <div className="text-center p-6 max-md:p-4">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-gray-400 mx-auto mb-2 max-md:w-8 max-md:h-8">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                        <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-xs text-gray-500">No images available</p>
                    </div>
                  </div>

                  {/* Details Column */}
                  <div className="flex flex-col min-h-0 max-md:min-h-fit">
                    <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div className="min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Type</label>
                          <p className="text-sm text-[#171717] mt-0.5 font-medium truncate" title={selectedMedia.type || 'N/A'}>{selectedMedia.type || 'N/A'}</p>
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Traffic</label>
                          <p className="text-sm text-[#171717] mt-0.5 font-medium truncate" title={selectedMedia.traffic || 'N/A'}>{selectedMedia.traffic || 'N/A'}</p>
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Width</label>
                          <p className="text-sm text-[#171717] mt-0.5 font-medium truncate" title={selectedMedia.width?.toString() || 'N/A'}>{selectedMedia.width || 'N/A'}</p>
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Height</label>
                          <p className="text-sm text-[#171717] mt-0.5 font-medium truncate" title={selectedMedia.height?.toString() || 'N/A'}>{selectedMedia.height || 'N/A'}</p>
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">City</label>
                          <p className="text-sm text-[#171717] mt-0.5 font-medium truncate" title={selectedMedia.city_name || 'N/A'}>{selectedMedia.city_name || 'N/A'}</p>
                        </div>
                        <div className="min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">State</label>
                          <p className="text-sm text-[#171717] mt-0.5 font-medium truncate" title={selectedMedia.state_name || 'N/A'}>{selectedMedia.state_name || 'N/A'}</p>
                        </div>
                        <div className="col-span-2 min-w-0">
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block">Location</label>
                          <p className="text-sm text-[#171717] mt-0.5 font-medium truncate" title={selectedMedia.lat && selectedMedia.long ? `${selectedMedia.lat}, ${selectedMedia.long}` : 'N/A'}>
                            {selectedMedia.lat && selectedMedia.long
                              ? `${selectedMedia.lat}, ${selectedMedia.long}`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
                      <button
                        onClick={() => {
                          const message = `Hi, I am interested in this listing:\n\n*${selectedMedia.name}*\n\nDetails:\n- Type: ${selectedMedia.type || 'N/A'}\n- Traffic: ${selectedMedia.traffic || 'N/A'}\n- Size: ${selectedMedia.width && selectedMedia.height ? `${selectedMedia.width} x ${selectedMedia.height}` : 'N/A'}\n- Location: ${selectedMedia.city_name || 'N/A'}, ${selectedMedia.state_name || 'N/A'}\n${selectedMedia.lat && selectedMedia.long ? `- Coordinates: ${selectedMedia.lat}, ${selectedMedia.long}` : ''}\n\nCan you please share more details?`;
                          const whatsappUrl = `https://wa.me/919892320184?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="bg-[#171717] text-white py-2.5 px-6 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Book now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
