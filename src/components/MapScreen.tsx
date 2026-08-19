import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, SlidersHorizontal, ArrowRight, AlertTriangle, CheckCircle, Wrench, Navigation, Layers, Plus } from 'lucide-react';
import { CivicIssue } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface MapScreenProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string | null) => void;
  onViewDetails: (issue: CivicIssue) => void;
  onOpenFilter: () => void;
  onQuickReportAtLocation?: (lat: number, lng: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  issues,
  selectedIssueId,
  onSelectIssue,
  onViewDetails,
  onOpenFilter,
  onQuickReportAtLocation,
  searchQuery,
  onSearchChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [mapTheme, setMapTheme] = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Default to Kandivali, Mumbai (fallback when GPS is unavailable)
  const KANDIVALI_CENTER: [number, number] = [19.2041, 72.8517];
  const userCoordsRef = useRef<[number, number]>(KANDIVALI_CENTER);

  const selectedIssue = selectedIssueId ? issues.find((i) => i.id === selectedIssueId) : null;

  // Helper to create custom HTML markers matching the screenshot
  const createCustomPin = (type: 'critical' | 'resolved' | 'in_progress' | 'user', isSelected: boolean) => {
    let iconHtml = '';
    let bgColor = '';
    let dotColor = '';

    if (type === 'critical') {
      bgColor = '#dc2626'; // Red
      dotColor = '#dc2626';
      // Warning triangle icon
      iconHtml = `
        <div class="pin-wrapper flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div style="background-color: ${bgColor}; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.35);" 
               class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div style="background-color: ${dotColor};" class="w-2.5 h-2.5 rounded-full mt-1 border border-white shadow-xs"></div>
        </div>
      `;
    } else if (type === 'resolved') {
      bgColor = '#16a34a'; // Green
      dotColor = '#16a34a';
      // Checkmark icon
      iconHtml = `
        <div class="pin-wrapper flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div style="background-color: ${bgColor}; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.35);" 
               class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div style="background-color: ${dotColor};" class="w-2.5 h-2.5 rounded-full mt-1 border border-white shadow-xs"></div>
        </div>
      `;
    } else if (type === 'in_progress') {
      bgColor = '#854d0e'; // Warm Brown / Rust
      dotColor = '#854d0e';
      // Crossed wrench / tools icon
      iconHtml = `
        <div class="pin-wrapper flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div style="background-color: ${bgColor}; box-shadow: 0 4px 12px rgba(133, 77, 14, 0.35);" 
               class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div style="background-color: ${dotColor};" class="w-2.5 h-2.5 rounded-full mt-1 border border-white shadow-xs"></div>
        </div>
      `;
    } else {
      bgColor = '#1d4ed8'; // Blue (user)
      dotColor = '#1d4ed8';
      // Radar / User Pin
      iconHtml = `
        <div class="pin-wrapper flex flex-col items-center cursor-pointer transition-transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          <div style="background-color: ${bgColor}; box-shadow: 0 4px 12px rgba(29, 78, 216, 0.35);" 
               class="w-11 h-11 rounded-full flex items-center justify-center border-2 border-white text-white">
            <div class="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
          <div style="background-color: ${dotColor};" class="w-2.5 h-2.5 rounded-full mt-1 border border-white shadow-xs"></div>
        </div>
      `;
    }

    return L.divIcon({
      className: 'custom-civic-marker',
      html: iconHtml,
      iconSize: [44, 54],
      iconAnchor: [22, 54],
      popupAnchor: [0, -50],
    });
  };

  // Initialize Leaflet Map and try to get real user location
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Start with Kandivali, Mumbai as default center
      const map = L.map(mapContainerRef.current, {
        center: KANDIVALI_CENTER,
        zoom: 15,
        zoomControl: false,
      });

      // Default light tile layer (CartoDB Positron / OSM)
      const tile = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = tile;
      mapInstanceRef.current = map;

      // Handle map clicks for adding new hazard report
      map.on('click', (e) => {
        onSelectIssue(null);
        if (onQuickReportAtLocation) {
          onQuickReportAtLocation(e.latlng.lat, e.latlng.lng);
        }
      });

      // Try to get real user GPS location and pan to it
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            userCoordsRef.current = [latitude, longitude];
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setView([latitude, longitude], 15, { animate: true });
            }
          },
          () => {
            // Permission denied or error — keep Kandivali default, no action needed
            console.info('[MapScreen] Geolocation unavailable. Using Kandivali, Mumbai as default.');
          },
          { timeout: 8000, enableHighAccuracy: true }
        );
      }
    }

    return () => {
      // Keep map instance alive across renders if possible
    };
  }, []);

  // Update Tile Layer when mapTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    if (mapTheme === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (mapTheme === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }

    const newTile = L.tileLayer(url, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [mapTheme]);

  // Update Markers on issues change or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    const currentMarkers = markersRef.current as Record<string, L.Marker>;
    for (const key in currentMarkers) {
      if (currentMarkers[key]) {
        currentMarkers[key].remove();
      }
    }
    markersRef.current = {};

    // Add Issue Markers
    issues.forEach((issue) => {
      let pinType: 'critical' | 'resolved' | 'in_progress' = 'critical';
      if (issue.status === 'resolved') {
        pinType = 'resolved';
      } else if (issue.status === 'in_progress' || issue.status === 'scheduled') {
        pinType = 'in_progress';
      } else if (issue.severity === 'critical') {
        pinType = 'critical';
      }

      const isSelected = issue.id === selectedIssueId;
      const customIcon = createCustomPin(pinType, isSelected);

      const marker = L.marker([issue.location.lat, issue.location.lng], {
        icon: customIcon,
      }).addTo(map);

      marker.on('click', () => {
        onSelectIssue(issue.id);
        map.panTo([issue.location.lat, issue.location.lng], {
          animate: true,
          duration: 0.6,
        });
      });

      markersRef.current[issue.id] = marker;
    });

    // Add User Current Location Pin using live GPS coords (defaults to Kandivali)
    const userLocationPin = createCustomPin('user', false);
    const userMarker = L.marker(userCoordsRef.current, {
      icon: userLocationPin,
    }).addTo(map);

    userMarker.bindTooltip('Your Current Location', {
      direction: 'top',
      offset: [0, -35],
    });

    markersRef.current['user-loc'] = userMarker;
  }, [issues, selectedIssueId]);

  // Pan to selected issue if selected from outside
  useEffect(() => {
    if (selectedIssue && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([selectedIssue.location.lat, selectedIssue.location.lng], {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedIssueId]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      // Re-request GPS and pan to live location, fallback to stored coords
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            userCoordsRef.current = [latitude, longitude];
            mapInstanceRef.current?.setView([latitude, longitude], 16, { animate: true });
          },
          () => {
            mapInstanceRef.current?.setView(userCoordsRef.current, 15, { animate: true });
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        mapInstanceRef.current.setView(userCoordsRef.current, 15, { animate: true });
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col overflow-hidden select-none">
      {/* 1. TOP FLOATING SEARCH & FILTER BAR */}
      <div className="absolute top-4 left-4 right-4 z-[400] max-w-md mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.12)] border border-slate-200/90 px-4 py-2.5 flex items-center gap-3 transition-all hover:border-slate-300">
          <Search className="w-5 h-5 text-slate-700 flex-shrink-0" />
          <input
            id="map-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search location or issue..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-500 text-sm font-medium focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1 font-semibold"
            >
              Clear
            </button>
          )}
          <button
            id="map-filter-button"
            type="button"
            onClick={onOpenFilter}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-blue-700 transition-colors flex-shrink-0"
            title="Filter Issues"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* 2. MAP CONTROLS (Right Side) */}
      <div className="absolute right-4 top-20 z-[400] flex flex-col gap-2">
        {/* Recenter button */}
        <button
          onClick={handleRecenter}
          className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#1e40af] hover:bg-white transition-all"
          title="Recenter Map"
        >
          <Navigation className="w-5 h-5" />
        </button>

        {/* Map Layers */}
        <div className="relative">
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="w-10 h-10 bg-white/95 backdrop-blur-md rounded-full shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#1e40af] hover:bg-white transition-all"
            title="Map Themes"
          >
            <Layers className="w-5 h-5" />
          </button>

          {showLayerMenu && (
            <div className="absolute right-12 top-0 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 w-32 flex flex-col gap-1 z-50 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setMapTheme('streets');
                  setShowLayerMenu(false);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                  mapTheme === 'streets' ? 'bg-[#e6eeff] text-[#1e40af] font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🗺️ Streets
              </button>
              <button
                onClick={() => {
                  setMapTheme('satellite');
                  setShowLayerMenu(false);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                  mapTheme === 'satellite' ? 'bg-[#e6eeff] text-[#1e40af] font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🛰️ Satellite
              </button>
              <button
                onClick={() => {
                  setMapTheme('dark');
                  setShowLayerMenu(false);
                }}
                className={`text-xs px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                  mapTheme === 'dark' ? 'bg-[#e6eeff] text-[#1e40af] font-bold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                🌙 Night Dark
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. LEAFLET MAP CONTAINER */}
      <div
        id="civic-live-map"
        ref={mapContainerRef}
        className="w-full h-full flex-1 z-0 bg-[#f8f9ff]"
      />

      {/* 4. BOTTOM FLOATING CARD PREVIEW (Exactly matching the screenshot) */}
      <div className="absolute bottom-20 left-4 right-4 z-[400] max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {selectedIssue && (
            <motion.div
              key={selectedIssue.id}
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white rounded-2xl p-3 sm:p-3.5 shadow-[0_10px_35px_rgba(13,28,46,0.12)] border border-slate-200/90 flex items-center gap-3.5"
            >
              {/* Left Thumbnail Photo */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100 shadow-inner">
                <img
                  src={selectedIssue.imageUrl}
                  alt={selectedIssue.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  crossOrigin="anonymous"
                />
              </div>

              {/* Right Content */}
              <div className="flex-1 min-w-0 pr-1">
                {/* Severity Badge */}
                {selectedIssue.severity === 'critical' ? (
                  <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 font-semibold px-2 py-0.5 rounded-md text-xs tracking-tight">
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.4]" />
                    <span>Critical</span>
                  </div>
                ) : selectedIssue.status === 'resolved' ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md text-xs tracking-tight">
                    <CheckCircle className="w-3.5 h-3.5 stroke-[2.4]" />
                    <span>Resolved</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-[#ffdbce] text-[#872d00] font-semibold px-2 py-0.5 rounded-md text-xs tracking-tight">
                    <Wrench className="w-3.5 h-3.5 stroke-[2.4]" />
                    <span>In Progress</span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-[#0d1c2e] font-bold text-[15px] sm:text-base leading-snug truncate mt-1">
                  {selectedIssue.title}
                </h3>

                {/* Reported time */}
                <p className="text-[#757684] text-xs sm:text-sm font-normal mt-0.5">
                  Reported {selectedIssue.reportedAt}
                </p>

                {/* View Details Link */}
                <button
                  id={`view-details-${selectedIssue.id}`}
                  type="button"
                  onClick={() => onViewDetails(selectedIssue)}
                  className="inline-flex items-center gap-1 text-[#1e40af] hover:text-[#00288e] font-bold text-xs sm:text-sm mt-1.5 transition-colors group cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
