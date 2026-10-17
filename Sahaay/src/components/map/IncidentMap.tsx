import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { Report } from '../../types';
import { UrgencyBadge, StatusBadge } from '../common/Badge';
import { 
  MapPin, 
  Navigation, 
  Eye, 
  Filter, 
  Search, 
  Loader2, 
  AlertCircle, 
  X, 
  PlusCircle, 
  Compass, 
  Building,
  Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface IncidentMapProps {
  reports: Report[];
  onSelectReport?: (report: Report) => void;
  selectedReportId?: string;
  height?: string;
  initialCity?: string;
}

// Preset Indian Hubs for instant one-click navigation
const PRESET_HUBS: Record<string, { lat: number; lng: number; zoom: number }> = {
  Pune: { lat: 18.5204, lng: 73.8567, zoom: 12 },
  Nagpur: { lat: 21.1458, lng: 79.0882, zoom: 12 },
  Mumbai: { lat: 19.0760, lng: 72.8777, zoom: 12 },
  Bengaluru: { lat: 12.9716, lng: 77.5946, zoom: 12 },
  Delhi: { lat: 28.6139, lng: 77.2090, zoom: 12 },
  Hyderabad: { lat: 17.3850, lng: 78.4867, zoom: 12 },
  Kolkata: { lat: 22.5726, lng: 88.3639, zoom: 12 },
  Chennai: { lat: 13.0827, lng: 80.2707, zoom: 12 },
  Jaipur: { lat: 26.9124, lng: 75.7873, zoom: 12 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714, zoom: 12 },
};

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  lat: number;
  lng: number;
  type: 'incident' | 'city' | 'address';
  cityName?: string;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  reports,
  onSelectReport,
  selectedReportId,
  height = '560px',
  initialCity = 'all',
}) => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const searchPinMarkerRef = useRef<L.Marker | null>(null);

  // Filters & Selected State
  const [selectedHub, setSelectedHub] = useState<string>(initialCity);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<Report | null>(null);

  // Search Suggestions State
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [activeSearchedLocation, setActiveSearchedLocation] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);

  // Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationNotice, setLocationNotice] = useState<{ text: string; isError: boolean } | null>(null);

  // Filter reports
  const filteredReports = reports.filter(r => {
    if (selectedHub !== 'all' && PRESET_HUBS[selectedHub]) {
      if (r.location.city.toLowerCase() !== selectedHub.toLowerCase()) {
        return false;
      }
    }
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
    if (urgencyFilter !== 'all' && r.urgency !== urgencyFilter) return false;
    
    // In-map text filter
    if (searchQuery.trim() && !showSearchDropdown) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchAddress = r.location.address.toLowerCase().includes(q);
      const matchLandmark = (r.location.landmark || '').toLowerCase().includes(q);
      const matchTracking = r.trackingNumber.toLowerCase().includes(q);
      const matchCity = r.location.city.toLowerCase().includes(q);
      if (!matchTitle && !matchAddress && !matchLandmark && !matchTracking && !matchCity) {
        return false;
      }
    }
    return true;
  });

  // Create custom marker icon for incidents
  const createIncidentMarkerIcon = (urgency: string, isSelected: boolean) => {
    let colorClass = 'bg-forest-600 text-white';
    let ringClass = 'ring-forest-400';
    let pulse = '';

    if (urgency === 'critical') {
      colorClass = 'bg-rose-600 text-white';
      ringClass = 'ring-rose-400';
      pulse = '<div class="absolute -inset-1 rounded-full bg-rose-500 animate-ping opacity-60"></div>';
    } else if (urgency === 'high') {
      colorClass = 'bg-amber-500 text-slate-950';
      ringClass = 'ring-amber-300';
    } else if (urgency === 'medium') {
      colorClass = 'bg-gold-500 text-slate-950';
      ringClass = 'ring-gold-300';
    }

    const selectedRing = isSelected ? 'ring-4 ring-offset-2 ring-forest-700 dark:ring-white scale-125' : '';

    const html = `
      <div class="relative flex items-center justify-center transition-transform">
        ${pulse}
        <div class="w-8 h-8 rounded-full shadow-lg flex items-center justify-center font-bold text-xs ${colorClass} ${ringClass} ring-2 ${selectedRing}">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'sahaay-incident-marker',
      html,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -28],
    });
  };

  // Distinct User Device Marker (Pulsing Blue Radar)
  const createUserMarkerIcon = () => {
    const html = `
      <div class="relative flex items-center justify-center">
        <div class="absolute -inset-2.5 rounded-full bg-blue-500 animate-ping opacity-75"></div>
        <div class="relative w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center ring-4 ring-blue-300 ring-offset-2">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3m0 14v3M2 12h3m14 0h3" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'sahaay-user-marker',
      html,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  };

  // Distinct Search / Clicked Location Marker (Indigo Target Pin)
  const createSearchPinIcon = () => {
    const html = `
      <div class="relative flex items-center justify-center animate-bounce">
        <div class="w-9 h-9 rounded-full bg-indigo-600 text-white shadow-2xl flex items-center justify-center ring-4 ring-indigo-300 ring-offset-2">
          <svg class="w-5 h-5 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <line x1="22" y1="12" x2="18" y2="12" />
            <line x1="6" y1="12" x2="2" y2="12" />
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="12" y1="22" x2="12" y2="18" />
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'sahaay-search-pin',
      html,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = 
        initialCity !== 'all' && PRESET_HUBS[initialCity]
          ? [PRESET_HUBS[initialCity].lat, PRESET_HUBS[initialCity].lng]
          : [19.8, 76.5]; // Maharashtra overview

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialCity !== 'all' ? 12 : 7,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Interactive Map Click: allow citizen/dispatcher to drop a pin anywhere!
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        placeSearchOrClickedPin(lat, lng, `Selected Coordinate (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers with Filtered Reports
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous incident markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds([]);

    filteredReports.forEach(report => {
      const isSelected = report.id === selectedReportId;
      const icon = createIncidentMarkerIcon(report.urgency, isSelected);

      const marker = L.marker([report.location.lat, report.location.lng], { icon }).addTo(map);

      marker.on('click', () => {
        setActiveReport(report);
        if (onSelectReport) onSelectReport(report);
      });

      markersRef.current[report.id] = marker;
      bounds.extend([report.location.lat, report.location.lng]);
    });

    // Auto-fit to filtered reports if "all" is selected and reports exist
    if (filteredReports.length > 0 && bounds.isValid() && selectedHub === 'all' && !activeSearchedLocation) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [filteredReports, selectedReportId, selectedHub]);

  // Place or Move Search / Clicked Location Pin
  const placeSearchOrClickedPin = (lat: number, lng: number, label: string, cityName?: string) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (searchPinMarkerRef.current) {
      searchPinMarkerRef.current.remove();
    }

    const derivedCity = cityName || (label.includes('Nagpur') ? 'Nagpur' : label.includes('Pune') ? 'Pune' : 'Pune');
    const reportLink = `/citizen/report?lat=${lat.toFixed(5)}&lng=${lng.toFixed(5)}&city=${encodeURIComponent(derivedCity)}&address=${encodeURIComponent(label)}`;

    const marker = L.marker([lat, lng], {
      icon: createSearchPinIcon(),
      zIndexOffset: 900,
    })
      .addTo(map)
      .bindPopup(
        `<div class="p-2 space-y-2 text-xs min-w-[200px]">
          <div class="border-b border-slate-200 pb-1.5">
            <span class="text-[10px] uppercase font-bold text-indigo-600 block">Location Pin</span>
            <strong class="text-slate-900 text-xs block mt-0.5 leading-tight">${label}</strong>
            <span class="text-[11px] text-slate-500 block mt-1">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</span>
          </div>
          <a
            href="${reportLink}"
            class="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-forest-700 hover:bg-forest-800 text-white rounded-lg font-bold text-xs text-center transition-colors shadow-sm"
          >
            <span>+ Report Incident Here</span>
          </a>
        </div>`
      );

    searchPinMarkerRef.current = marker;
    setActiveSearchedLocation({ name: label, lat, lng });
    map.flyTo([lat, lng], 13, { duration: 1.2 });
    marker.openPopup();
  };

  // Perform Location Search (Local Presets + Incidents + OpenStreetMap Geocoder)
  const handleSearchInputChange = async (value: string) => {
    setSearchQuery(value);
    if (!value.trim() || value.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setShowSearchDropdown(true);
    const query = value.toLowerCase();
    const suggestions: SearchResultItem[] = [];

    // 1. Check in-memory reports
    reports.forEach(r => {
      if (
        r.title.toLowerCase().includes(query) ||
        r.trackingNumber.toLowerCase().includes(query) ||
        r.location.address.toLowerCase().includes(query) ||
        (r.location.landmark || '').toLowerCase().includes(query)
      ) {
        suggestions.push({
          id: `rep-${r.id}`,
          title: `${r.trackingNumber}: ${r.title}`,
          subtitle: `${r.location.address}, ${r.location.city}`,
          lat: r.location.lat,
          lng: r.location.lng,
          type: 'incident',
          cityName: r.location.city,
        });
      }
    });

    // 2. Check predefined Indian cities
    Object.entries(PRESET_HUBS).forEach(([cityName, coords]) => {
      if (cityName.toLowerCase().includes(query)) {
        suggestions.push({
          id: `city-${cityName}`,
          title: `${cityName}, India`,
          subtitle: `Direct map navigation to ${cityName} metropolitan zone`,
          lat: coords.lat,
          lng: coords.lng,
          type: 'city',
          cityName,
        });
      }
    });

    setSearchResults(suggestions);

    // 3. Query OpenStreetMap Nominatim for address & locality geocoding across India
    if (value.trim().length >= 3) {
      setIsSearchingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5&countrycodes=in&addressdetails=1`,
          { headers: { Accept: 'application/json' } }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const geocoded: SearchResultItem[] = data.map((item: any, idx: number) => {
              const cityName =
                item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.state_district ||
                item.address?.state ||
                'India';
              return {
                id: `geo-${idx}-${item.place_id}`,
                title: item.display_name.split(',')[0] || item.name,
                subtitle: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                type: 'address',
                cityName,
              };
            });

            setSearchResults(prev => {
              // Combine local matches + geocoded results, deduplicating IDs
              const combined = [...prev];
              geocoded.forEach(g => {
                if (!combined.some(c => Math.abs(c.lat - g.lat) < 0.001 && Math.abs(c.lng - g.lng) < 0.001)) {
                  combined.push(g);
                }
              });
              return combined;
            });
          }
        }
      } catch (err) {
        // Fallback gracefully without breaking UI if geocoder network fails
        console.warn('Geocoding request failed; using local fallbacks', err);
      } finally {
        setIsSearchingLocation(false);
      }
    }
  };

  // Select a suggestion
  const handleSelectSearchResult = (result: SearchResultItem) => {
    setShowSearchDropdown(false);
    setSearchQuery(result.title);
    placeSearchOrClickedPin(result.lat, result.lng, result.subtitle || result.title, result.cityName);
  };

  // Switch Quick City Hub
  const handleHubChange = (hub: string) => {
    setSelectedHub(hub);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hub === 'all') {
      map.flyTo([19.8, 76.5], 7, { duration: 1.2 });
      setActiveSearchedLocation(null);
      if (searchPinMarkerRef.current) searchPinMarkerRef.current.remove();
    } else if (PRESET_HUBS[hub]) {
      const { lat, lng, zoom } = PRESET_HUBS[hub];
      map.flyTo([lat, lng], zoom, { duration: 1.2 });
      placeSearchOrClickedPin(lat, lng, `${hub} City Center`, hub);
    }
  };

  // Locate Me with Device Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setLocationNotice({
        text: 'Geolocation is not supported by your browser.',
        isError: true,
      });
      return;
    }

    setIsLocating(true);
    setLocationNotice(null);

    navigator.geolocation.getCurrentPosition(
      async position => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = mapInstanceRef.current;
        if (map) {
          if (userMarkerRef.current) {
            userMarkerRef.current.remove();
          }

          // Optional reverse geocoding to resolve street name
          let resolvedAddress = `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
          try {
            const revRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            if (revRes.ok) {
              const revData = await revRes.json();
              if (revData && revData.display_name) {
                resolvedAddress = revData.display_name.split(',').slice(0, 3).join(',');
              }
            }
          } catch {
            // Keep default lat/lng
          }

          const userMarker = L.marker([latitude, longitude], {
            icon: createUserMarkerIcon(),
            zIndexOffset: 1000,
          })
            .addTo(map)
            .bindPopup(
              `<div class="p-2 space-y-2 text-xs min-w-[200px]">
                <div>
                  <strong class="text-blue-700 block font-bold text-xs">Your Current Location</strong>
                  <p class="text-slate-700 text-xs mt-0.5">${resolvedAddress}</p>
                  <p class="text-[10px] text-slate-400 mt-0.5">${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (Device GPS)</p>
                </div>
                <a
                  href="/citizen/report?lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}&address=${encodeURIComponent(
                resolvedAddress
              )}"
                  class="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 bg-forest-700 hover:bg-forest-800 text-white rounded-lg font-bold text-xs transition-colors"
                >
                  <span>+ Report Incident at My Spot</span>
                </a>
              </div>`
            );

          userMarkerRef.current = userMarker;
          map.flyTo([latitude, longitude], 14, { duration: 1.5 });
          userMarker.openPopup();

          setLocationNotice({
            text: `GPS active: Positioned at ${resolvedAddress}`,
            isError: false,
          });
        }
      },
      error => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. You can search any city, landmark, or address using the search bar above.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location signal unavailable. Try searching your city manually.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please retry or search above.';
        }
        setLocationNotice({ text: msg, isError: true });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 shadow-soft">
      {/* Map Control Bar */}
      <div className="p-3 sm:p-4 bg-sage-50/70 dark:bg-night-850/60 border-b border-sage-200 dark:border-night-700 space-y-3">
        {/* Row 1: Search, Quick Hubs, and Locate Me */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Universal Location Search Bar */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search any Indian city, landmark, or street (e.g., Nagpur, FC Road, Mumbai, Sadar)..."
              value={searchQuery}
              onChange={e => handleSearchInputChange(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              className="w-full pl-8 pr-16 py-2 text-xs rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-500 shadow-sm"
            />
            
            <div className="absolute right-2 top-2 flex items-center gap-1">
              {isSearchingLocation && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-600 mr-1" />
              )}
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowSearchDropdown(false);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Popover */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-night-850 rounded-xl shadow-2xl border border-sage-200 dark:border-night-700 max-h-72 overflow-y-auto divide-y divide-sage-100 dark:divide-night-750">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-sage-50/50 dark:bg-night-800">
                  Search Results & Navigational Matches
                </div>
                {searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item)}
                    className="w-full text-left p-2.5 hover:bg-sage-100/60 dark:hover:bg-night-750 flex items-start gap-2.5 transition-colors"
                  >
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'incident' ? (
                        <div className="w-6 h-6 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                      ) : item.type === 'city' ? (
                        <div className="w-6 h-6 rounded-lg bg-forest-100 dark:bg-forest-950/60 text-forest-700 dark:text-forest-300 flex items-center justify-center">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Hub Preset Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedHub}
              onChange={e => handleHubChange(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-forest-500 shadow-sm"
              title="Quick Jump to City Hub"
            >
              <option value="all">Overview: All Hubs</option>
              <option value="Pune">Hub: Pune (HQ)</option>
              <option value="Nagpur">Hub: Nagpur</option>
              <option value="Mumbai">Hub: Mumbai</option>
              <option value="Bengaluru">Hub: Bengaluru</option>
              <option value="Delhi">Hub: Delhi NCR</option>
              <option value="Hyderabad">Hub: Hyderabad</option>
              <option value="Kolkata">Hub: Kolkata</option>
              <option value="Chennai">Hub: Chennai</option>
              <option value="Jaipur">Hub: Jaipur</option>
              <option value="Ahmedabad">Hub: Ahmedabad</option>
            </select>

            {/* Locate Me Button */}
            <button
              onClick={handleLocateMe}
              disabled={isLocating}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold transition-colors shrink-0 shadow-sm"
              title="Detect device GPS position"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span className="hidden sm:inline">Detecting...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Locate Me</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Filter Bar & Active Focal Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-sage-200/60 dark:border-night-700/60">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Filter className="w-3 h-3 text-forest-600 dark:text-forest-400" />
              <span>Filters:</span>
            </span>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value="all">All Species</option>
              <option value="dog">Dogs (Indie)</option>
              <option value="cat">Cats & Kittens</option>
              <option value="cattle">Cattle / Cows</option>
              <option value="bird">Birds</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={e => setUrgencyFilter(e.target.value)}
              className="px-2 py-1 rounded-lg border border-sage-200 dark:border-night-700 bg-white dark:bg-night-800 text-slate-800 dark:text-slate-200 text-xs"
            >
              <option value="all">All Urgency</option>
              <option value="critical">Critical (Rabies / Red-line)</option>
              <option value="high">High Priority</option>
              <option value="medium">Standard Priority</option>
              <option value="low">Routine Care</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Showing <strong className="text-slate-900 dark:text-white">{filteredReports.length}</strong> incident{filteredReports.length === 1 ? '' : 's'}
            </span>
            {userLocation && (
              <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping inline-block"></span>
                <span>User GPS Active</span>
              </span>
            )}
            {activeSearchedLocation && (
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block"></span>
                <span className="truncate max-w-[140px]">{activeSearchedLocation.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* Location Notice (GPS info or graceful permission denial) */}
        {locationNotice && (
          <div
            className={`px-3 py-1.5 rounded-lg border text-[11px] flex items-center justify-between transition-all ${
              locationNotice.isError
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${locationNotice.isError ? 'text-rose-600' : 'text-emerald-600'}`} />
              <span>{locationNotice.text}</span>
            </span>
            <button
              onClick={() => setLocationNotice(null)}
              className="text-slate-400 hover:text-slate-600 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Transparent Sample Data Notice Banner */}
      <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>Sample Demonstration Data:</strong> Colored markers represent simulated case studies. Click anywhere on the map or search any address to target and log an incident.
          </span>
        </span>
        <span className="font-semibold uppercase tracking-wider text-[10px] hidden md:inline">OpenStreetMap Multi-City Triage</span>
      </div>

      {/* Map Container */}
      <div className="relative w-full" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Quick Action Tip */}
        <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-night-800/90 backdrop-blur-md border border-sage-200 dark:border-night-700 shadow-md text-[11px] text-slate-600 dark:text-slate-300">
          <Compass className="w-3.5 h-3.5 text-forest-600" />
          <span>Click anywhere on the map to set a rescue pin</span>
        </div>

        {/* Selected Incident Drawer in bottom corner */}
        {activeReport && (
          <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-20 bg-white/95 dark:bg-night-800/95 backdrop-blur-md rounded-2xl shadow-xl border border-sage-200 dark:border-night-700 p-4 transition-all animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-forest-700 dark:text-forest-400">
                    {activeReport.trackingNumber}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sage-100 dark:bg-night-700 text-slate-700 dark:text-slate-300">
                    {activeReport.location.city}
                  </span>
                  <UrgencyBadge urgency={activeReport.urgency} size="sm" />
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  {activeReport.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-xs"
                title="Close popup"
              >
                ✕
              </button>
            </div>

            <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{activeReport.location.address}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-sage-100 dark:border-night-700 flex items-center justify-between">
              <StatusBadge status={activeReport.status} size="sm" />
              <Link
                to={`/citizen/reports/${activeReport.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400 hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Timeline</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
