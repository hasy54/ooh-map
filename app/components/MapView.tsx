'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Media {
  id: string;
  name: string;
  lat: string;
  long: string;
  traffic: string;
  width: number;
  height: number;
}

interface MapViewProps {
  media?: Media[];
  selectedMedia?: Media | null;
  onMediaSelect?: (media: Media | null) => void;
  onShowDetails?: () => void;
  showDetails?: boolean;
}

// Custom Uber-style marker icon
const createCustomIcon = (isSelected: boolean = false, hasSelection: boolean = false) => {
  if (isSelected) {
    // Selected marker: Black with white border (larger)
    const size = 40;
    const dotSize = 10;
    const borderWidth = 4;

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: #000000;
          border: ${borderWidth}px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          <div style="
            width: ${dotSize}px;
            height: ${dotSize}px;
            background-color: #ffffff;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  } else if (hasSelection) {
    // Non-selected marker when something is selected: Small grey dot without border
    const size = 12;

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: #9ca3af;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        "></div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  } else {
    // Normal state when nothing is selected: Black with white border (medium)
    const size = 32;
    const dotSize = 8;
    const borderWidth = 3;

    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background-color: #000000;
          border: ${borderWidth}px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        ">
          <div style="
            width: ${dotSize}px;
            height: ${dotSize}px;
            background-color: #ffffff;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    });
  }
};

function MapController({ media, selectedMedia, showDetails }: { media?: Media[], selectedMedia?: Media | null, showDetails?: boolean }) {
  const map = useMap();
  const prevShowDetailsRef = useRef(showDetails);

  // Zoom to all media on initial load
  useEffect(() => {
    if (media && media.length > 0 && !selectedMedia) {
      const validLocations = media
        .filter(m => m.lat && m.long)
        .map(m => [parseFloat(m.lat), parseFloat(m.long)] as [number, number]);

      if (validLocations.length > 0) {
        const bounds = L.latLngBounds(validLocations);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [media, map, selectedMedia]);

  // Zoom to selected media
  useEffect(() => {
    if (selectedMedia && selectedMedia.lat && selectedMedia.long) {
      const lat = parseFloat(selectedMedia.lat);
      const lng = parseFloat(selectedMedia.long);

      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 16, {
          duration: 0.5,
          easeLinearity: 0.25
        });
      }
    }
  }, [selectedMedia, map]);

  // Smoothly adjust map when showDetails changes
  useEffect(() => {
    const showDetailsChanged = prevShowDetailsRef.current !== showDetails;

    if (showDetailsChanged) {
      // Always invalidate size when details state changes
      setTimeout(() => {
        map.invalidateSize();

        // Only pan if there's a selected media with location
        if (selectedMedia && selectedMedia.lat && selectedMedia.long) {
          const lat = parseFloat(selectedMedia.lat);
          const lng = parseFloat(selectedMedia.long);

          if (!isNaN(lat) && !isNaN(lng)) {
            // Use panTo for smoother, simpler movement
            map.panTo([lat, lng], {
              animate: true,
              duration: 0.5,
              easeLinearity: 0.15
            });
          }
        }
      }, 350); // Wait for animation to complete
    }

    prevShowDetailsRef.current = showDetails;
  }, [showDetails, map, selectedMedia]);

  return null;
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = () => {
      onMapClick();
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

export function MapView({ media = [], selectedMedia = null, onMediaSelect, onShowDetails, showDetails = false }: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Open popup when media is selected, close when deselected
  useEffect(() => {
    if (mapRef.current) {
      // Always close all popups first
      mapRef.current.closePopup();
    }

    // Then open the popup for the selected media
    if (selectedMedia && markerRefs.current[selectedMedia.id]) {
      // Small delay to ensure close happens first
      setTimeout(() => {
        markerRefs.current[selectedMedia.id]?.openPopup();
      }, 10);
    }
  }, [selectedMedia]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleLocate = () => {
    if (mapRef.current) {
      mapRef.current.locate({ setView: true, maxZoom: 16 });
    }
  };

  if (!isMounted) {
    return (
      <div className="relative w-full h-full bg-[#f5f5f5] rounded-lg overflow-hidden flex items-center justify-center max-h-full">
        <div className="text-gray-600 text-sm">Loading map...</div>
      </div>
    );
  }

  const validMedia = media.filter(m => m.lat && m.long && !isNaN(parseFloat(m.lat)) && !isNaN(parseFloat(m.long)));
  const defaultCenter: [number, number] = validMedia.length > 0
    ? [parseFloat(validMedia[0].lat), parseFloat(validMedia[0].long)]
    : [19.0760, 72.8777]; // Mumbai default

  return (
    <div className="relative w-full h-full bg-[#f5f5f5] rounded-lg overflow-hidden max-h-full">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full rounded-lg"
        ref={(ref) => {
          if (ref) {
            mapRef.current = ref;
          }
        }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController media={validMedia} selectedMedia={selectedMedia} showDetails={showDetails} />
        <MapClickHandler onMapClick={() => onMediaSelect?.(null)} />

        {validMedia.map((item) => {
          const isSelected = selectedMedia?.id === item.id;
          const hasSelection = selectedMedia !== null;
          return (
            <Marker
              key={item.id}
              position={[parseFloat(item.lat), parseFloat(item.long)]}
              icon={createCustomIcon(isSelected, hasSelection)}
              ref={(ref) => {
                if (ref) {
                  markerRefs.current[item.id] = ref;
                }
              }}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  onMediaSelect?.(item);
                },
              }}
            >
              <Popup
                className="uber-popup"
                closeButton={false}
              >
                <div className="min-w-[220px]">
                  <h3 className="font-semibold text-base mb-3 text-gray-900">{item.name}</h3>
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Traffic:</span>
                      <span className="text-xs font-medium text-gray-900">{item.traffic || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Size:</span>
                      <span className="text-xs font-medium text-gray-900">
                        {item.width && item.height ? `${item.width} x ${item.height}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowDetails?.();
                    }}
                    className="w-full bg-[#171717] text-white py-2 px-3 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
                  >
                    Show more details
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-[1000] max-md:bottom-4 max-md:right-4 max-md:gap-2">
        {/* Locate Me Button */}
        <button
          onClick={handleLocate}
          className="w-12 h-12 rounded-full bg-white hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center transition-all shadow-lg backdrop-blur-sm max-md:w-10 max-md:h-10"
        >
          <i className="ri-crosshair-2-fill text-xl text-gray-900 max-md:text-lg"></i>
        </button>

        {/* Zoom Controls */}
        <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-lg backdrop-blur-sm">
          <button
            onClick={handleZoomIn}
            className="w-12 h-12 flex items-center justify-center border-b border-gray-200 hover:bg-gray-100 active:bg-gray-200 transition-all max-md:w-10 max-md:h-10"
          >
            <i className="ri-add-fill text-xl text-gray-900 max-md:text-lg"></i>
          </button>

          <button
            onClick={handleZoomOut}
            className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-all max-md:w-10 max-md:h-10"
          >
            <i className="ri-subtract-fill text-xl text-gray-900 max-md:text-lg"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
