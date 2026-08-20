import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import {
  ArrowRight, AlertTriangle, CheckCircle,
  Wrench, Layers, X, LocateFixed
} from 'lucide-react';
import { CivicIssue } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { loadMumbaiWards, MumbaiWardsGeoJSON, WardProperties } from '../data/mumbaiWards';
import * as turf from '@turf/turf';

interface MapScreenProps {
  issues: CivicIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string | null) => void;
  onViewDetails: (issue: CivicIssue) => void;
  onOpenFilter: () => void;
  onQuickReportAtLocation?: (lat: number, lng: number) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isAdmin?: boolean;
  darkMode?: boolean;
}

type ColorMode = 'issues' | 'resolution' | 'speed';

// ── Color helpers ────────────────────────────────────────────────────────────
function getWardFill(props: WardProperties, mode: ColorMode): string {
  if (mode === 'issues') {
    const v = props.activeIssues;
    if (v <= 5)  return '#86EFAC';
    if (v <= 15) return '#FDE047';
    if (v <= 25) return '#FDBA74';
    return '#FCA5A5';
  }
  if (mode === 'resolution') {
    const v = props.responseRate;
    if (v >= 90) return '#86EFAC';
    if (v >= 75) return '#FDE047';
    if (v >= 60) return '#FDBA74';
    return '#FCA5A5';
  }
  const v = props.avgResolution;
  if (v <= 2.0) return '#86EFAC';
  if (v <= 3.5) return '#FDE047';
  if (v <= 5.0) return '#FDBA74';
  return '#FCA5A5';
}

function findWardTurf(wards: MumbaiWardsGeoJSON, lng: number, lat: number) {
  const pt = turf.point([lng, lat]);
  for (const feature of wards.features) {
    if (turf.booleanPointInPolygon(pt, feature as any)) {
      return { properties: feature.properties, bounds: L.geoJSON(feature as any).getBounds() };
    }
  }
  return null;
}

