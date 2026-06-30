import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Scoped styles to inject for the 3D map, markers, panels and custom animations
const mapStyles = `
  .map-container-wrapper {
    position: relative;
    width: 100%;
    height: 650px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }

  #map-libre {
    width: 100%;
    height: 100%;
  }

  /* Status Panel floating styles */
  .map-status-panel {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    width: 300px;
    box-sizing: border-box;
    max-height: calc(100% - 32px);
    overflow-y: auto;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .dark .map-status-panel {
    background: rgba(17, 24, 39, 0.92);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
    color: #e5e7eb;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .panel-title {
    font-size: 15px;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dark .panel-title {
    color: #f8fafc;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 20px;
    color: #64748b;
  }

  .dark .status-badge {
    background: #374151;
    color: #9ca3af;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    background-color: #cbd5e1;
    border-radius: 50%;
    display: inline-block;
  }

  .status-badge.active {
    color: #15803d;
    background: #dcfce7;
  }

  .dark .status-badge.active {
    color: #4ade80;
    background: rgba(22, 163, 74, 0.2);
  }

  .status-badge.active .status-dot {
    background-color: #10b981;
    animation: blink 1.2s infinite;
  }

  @keyframes blink {
    0%, 100% {
      opacity: 0.4;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  .info-card {
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(0, 0, 0, 0.03);
    border-radius: 8px;
    padding: 10px;
    font-size: 12px;
    line-height: 1.5;
    margin-bottom: 10px;
    color: #334155;
  }

  .dark .info-card {
    background: rgba(31, 41, 55, 0.6);
    border-color: rgba(255, 255, 255, 0.05);
    color: #cbd5e1;
  }

  .panel-section {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e2e8f0;
  }

  .dark .panel-section {
    border-color: #374151;
  }

  .panel-section label {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    display: block;
    margin-bottom: 6px;
  }

  .dark .panel-section label {
    color: #9ca3af;
  }

  .style-select {
    width: 100%;
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    background-color: #fff;
    font-size: 13px;
    color: #1e293b;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }

  .dark .style-select {
    border-color: #374151;
    background-color: #1f2937;
    color: #e5e7eb;
  }

  .action-btn {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 6px;
    background-color: #2563eb;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background-color 0.15s, transform 0.1s;
  }

  .action-btn:hover {
    background-color: #1d4ed8;
  }

  .action-btn:active {
    transform: scale(0.98);
  }

  .maplibregl-ctrl-group {
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
    border: 1px solid #e2e8f0 !important;
  }

  .dark .maplibregl-ctrl-group {
    background: #1f2937 !important;
    border-color: #374151 !important;
  }

  /* 3D Isometric Station Marker Styles */
  .ev-station-marker {
    width: 70px !important;
    height: 85px !important;
    perspective: 1000px;
  }

  .ev-station-3d-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  .ev-station-3d-pulse-ring {
    position: absolute;
    bottom: 4px;
    width: 52px;
    height: 22px;
    border: 2px solid #10b981;
    border-radius: 50%;
    transform: rotateX(55deg);
    pointer-events: none;
    animation: station-radar-sweep 2s infinite ease-out;
    box-shadow: 0 0 14px rgba(16, 185, 129, 0.7);
  }

  .ev-station-3d-kiosk {
    width: 100%;
    height: 100%;
    cursor: pointer;
    animation: station-bobbing 3.5s ease-in-out infinite;
    filter: drop-shadow(0px 12px 14px rgba(15, 23, 42, 0.4));
    transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-origin: bottom center;
  }

  .ev-station-3d-kiosk:hover {
    transform: scale(1.15) translateY(-6px);
    filter: drop-shadow(0px 18px 24px rgba(16, 185, 129, 0.5));
  }

  .neon-flash-slow {
    animation: neon-breathing 2.4s infinite ease-in-out;
  }

  .neon-flash-fast {
    animation: neon-breathing 1.2s infinite ease-in-out;
  }

  @keyframes station-bobbing {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-7px);
    }
  }

  @keyframes station-radar-sweep {
    0% {
      transform: scale(0.3) rotateX(55deg);
      opacity: 1;
    }
    100% {
      transform: scale(1.6) rotateX(55deg);
      opacity: 0;
    }
  }

  @keyframes neon-breathing {
    0%, 100% {
      opacity: 0.55;
      filter: brightness(0.85) drop-shadow(0 0 1px currentColor);
    }
    50% {
      opacity: 1;
      filter: brightness(1.4) drop-shadow(0 0 6px currentColor);
    }
  }

  /* User vehicle arrow styles */
  .user-location-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    position: relative;
  }

  .user-car-arrow {
    width: 36px;
    height: 36px;
    filter: drop-shadow(0px 4px 6px rgba(15, 23, 42, 0.3));
    z-index: 2;
  }

  .user-pulse-ring {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 2px solid #2563eb;
    background-color: rgba(37, 99, 235, 0.15);
    border-radius: 50%;
    animation: geo-pulse 2.2s infinite ease-out;
    z-index: 1;
    pointer-events: none;
  }

  @keyframes geo-pulse {
    0% {
      transform: scale(0.2);
      opacity: 0.8;
    }
    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  /* Popup style overrides */
  .maplibregl-popup-content {
    border-radius: 12px !important;
    padding: 10px 14px !important;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
    font-family: inherit !important;
  }

  .dark .maplibregl-popup-content {
    background: #1f2937 !important;
    color: #e5e7eb !important;
  }

  @media (max-width: 768px) {
    .map-status-panel {
      top: auto;
      left: 0;
      bottom: 0;
      width: 100%;
      max-height: 45vh;
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.08);
      padding: 16px 20px 24px 20px;
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.6);
    }

    .map-status-panel::before {
      content: '';
      display: block;
      width: 36px;
      height: 4px;
      background: #cbd5e1;
      border-radius: 2px;
      margin: -4px auto 12px auto;
    }

    .panel-container-mobile {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .panel-section {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .mobile-full-width {
      grid-column: span 2;
    }
  }

  /* Route duration badges on the map */
  .route-badge-container {
    background: white;
    border: 2px solid #2563eb;
    border-radius: 6px;
    padding: 3px 6px;
    font-size: 10px;
    font-weight: 700;
    color: #1e293b;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    pointer-events: auto;
    cursor: pointer;
    white-space: nowrap;
    text-align: center;
    transition: all 0.2s;
    user-select: none;
  }
  .route-badge-container.inactive {
    border-color: #94a3b8;
    color: #64748b;
    opacity: 0.85;
  }
  .route-badge-container:hover {
    transform: scale(1.08);
  }
  .dark .route-badge-container {
    background: #1f2937;
    color: #f8fafc;
  }
`;