// ── Pin icon HTML builder ────────────────────────────────────────────────────
function buildPinHtml(type: 'critical' | 'resolved' | 'in_progress', selected: boolean): string {
  const cls = selected ? 'scale-125 z-50' : 'hover:scale-110';
  const cfg = {
    critical:    { bg: '#dc2626', sh: 'rgba(220,38,38,0.35)',  path: `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>` },
    resolved:    { bg: '#16a34a', sh: 'rgba(22,163,74,0.35)',   path: `<polyline points="20 6 9 17 4 12"/>` },
    in_progress: { bg: '#854d0e', sh: 'rgba(133,77,14,0.35)',   path: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>` },
  };
  const { bg, sh, path } = cfg[type];
  return `<div class="pin-wrapper flex flex-col items-center cursor-pointer transition-transform ${cls}">
    <div style="background-color:${bg};box-shadow:0 4px 12px ${sh};" class="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white text-white">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>
    </div>
    <div style="background-color:${bg};" class="w-2.5 h-2.5 rounded-full mt-1 border border-white"></div>
  </div>`;
}

// ── Component ────────────────────────────────────────────────────────────────
export const MapScreen: React.FC<MapScreenProps> = ({
  issues, selectedIssueId, onSelectIssue, onViewDetails,
  onOpenFilter, onQuickReportAtLocation, searchQuery, onSearchChange,
  isAdmin = false, darkMode = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<L.Map | null>(null);
  const geoJsonRef      = useRef<L.GeoJSON | null>(null);
  const clusterRef      = useRef<L.MarkerClusterGroup | null>(null);
  const tileRef         = useRef<L.TileLayer | null>(null);
  const userMarkerRef   = useRef<L.Marker | null>(null);
  const zoomRef         = useRef(11);

  const [wardsData, setWardsData]   = useState<MumbaiWardsGeoJSON | null>(null);
  const [mapReady,  setMapReady]    = useState(false);
  const [mapTheme,  setMapTheme]    = useState<'streets' | 'satellite' | 'dark'>('streets');
  const [showLayers, setShowLayers] = useState(false);
  const [colorMode,  setColorMode]  = useState<ColorMode>('issues');
  const [selectedWard, setSelectedWard] = useState<WardProperties | null>(null);
  const [userWardId, setUserWardId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const MUMBAI_CENTER: L.LatLngExpression = [19.0760, 72.8777];

  // Issues with ward IDs assigned (ward assignment only for admin)
  const issuesWithWards = useMemo(() => {
    if (!isAdmin || !wardsData) {
      // For citizens (or before wards load), just return issues as-is
      return issues.map(iss => ({ ...iss, wardId: undefined }));
    }
    return issues.map((iss, i) => ({
      ...iss,
      wardId: wardsData.features[i % wardsData.features.length].properties.wardId,
    }));
  }, [issues, wardsData, isAdmin]);

  const selectedIssue = selectedIssueId
    ? issuesWithWards.find(i => i.id === selectedIssueId) ?? null
    : null;

  // Ward tooltip content (NO numbers/issue counts)
  const makeTooltip = (props: WardProperties, zoom: number, isUserWard: boolean) => {
    const pin = isUserWard ? `<div style="color:#2563EB;font-size:9px;margin-top:1px;font-weight:700">📍 You</div>` : '';
    if (zoom <= 12) {
      return `<div style="text-align:center;font-weight:900;font-size:12px">${props.wardId}${pin ? '<br>' + pin : ''}</div>`;
    }
    return `<div style="text-align:center;max-width:90px">
      <div style="font-weight:700;font-size:11px;line-height:1.2">${props.wardName}</div>
      ${pin}
    </div>`;
  };

  // Ward polygon style
  const getStyle = useCallback((feature: any, mode: ColorMode, uwId: string | null) => {
    const p = feature.properties as WardProperties;
    const isU = p.wardId === uwId;
    return {
      fillColor: getWardFill(p, mode),
      weight: isU ? 3 : 1.5,
      opacity: 1,
      color: isU ? '#2563EB' : '#1a1a1a',
      fillOpacity: isU ? 0.35 : 0.5,
    };
  }, []);

  // ── Step 1: Load ward data ───────────────────────────────────────────────
  useEffect(() => {
    loadMumbaiWards().then(data => setWardsData(data)).catch(console.error);
  }, []);

  // ── Step 2: Initialize map (once container is ready) ────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MUMBAI_CENTER,
      zoom: 11,
      minZoom: 10,
      maxZoom: 18,
      maxBounds: [[18.85, 72.75], [19.35, 73.05]],
      maxBoundsViscosity: 1.0,
      zoomControl: false,
    });

    const tile = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { attribution: '&copy; OpenStreetMap &copy; CARTO', maxZoom: 19, subdomains: 'abcd' }
    ).addTo(map);
    tileRef.current = tile;

    map.on('click', (e) => {
      onSelectIssue(null);
      // Zoom back to user's ward if exists, else Mumbai center, on background click
      if (userWardId && geoJsonRef.current) {
        let found = false;
        geoJsonRef.current.eachLayer((l: any) => {
          if (l.feature?.properties?.wardId === userWardId) {
            map.fitBounds(l.getBounds(), { padding: [40, 40], animate: true });
            found = true;
          }
        });
        if (!found) map.setView(MUMBAI_CENTER, 11, { animate: true });
      } else if (userLocation) {
        map.setView([userLocation?.lat ?? 0, userLocation?.lng ?? 0], 14, { animate: true });
      } else {
        map.setView(MUMBAI_CENTER, 11, { animate: true });
      }
      setSelectedWard(null);
      if (onQuickReportAtLocation) onQuickReportAtLocation(e.latlng?.lat ?? 0, e.latlng?.lng ?? 0);
    });

    map.on('zoomend', () => { zoomRef.current = map.getZoom(); });

    const cluster = L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 40 });
    map.addLayer(cluster);
    clusterRef.current = cluster;

    mapRef.current = map;
    setMapReady(true);
  }, [userWardId, userLocation]); // Re-bind click handler when userWardId changes

  useEffect(() => {
    if (!tileRef.current) return;
    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    const resolvedTheme = mapTheme === 'dark' || (mapTheme === 'streets' && darkMode) ? 'dark' : mapTheme;

    if (resolvedTheme === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    } else if (resolvedTheme === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
    tileRef.current.setUrl(url);
  }, [mapTheme, darkMode]);

  // ── Step 3: Render ward polygons (Admin only) ────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !wardsData || geoJsonRef.current) return;

    // Citizens: skip ward overlay entirely — just mark as "ready" so markers still load
    if (!isAdmin) {
      geoJsonRef.current = L.geoJSON(); // empty placeholder so markers still render
      return;
    }

    // Build inverted grey mask
    try {
      let outline: any = wardsData.features[0];
      for (let i = 1; i < wardsData.features.length; i++) {
        const next = wardsData.features[i] as any;
        const result = turf.union(turf.featureCollection([outline, next]));
        if (result) outline = result;
      }
      const world = turf.polygon([[[-180,-90],[180,-90],[180,90],[-180,90],[-180,-90]]]);
      const mask = turf.difference(turf.featureCollection([world, outline]));
      if (mask) {
        L.geoJSON(mask as any, {
          style: { fillColor: '#94A3B8', fillOpacity: 0.45, weight: 0 },
          interactive: false,
        }).addTo(map);
      }
    } catch (e) {
      console.warn('Mask generation failed', e);
    }

    // Ward polygons
    const layer = L.geoJSON(wardsData as any, {
      style: (f) => getStyle(f, colorMode, userWardId),
      onEachFeature: (feature, l) => {
        const props = feature.properties as WardProperties;
        l.bindTooltip(
          makeTooltip(props, map.getZoom(), props.wardId === userWardId),
          { permanent: true, direction: 'center', className: 'ward-label-styled' }
        );
        l.on({
          mouseover: (e) => e.target.setStyle({ weight: 3, color: '#2563EB', fillOpacity: 0.7 }),
          mouseout:  (e) => layer.resetStyle(e.target),
          click: (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedWard(props);
            map.fitBounds(e.target.getBounds(), { padding: [30, 30], animate: true });
          },
        });
      },
    }).addTo(map);
    geoJsonRef.current = layer;

    // Update tooltips on zoom
    map.on('zoomend', () => {
      const z = map.getZoom();
      layer.eachLayer((l: any) => {
        const p = l.feature?.properties as WardProperties | undefined;
        if (p) l.setTooltipContent(makeTooltip(p, z, p.wardId === userWardId));
      });
    });
  }, [mapReady, wardsData, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto Locate ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    // For admin, wait for ward data; for citizens, locate immediately
    if (isAdmin && !wardsData) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const inMumbai = lat >= 18.85 && lat <= 19.35 && lng >= 72.75 && lng <= 73.05;

        if (inMumbai && mapRef.current) {
          setUserLocation({ lat, lng });
          if (isAdmin && wardsData) {
            const ward = findWardTurf(wardsData, lng, lat);
            if (ward) {
              mapRef.current.fitBounds(ward.bounds, { padding: [40, 40], maxZoom: 14, animate: true, duration: 1.5 });
              setSelectedWard(ward.properties);
              setUserWardId(ward.properties.wardId);
            } else {
              mapRef.current.setView([lat, lng], 15, { animate: true });
            }
          } else {
            // Citizen: just zoom to their location
            mapRef.current.setView([lat, lng], 15, { animate: true });
          }

          const icon = L.divIcon({
            className: 'user-location-marker',
            html: `<div class="user-dot"><div class="user-dot-pulse"></div><div class="user-dot-center"></div></div>`,
            iconSize: [24, 24], iconAnchor: [12, 12],
          });
          if (userMarkerRef.current) userMarkerRef.current.remove();
          userMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(mapRef.current);
        } else {
          mapRef.current?.setView(MUMBAI_CENTER, 11);
        }
        setIsLocating(false);
      },
      () => {
        mapRef.current?.setView(MUMBAI_CENTER, 11);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [mapReady, isAdmin, wardsData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Re-style wards when colorMode or userWardId changes ─────────────────
  useEffect(() => {
    geoJsonRef.current?.eachLayer((l: any) => {
      const p = l.feature?.properties as WardProperties | undefined;
      if (!p) return;
      l.setStyle(getStyle(l.feature, colorMode, userWardId));
      l.setTooltipContent(makeTooltip(p, zoomRef.current, p.wardId === userWardId));
    });
  }, [colorMode, userWardId, getStyle]);

  // ── Tile theme change ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !tileRef.current) return;
    map.removeLayer(tileRef.current);
    const urls: Record<string, string> = {
      streets:   'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    };
    tileRef.current = L.tileLayer(urls[mapTheme], { attribution: '&copy; OSM', maxZoom: 19 }).addTo(map);
  }, [mapTheme]);

  // ── Update markers ───────────────────────────────────────────────────────
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();

    const filtered = selectedWard
      ? issuesWithWards.filter(i => i.wardId === selectedWard.wardId)
      : issuesWithWards;

    const markers = filtered.map(issue => {
      let type: 'critical' | 'resolved' | 'in_progress' = 'critical';
      if (issue.status === 'resolved') type = 'resolved';
      else if (issue.status === 'in_progress' || issue.status === 'scheduled') type = 'in_progress';

      const icon = L.divIcon({
        className: 'custom-civic-marker',
        html: buildPinHtml(type, issue.id === selectedIssueId),
        iconSize: [44, 54], iconAnchor: [22, 54],
      });
      const m = L.marker([issue.location?.lat ?? 0, issue.location?.lng ?? 0], { icon });
      m.on('click', () => onSelectIssue(issue.id));
      return m;
    });
    cluster.addLayers(markers);
  }, [issuesWithWards, selectedIssueId, selectedWard]);

  // ── Pan to selected issue ────────────────────────────────────────────────
  useEffect(() => {
    if (selectedIssue && mapRef.current) {
      mapRef.current.panTo([selectedIssue.location?.lat ?? 0, selectedIssue.location?.lng ?? 0], { animate: true, duration: 0.5 });
    }
  }, [selectedIssueId]);

  const handleRecenter = () => {
    if (userWardId && geoJsonRef.current && mapRef.current) {
      geoJsonRef.current.eachLayer((l: any) => {
        if (l.feature?.properties?.wardId === userWardId) {
          mapRef.current!.fitBounds(l.getBounds(), { padding: [40, 40], animate: true });
        }
      });
    } else if (userLocation && mapRef.current) {
      mapRef.current.setView([userLocation?.lat ?? 0, userLocation?.lng ?? 0], 14, { animate: true });
    } else {
      mapRef.current?.setView(MUMBAI_CENTER, 11, { animate: true });
    }
    setSelectedWard(null);
    onSelectIssue(null);
  };

  const zoomToWard = (wId: string) => {
    if (!wId) { 
      mapRef.current?.setView(MUMBAI_CENTER, 11, { animate: true });
      setSelectedWard(null);
      return;
    }
    geoJsonRef.current?.eachLayer((l: any) => {
      if (l.feature?.properties?.wardId === wId) {
        mapRef.current?.fitBounds(l.getBounds(), { padding: [30, 30] });
        setSelectedWard(l.feature.properties as WardProperties);
      }
    });
  };

  const sortedWards = useMemo(
    () => wardsData
      ? [...wardsData.features].sort((a, b) => a.properties.wardName.localeCompare(b.properties.wardName))
      : [],
    [wardsData]
  );

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full min-h-[640px] flex flex-col overflow-hidden select-none">
      
      {isLocating && (
        <div className="absolute inset-0 z-[1000] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center transition-colors">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-600 dark:text-slate-300 font-medium">Finding your ward...</p>
        </div>
      )}

      {/* Ward selector — Admin only */}
      {isAdmin && (
        <div className="absolute top-4 left-4 z-[400]">
          <select
            onChange={(e) => zoomToWard(e.target.value)}
            value={selectedWard?.wardId ?? ''}
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg border border-slate-200 dark:border-slate-700/60 text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none max-w-[200px]"
          >
            <option value="">🗺️ All Wards</option>
            {sortedWards.map(w => (
              <option key={w.properties.wardId} value={w.properties.wardId} className="dark:bg-slate-800">
                {w.properties.wardId} — {w.properties.wardName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Color mode toggles — Admin only */}
      {isAdmin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex bg-white/95 dark:bg-slate-850/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 dark:border-slate-700/50 p-1 text-xs font-semibold gap-0.5">
          {(['issues', 'resolution', 'speed'] as ColorMode[]).map(m => (
            <button key={m} onClick={() => setColorMode(m)}
              className={`px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${colorMode === m ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}>
              {m === 'issues' ? '🚨 Issues' : m === 'resolution' ? '✅ Response' : '⏱️ Speed'}
            </button>
          ))}
        </div>
      )}

      {/* Right-side controls */}
      <div className="absolute right-4 top-16 z-[400] flex flex-col gap-2">
        <div className="relative">
          <button onClick={() => setShowLayers(v => !v)} title="Map Theme"
            className="w-10 h-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-full shadow-md border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 transition-all">
            <Layers className="w-5 h-5" />
          </button>
          {showLayers && (
            <div className="absolute right-12 top-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/60 p-1.5 w-32 flex flex-col gap-1 z-50">
              {(['streets', 'satellite', 'dark'] as const).map(t => (
                <button key={t} onClick={() => { setMapTheme(t); setShowLayers(false); }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${mapTheme === t ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700/60'}`}>
                  {t === 'streets' ? '🗺️ Streets' : t === 'satellite' ? '🛰️ Satellite' : '🌙 Dark'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map container */}
      <div id="civic-live-map" ref={mapContainerRef} className="w-full h-full flex-1 z-0 bg-[#e2e8f0]" />

      {/* Recenter Button */}
      <div className="absolute bottom-24 right-4 z-[400]">
        <button onClick={handleRecenter} title="Recenter to your location"
          className="w-11 h-11 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-blue-600 dark:text-blue-400 rounded-full shadow-lg border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-transform hover:scale-105 active:scale-95">
          <LocateFixed className="w-5 h-5" />
        </button>
      </div>

      {/* Ward info card (without active issues counts) */}
      <AnimatePresence>
        {selectedWard && !selectedIssue && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }} transition={{ duration: 0.28, ease: 'easeOut' }}
            className="absolute bottom-20 left-4 right-4 z-[400] bg-white dark:bg-slate-850 rounded-2xl shadow-xl p-4 max-w-md mx-auto border border-slate-100 dark:border-slate-800/80 transition-colors"
          >
            <button onClick={() => {
              setSelectedWard(null);
              if (userWardId && geoJsonRef.current && mapRef.current) {
                geoJsonRef.current.eachLayer((l: any) => {
                  if (l.feature?.properties?.wardId === userWardId) {
                    mapRef.current!.fitBounds(l.getBounds(), { padding: [40, 40], animate: true });
                  }
                });
              } else {
                 mapRef.current?.setView(MUMBAI_CENTER, 11, { animate: true });
              }
            }} className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">🏘️</div>
              <div>
                <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-slate-100">Ward {selectedWard.wardId}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedWard.wardName} · <span className="text-slate-400 dark:text-slate-500">{selectedWard.zone}</span></p>
                {selectedWard.wardId === userWardId && (
                  <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-bold mt-0.5">📍 You are here</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-center mb-3">
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-2.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-lg">{selectedWard.responseRate}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Response Rate</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-2.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-lg">{selectedWard.avgResolution}d</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Fix Time</div>
              </div>
            </div>
            <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-750 text-white rounded-xl font-bold text-sm transition-colors">
              View Issues →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issue preview card */}
      <div className="absolute bottom-20 left-4 right-4 z-[400] max-w-md mx-auto pointer-events-none">
        <AnimatePresence mode="wait">
          {selectedIssue && (
            <motion.div
              key={selectedIssue.id}
              initial={{ opacity: 0, y: '100%' }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }} transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white dark:bg-slate-850 rounded-2xl p-3 sm:p-3.5 shadow-xl border border-slate-200/90 dark:border-slate-700/60 flex items-center gap-3.5 pointer-events-auto transition-colors"
            >
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-750">
                <img src={selectedIssue.imageUrl} alt={selectedIssue.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" crossOrigin="anonymous" />
              </div>
              <div className="flex-1 min-w-0">
                {selectedIssue.severity === 'critical' ? (
                  <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded-md text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 stroke-[2.4]" /><span>Critical</span>
                  </div>
                ) : selectedIssue.status === 'resolved' ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-md text-xs">
                    <CheckCircle className="w-3.5 h-3.5 stroke-[2.4]" /><span>Resolved</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-md text-xs">
                    <Wrench className="w-3.5 h-3.5 stroke-[2.4]" /><span>In Progress</span>
                  </div>
                )}
                <h3 className="text-slate-900 dark:text-slate-100 font-bold text-[15px] leading-snug truncate mt-1">{selectedIssue.title}</h3>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Reported {selectedIssue.reportedAt}</p>
                <button onClick={() => onViewDetails(selectedIssue)}
                  className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 font-bold text-xs mt-1.5 group transition-colors">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