type Station = {
  id: number;
  name: string;
  address: string;
  quanName?: string;
  provinceName?: string;
  phuongxaName?: string;
  status: string;
  latitude?: number;
  longitude?: number;
};

interface Station3DMapProps {
  stations: Station[];
  focusStationId?: number | null;
  onClearFocus?: () => void;
  filterArea?: string;
}

export default function Station3DMap({ stations, focusStationId, onClearFocus, filterArea }: Station3DMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const markersRef = useRef<{ [key: number]: maplibregl.Marker }>({});

  const [mapStyleUrl, setMapStyleUrl] = useState("https://tiles.openfreemap.org/styles/liberty");
  const [gpsStatus, setGpsStatus] = useState<"OFFLINE" | "LIVE">("OFFLINE");
  const [gpsInfo, setGpsInfo] = useState("Đang chờ quyền truy cập vị trí phần cứng...");
  const [weatherText, setWeatherText] = useState("Chờ GPS...");
  const [isTracking, setIsTracking] = useState(true);

  const [currentCarCoords, setCurrentCarCoords] = useState<[number, number] | null>(null);
  const [targetStationCoords, setTargetStationCoords] = useState<[number, number] | null>(null);

  const [routes, setRoutes] = useState<any[]>([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState<number>(0);
  const routeMarkersRef = useRef<maplibregl.Marker[]>([]);

  // 1. Math utilities for bearing calculation
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const lat1Rad = (lat1 * Math.PI) / 180;
    const lat2Rad = (lat2 * Math.PI) / 180;
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x =
      Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // Helper to parse weather conditions
  const parseWeatherCode = (code: number) => {
    if (code === 0) return "Trời quang đãng ☀️";
    if ([1, 2, 3].includes(code)) return "Nắng rải rác ⛅";
    if ([45, 48].includes(code)) return "Sương mù 🌫️";
    if ([51, 53, 55, 56, 57].includes(code)) return "Mưa phùn nhẹ 🌧️";
    if ([61, 63, 65, 66, 67].includes(code)) return "Mưa lớn 🌧️";
    if ([80, 81, 82].includes(code)) return "Mưa rào nhẹ 🌦️";
    if ([95, 96, 99].includes(code)) return "Có dông sét ⌁ ⛈️";
    return "Mây thay đổi";
  };

  // 2. Weather fetching from OpenMeteo
  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
      );
      const data = await response.json();
      if (data.current_weather) {
        const temp = data.current_weather.temperature;
        const code = data.current_weather.weathercode;
        setWeatherText(`${parseWeatherCode(code)} ${temp}°C`);
      } else {
        setWeatherText("N/A");
      }
    } catch {
      setWeatherText("Lỗi kết nối thời tiết");
    }
  };

  // 3. Routing via OSRM with Alternatives
  const getRoute = async (start: [number, number], end: [number, number]) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${start[0]},${start[1]};${end[0]},${end[1]}?overview=full&geometries=geojson&alternatives=true`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        setRoutes(data.routes);
        setActiveRouteIndex(0);
        drawMultipleRoutes(data.routes, 0);
      } else {
        setRoutes([]);
      }
    } catch (error) {
      console.error("OSRM Route Error:", error);
    }
  };

  const drawMultipleRoutes = (allRoutes: any[], activeIdx: number) => {
    const mapInstance = mapRef.current;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    // Clean up old route markers
    routeMarkersRef.current.forEach((marker) => marker.remove());
    routeMarkersRef.current = [];

    const maxRoutes = Math.min(allRoutes.length, 3);

    for (let i = 0; i < 3; i++) {
      const sourceId = `route-${i}`;
      const layerId = `route-layer-${i}`;

      if (mapInstance.getLayer(layerId)) mapInstance.removeLayer(layerId);
      if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId);

      if (i < maxRoutes) {
        const route = allRoutes[i];
        const isActive = i === activeIdx;

        mapInstance.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        });

        mapInstance.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": isActive ? "#2563eb" : "#94a3b8",
            "line-width": isActive ? 8 : 5,
            "line-opacity": isActive ? 0.9 : 0.55,
          },
        });

        // Add duration & distance badge on the map at the midpoint of coordinates
        const coords = route.geometry.coordinates;
        if (coords && coords.length > 0) {
          const midIndex = Math.floor(coords.length / 2);
          const midCoord = coords[midIndex];

          const durationMin = Math.round(route.duration / 60);
          const distanceKm = (route.distance / 1000).toFixed(1);

          const el = document.createElement("div");
          el.className = `route-badge-container ${isActive ? "active" : "inactive"}`;
          el.innerHTML = `
            <div>${durationMin} p</div>
            <div style="font-size: 8px; opacity: 0.8; font-weight: normal;">${distanceKm} km</div>
          `;

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setActiveRouteIndex(i);
            drawMultipleRoutes(allRoutes, i);
          });

          const routeMarker = new maplibregl.Marker({
            element: el,
            anchor: "center",
          })
            .setLngLat(midCoord as [number, number])
            .addTo(mapInstance);

          routeMarkersRef.current.push(routeMarker);
        }
      }
    }
  };

  // 4. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Find default map center
    let centerCoords: [number, number] = [107.088435, 10.33468]; // default Vung Tau coordinates
    const validStations = stations.filter((s) => s.latitude && s.longitude);
    if (validStations.length > 0) {
      centerCoords = [validStations[0].longitude!, validStations[0].latitude!];
    }

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyleUrl,
      center: centerCoords,
      zoom: 15,
      pitch: 65,
      bearing: 0,
    });

    mapInstance.on("styleimagemissing", (e) => {
      const transparentPixel = new Uint8Array([0, 0, 0, 0]);
      mapInstance.addImage(e.id, { width: 1, height: 1, data: transparentPixel });
    });

    const isMobile = window.innerWidth <= 768;
    mapInstance.addControl(
      new maplibregl.NavigationControl(),
      isMobile ? "top-left" : "top-right"
    );

    // Cancel tracking on manual interactions
    mapInstance.on("dragstart", () => setIsTracking(false));
    mapInstance.on("zoomstart", () => setIsTracking(false));

    mapInstance.on("style.load", () => {
      if (routes && routes.length > 0) {
        drawMultipleRoutes(routes, activeRouteIndex);
      }
    });

    setMap(mapInstance);
    mapRef.current = mapInstance;

    return () => {
      mapInstance.remove();
      setMap(null);
      mapRef.current = null;
      routeMarkersRef.current.forEach((marker) => marker.remove());
      routeMarkersRef.current = [];
    };
  }, []);

  // Update style on change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(mapStyleUrl);
    }
  }, [mapStyleUrl]);

  // 5. Watch user location with automatic simulation fallback
  useEffect(() => {
    let watchId: number;
    let fallbackTimeout: number;

    const useMockLocation = () => {
      let mockCoords: [number, number] = [107.086435, 10.330680];
      const validStation = stations.find((s) => s.latitude && s.longitude);
      if (validStation) {
        mockCoords = [validStation.longitude! - 0.002, validStation.latitude! - 0.003];
      }

      setCurrentCarCoords(mockCoords);
      setGpsStatus("OFFLINE");
      setGpsInfo("Mô phỏng vị trí (GPS bị chặn hoặc không khả dụng)");
      fetchWeather(mockCoords[1], mockCoords[0]);

      const mapInstance = mapRef.current;
      if (mapInstance) {
        if (!userMarkerRef.current) {
          const el = document.createElement("div");
          el.className = "user-location-container";
          el.innerHTML = `
            <div class="user-car-arrow">
              <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="14" fill="#2563eb" fill-opacity="0.15"/>
                <circle cx="16" cy="16" r="9" fill="white"/>
                <path d="M16 5L24 23L16 18.5L8 23L16 5Z" fill="#2563eb" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="user-pulse-ring"></div>
          `;

          const marker = new maplibregl.Marker({
            element: el,
            anchor: "center",
            rotationAlignment: "map",
            pitchAlignment: "map",
          })
            .setLngLat(mockCoords)
            .addTo(mapInstance);

          userMarkerRef.current = marker;
        } else {
          userMarkerRef.current.setLngLat(mockCoords);
        }

        if (isTracking) {
          const targetBottomPadding = window.innerWidth <= 768 ? window.innerHeight * 0.3 : window.innerHeight * 0.15;
          mapInstance.easeTo({
            center: mockCoords,
            pitch: 65,
            zoom: 16.5,
            padding: { top: 0, bottom: targetBottomPadding, left: 0, right: 0 },
            duration: 950,
          });
        }
      }
    };

    const setupTracking = () => {
      // If GPS doesn't respond in 3 seconds, trigger mock location fallback
      fallbackTimeout = window.setTimeout(() => {
        if (!currentCarCoords) {
          useMockLocation();
        }
      }, 3000);

      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            window.clearTimeout(fallbackTimeout);

            const lng = position.coords.longitude;
            const lat = position.coords.latitude;
            let heading = position.coords.heading;

            const nextCarCoords: [number, number] = [lng, lat];
            setCurrentCarCoords((prev) => {
              if ((heading === null || heading === undefined || heading === 0) && prev) {
                heading = calculateBearing(prev[1], prev[0], lat, lng);
              }
              return nextCarCoords;
            });

            setGpsStatus("LIVE");
            setGpsInfo(
              `Tọa độ: ${lng.toFixed(5)}, ${lat.toFixed(5)} | Vận tốc: ${
                position.coords.speed ? (position.coords.speed * 3.6).toFixed(0) : 0
              } km/h`
            );

            fetchWeather(lat, lng);

            const mapInstance = mapRef.current;
            if (mapInstance) {
              if (!userMarkerRef.current) {
                const el = document.createElement("div");
                el.className = "user-location-container";
                el.innerHTML = `
                  <div class="user-car-arrow">
                    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="14" fill="#2563eb" fill-opacity="0.15"/>
                      <circle cx="16" cy="16" r="9" fill="white"/>
                      <path d="M16 5L24 23L16 18.5L8 23L16 5Z" fill="#2563eb" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="user-pulse-ring"></div>
                `;

                const marker = new maplibregl.Marker({
                  element: el,
                  anchor: "center",
                  rotationAlignment: "map",
                  pitchAlignment: "map",
                })
                  .setLngLat(nextCarCoords)
                  .addTo(mapInstance);

                userMarkerRef.current = marker;
              } else {
                userMarkerRef.current.setLngLat(nextCarCoords);
              }

              if (heading !== null && heading !== undefined) {
                userMarkerRef.current.setRotation(heading);
              }

              if (isTracking) {
                const targetBottomPadding = window.innerWidth <= 768 ? window.innerHeight * 0.3 : window.innerHeight * 0.15;
                mapInstance.easeTo({
                  center: nextCarCoords,
                  bearing: heading || 0,
                  pitch: 65,
                  zoom: 16.5,
                  padding: { top: 0, bottom: targetBottomPadding, left: 0, right: 0 },
                  duration: 950,
                  easing: (t) => t,
                });
              }
            }
          },
          (error) => {
            window.clearTimeout(fallbackTimeout);
            if (!currentCarCoords) {
              useMockLocation();
            } else {
              setGpsStatus("OFFLINE");
              setGpsInfo(`Lỗi GPS: ${error.message}`);
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000,
          }
        );
      } else {
        useMockLocation();
      }
    };

    setupTracking();

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (fallbackTimeout) {
        window.clearTimeout(fallbackTimeout);
      }
    };
  }, [isTracking, stations]);

  // 6. Draw route when user or station coords change
  useEffect(() => {
    if (currentCarCoords && targetStationCoords) {
      getRoute(currentCarCoords, targetStationCoords);
    }
  }, [currentCarCoords, targetStationCoords]);

  // Set default target station coordinates when stations are loaded
  useEffect(() => {
    if (!targetStationCoords && stations.length > 0) {
      const validStation = stations.find((s) => s.latitude && s.longitude);
      if (validStation) {
        setTargetStationCoords([validStation.longitude!, validStation.latitude!]);
      }
    }
  }, [stations, targetStationCoords]);

  // 7. Update station markers on the map
  useEffect(() => {
    if (!map) return;

    // Remove old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    stations.forEach((station) => {
      if (!station.latitude || !station.longitude) return;

      const el = document.createElement("div");
      el.className = "ev-station-marker";
      el.innerHTML = `
        <div class="ev-station-3d-wrapper">
          <div class="ev-station-3d-pulse-ring"></div>
          <div class="ev-station-3d-kiosk">
            <svg width="60" height="75" viewBox="0 0 60 75" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="30" cy="66" rx="18" ry="5" fill="rgba(15, 23, 42, 0.35)" />
              <path d="M30 12 L50 21 L30 30 L10 21 Z" fill="#475569" stroke="#64748b" stroke-width="0.5"/>
              <path d="M10 21 L30 30 L30 62 L10 53 Z" fill="#1e293b" />
              <path d="M30 30 L50 21 L50 53 L30 62 Z" fill="#0f172a" />
              <path d="M17 33 L22 33 L19 40 L23 40 L16 49 L18 43 L15 43 Z" fill="#fbbf24" style="filter: drop-shadow(0 0 3px #fbbf24);"/>
              <path d="M33 31 L39 28 L39 34.5 L33 37.5 Z" fill="#111827" />
              <path d="M34 32 L38 30 L38 33.5 L34 35.5 Z" fill="${
                station.status === "ACTIVE" ? "#10b981" : "#ef4444"
              }" class="neon-flash-slow" />
              <path d="M41 27 L47 24 L47 30.5 L41 33.5 Z" fill="#111827" />
              <path d="M42 28 L46 26 L46 29.5 L42 31.5 Z" fill="#10b981" class="neon-flash-fast" />
              <path d="M33 39.5 L39 36.5 L39 43 L33 46 Z" fill="#111827" />
              <path d="M34 40.5 L38 38.5 L38 42 L34 44 Z" fill="#10b981" class="neon-flash-fast" />
              <path d="M41 35.5 L47 32.5 L47 39 L41 42 Z" fill="#111827" />
              <path d="M42 36.5 L46 34.5 L46 38 L42 40 Z" fill="#06b6d4" class="neon-flash-slow" />
              <path d="M33 48 L39 45 L39 51.5 L33 54.5 Z" fill="#111827" />
              <path d="M34 49 L38 47 L38 50.5 L34 52.5 Z" fill="#10b981" class="neon-flash-slow" />
              <path d="M41 44 L47 41 L47 47.5 L41 50.5 Z" fill="#111827" />
              <path d="M42 45 L46 43 L46 46.5 L42 48.5 Z" fill="#10b981" class="neon-flash-slow" />
              <path d="M30 29.5 L50 20.5 L50 22 L30 31 Z" fill="#10b981" style="filter: drop-shadow(0 0 4px #10b981);" class="neon-flash-fast"/>
            </svg>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([station.longitude!, station.latitude!])
        .setPopup(
          new maplibregl.Popup({ offset: 36 }).setHTML(`
            <div class="p-1">
              <h4 class="font-bold text-sm text-gray-900 dark:text-white">${station.name}</h4>
              <p class="text-xs text-gray-500 mt-1">${station.address}</p>
              <div class="mt-2 flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 rounded-full ${
                  station.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                }"></span>
                <span class="text-xs font-semibold">${
                  station.status === "ACTIVE"
                    ? "Hoạt động"
                    : station.status === "INACTIVE"
                    ? "Ngừng hoạt động"
                    : "Bảo trì"
                }</span>
              </div>
            </div>
          `)
        )
        .addTo(map);

      // On marker click, establish target for OSRM routing
      el.addEventListener("click", () => {
        setTargetStationCoords([station.longitude!, station.latitude!]);
      });

      markersRef.current[station.id] = marker;
    });
  }, [map, stations]);

  // 8. Fly/Focus camera to specific station when triggered
  useEffect(() => {
    if (!map || !focusStationId) return;

    const targetStation = stations.find((s) => s.id === focusStationId);
    if (targetStation && targetStation.latitude && targetStation.longitude) {
      setTargetStationCoords([targetStation.longitude, targetStation.latitude]);
      
      const bottomPadding = window.innerWidth <= 768 ? window.innerHeight * 0.3 : window.innerHeight * 0.15;

      setTimeout(() => {
        map.flyTo({
          center: [targetStation.longitude!, targetStation.latitude!],
          zoom: 16.5,
          pitch: 65,
          padding: { top: 0, bottom: bottomPadding, left: 0, right: 0 },
          duration: 1200,
          essential: true,
        });

        // Show popup
        const marker = markersRef.current[focusStationId];
        if (marker) {
          marker.togglePopup();
        }
      }, 350);
    }

    if (onClearFocus) {
      onClearFocus();
    }
  }, [map, focusStationId, stations]);

  const handleRecenter = () => {
    const mapInstance = mapRef.current;
    if (currentCarCoords && mapInstance) {
      setIsTracking(true);
      
      // Lấy tâm bản đồ hiện tại (khhu vực người dùng đang xem) để làm điểm đến
      const center = mapInstance.getCenter();
      setTargetStationCoords([center.lng, center.lat]);

      const bottomPadding = window.innerWidth <= 768 ? window.innerHeight * 0.3 : window.innerHeight * 0.15;
      mapInstance.flyTo({
        center: currentCarCoords,
        zoom: 16.5,
        pitch: 65,
        padding: { top: 0, bottom: bottomPadding, left: 0, right: 0 },
        duration: 1000,
        essential: true,
      });
    } else {
      alert("Chưa nhận được tín hiệu định vị GPS từ trình duyệt!");
    }
  };

  // 9. Geocode and focus/route to filterArea when it changes
  useEffect(() => {
    if (!map || !filterArea || filterArea.trim() === "") return;

    const geocodeArea = async () => {
      try {
        const query = encodeURIComponent(filterArea);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          {
            headers: {
              "User-Agent": "ChargeXAdmin/1.0"
            }
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);

            // Set this coordinate as the target destination
            setTargetStationCoords([lng, lat]);

            // Fly camera to center on the searched area
            const bottomPadding = window.innerWidth <= 768 ? window.innerHeight * 0.3 : window.innerHeight * 0.15;
            map.flyTo({
              center: [lng, lat],
              zoom: 15.5,
              pitch: 65,
              padding: { top: 0, bottom: bottomPadding, left: 0, right: 0 },
              duration: 1200,
              essential: true,
            });
          }
        }
      } catch (err) {
        console.error("Lỗi khi định vị khu vực hành chính:", err);
      }
    };

    geocodeArea();
  }, [map, filterArea]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: mapStyles }} />
      <div className="map-container-wrapper">
        {/* Float Status Panel */}
        <div className="map-status-panel">
          <div className="panel-header">
            <h3 className="panel-title">📍 Giám sát GPS 3D</h3>
            <div className={`status-badge ${gpsStatus === "LIVE" ? "active" : ""}`}>
              <span className="status-dot"></span>
              <span>{gpsStatus === "LIVE" ? "LIVE GPS" : "OFFLINE"}</span>
            </div>
          </div>

          <div className="mobile-full-width">
            <div className="info-card">{gpsInfo}</div>
          </div>

          {routes.length > 0 && (
            <div className="panel-section mobile-full-width" style={{ borderTop: "none" }}>
              <label>Lựa chọn tuyến đường</label>
              <div className="space-y-2 mt-1 max-h-48 overflow-y-auto">
                {routes.map((route, idx) => {
                  const isActive = idx === activeRouteIndex;
                  const durationMin = Math.round(route.duration / 60);
                  const distanceKm = (route.distance / 1000).toFixed(1);
                  const summary = route.legs?.[0]?.summary || `Tuyến đường ${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveRouteIndex(idx);
                        drawMultipleRoutes(routes, idx);
                      }}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none ${
                        isActive
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-medium shadow-sm"
                          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-xs">
                        <span className="truncate max-w-[140px]">qua {summary}</span>
                        <span className={isActive ? "text-blue-600 dark:text-blue-400" : ""}>
                          {durationMin} p
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex justify-between items-center">
                        <span>Khoảng cách: {distanceKm} km</span>
                        {idx === 0 && (
                          <span className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-950/40 px-1.5 py-0.5 rounded text-[8px]">
                            Nhanh nhất
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="panel-container-mobile">
            {/* Control 1: Recenter */}
            <div className="panel-section">
              <label>Chế độ lái xe</label>
              <button
                type="button"
                onClick={handleRecenter}
                className="action-btn"
                style={{ backgroundColor: isTracking && gpsStatus === "LIVE" ? "#10b981" : "#2563eb" }}
              >
                {isTracking && gpsStatus === "LIVE" ? "🔒 Đang bám đuôi" : "🎯 Bật bám đuôi"}
              </button>
            </div>

            {/* Control 2: Weather */}
            <div className="panel-section">
              <label>Thời tiết hiện tại</label>
              <div className="info-card" style={{ marginBottom: 0, minHeight: "40px", padding: "10px" }}>
                {weatherText}
              </div>
            </div>

            {/* Control 3: Map style */}
            <div className="panel-section mobile-full-width" style={{ marginTop: "12px" }}>
              <label htmlFor="style-selector">Bản đồ nền</label>
              <select
                id="style-selector"
                value={mapStyleUrl}
                onChange={(e) => setMapStyleUrl(e.target.value)}
                className="style-select"
              >
                <option value="https://tiles.openfreemap.org/styles/liberty">Liberty (Giao thông)</option>
                <option value="https://tiles.openfreemap.org/styles/bright">Bright (Sáng)</option>
                <option value="https://tiles.openfreemap.org/styles/positron">Positron (Tối giản)</option>
                <option value="https://tiles.openfreemap.org/styles/dark">Dark Matter (Tối)</option>
              </select>
            </div>
          </div>
        </div>

        {/* MapLibre DOM Node */}
        <div id="map-libre" ref={mapContainerRef} />
      </div>
    </>
  );
}
