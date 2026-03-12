import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Plus, Minus, Maximize2, Minimize2, LocateFixed } from "lucide-react";

const mapStyles = `
  .price-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
    cursor: pointer;
    position: relative;
    white-space: nowrap;
    
    /* Default Dot Style */
    width: 12px;
    height: 12px;
    background: #3b82f6;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    font-size: 0;
    padding: 0;
    transform: translate(-50%, -50%);
    color: transparent;
  }

  .price-marker:after {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid transparent;
    transition: border-top-color 0.2s;
    display: none;
  }

  /* Price Bubble Style (Expanded) */
  .price-marker.expanded {
    width: max-content;
    height: auto;
    padding: 7px 14px;
    background: white;
    border: 1px solid rgba(0,0,0,0.15);
    border-radius: 28px;
    font-size: 14px;
    font-weight: 800;
    color: #222;
    transform: translate(-50%, -100%);
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
  }
  .price-marker.expanded:after {
    display: block;
    border-top-color: white;
  }

  /* Active / Hover Style */
  .price-marker.active {
    width: max-content;
    height: auto;
    padding: 8px 16px;
    background: #222 !important;
    color: white !important;
    font-size: 14px;
    font-weight: 900;
    border-radius: 30px;
    transform: translate(-50%, -100%) scale(1.1) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    z-index: 999 !important;
    border: 1px solid #222;
  }
  .price-marker.active:after {
    display: block;
    border-top-color: #222 !important;
  }

  .airbnb-popup .leaflet-popup-content-wrapper {
    padding: 0;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 12px 28px rgba(0,0,0,0.15);
  }
  .airbnb-popup .leaflet-popup-content { margin: 0; min-width: 280px; }
  .airbnb-popup .leaflet-popup-tip-container { display: none; }
`;

export default function ServiceMap({ services, hoveredId, onHover, onMapBoundsChange, isFiltered, isFullscreen, onToggleFullscreen }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef({});
  const [showSearchBtn, setShowSearchBtn] = useState(false);
  const [zoom, setZoom] = useState(12);

  const formatPrice = (price, currency) => {
    const val = price >= 1000000 ? `${(price / 1000000).toFixed(1)}M` : `${(price / 1000).toFixed(0)}K`;
    return `${currency || "LAK"} ${val}`;
  };

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleFitAll = () => {
    const map = mapRef.current;
    if (!map) return;
    const validItems = (services || [])
      .map((item) => item.svc ? item.svc : item) // Normalize to service object
      .filter((s) => s.latitude && s.longitude);
    if (validItems.length > 0) {
      const bounds = L.latLngBounds(validItems.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
    }
  };

  // One-time style injection
  useEffect(() => {
    if (!document.getElementById("phajay-map-styles")) {
      const styleSheet = document.createElement("style");
      styleSheet.id = "phajay-map-styles";
      styleSheet.innerText = mapStyles;
      document.head.appendChild(styleSheet);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [17.9757, 102.6331],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '©OpenStreetMap',
    }).addTo(map);

    map.on("moveend", () => {
      setShowSearchBtn(true);
      if (onMapBoundsChange) onMapBoundsChange(map.getBounds());
    });

    map.on("zoomend", () => {
      setZoom(map.getZoom());
    });

    mapRef.current = map;

    // Resize Observer for smooth invalidation during transitions
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize({ animate: false });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Invalidate on fullscreen change
  useEffect(() => {
    setTimeout(() => mapRef.current?.invalidateSize({ animate: true }), 300);
  }, [isFullscreen]);

  // Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.marker.remove());
    markersRef.current = {};

    if (!Array.isArray(services)) return;

    // Normalize services for backward compatibility
    const normalizedItems = services.map((item) => item.svc ? item : { svc: item, key: item._id });
    const validItems = normalizedItems.filter((item) => item.svc?.latitude && item.svc?.longitude);

    // Group items by coordinate to add jitter for overlaps
    const coordCounts = {};

    validItems.forEach((item) => {
      const { svc, res } = item;
      const coordKey = `${svc.latitude},${svc.longitude}`;
      coordCounts[coordKey] = (coordCounts[coordKey] || 0) + 1;
      
      // Use a more distinct offset for overlapping coordinates
      const angle = (coordCounts[coordKey] - 1) * (Math.PI / 4); // 45 degree increments
      const radius = (coordCounts[coordKey] - 1) * 0.0002;
      const lat = parseFloat(svc.latitude) + radius * Math.cos(angle);
      const lng = parseFloat(svc.longitude) + radius * Math.sin(angle);

      const price = res?.price_override ?? svc.price;
      const label = formatPrice(price, svc.currency);
      
      const isExpanded = zoom >= 14 || (isFiltered && services.length <= 50);
      const isActive = hoveredId === item.key;
      
      const icon = L.divIcon({
        className: "custom-div-icon",
        html: `<div id="marker-${item.key}" class="price-marker ${isActive ? 'active' : (isExpanded ? 'expanded' : '')}">${label}</div>`,
        iconSize: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Airbnb Style Popup Content
      const displayName = res ? res.name : svc.name;
      const displayPrice = res?.price_override ?? svc.price;
      const imgUrl = (res?.image || svc.image) ? ((res?.image || svc.image).startsWith('http') ? (res?.image || svc.image) : `http://localhost:3000${res?.image || svc.image}`) : null;
      
      const linkUrl = svc.booking_type === "date_range" && res
        ? `/room/${res._id}?serviceId=${svc._id}`
        : `/business/${svc.business_id?._id || svc.business_id}?serviceId=${svc._id}${res ? `&resourceId=${res._id}` : ''}`;

      const popupHtml = `
        <div style="background: white; position: relative; font-family: inherit;">
          <div style="position: relative; aspect-ratio: 1.5; background: #f0ede8; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            ${imgUrl ? `<img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;" />` : `<span style="color: #c5bfb3; font-size: 14px; font-weight: 600;">${svc.category}</span>`}
            <div id="close-popup-${item.key}" style="position: absolute; top: 12px; right: 12px; background: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; z-index: 10;">
              <svg viewBox="0 0 32 32" style="height: 12px; width: 12px; stroke: currentColor; stroke-width: 4; fill: none;"><path d="m6 6 20 20M26 6 6 26"></path></svg>
            </div>
          </div>
          <a href="${linkUrl}" style="text-decoration: none; color: inherit; display: block; padding: 16px;">
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: #1a1a1a;">${displayName}</div>
            <div style="font-size: 13px; color: #717171; margin-bottom: 8px;">${svc.location || svc.district || 'Laos'}</div>
            <div style="font-size: 15px; font-weight: 800; color: #1a1a1a;">${displayPrice.toLocaleString()} ${svc.currency} <span style="font-weight: 400; color: #717171;">/ ${svc.booking_type === "date_range" ? "night" : "session"}</span></div>
            ${svc.rating ? `<div style="font-size: 12px; color: #717171; margin-top: 6px;">★ ${svc.rating} · ${svc.reviews} reviews</div>` : ''}
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'airbnb-popup',
        offset: [0, -20],
        closeButton: false,
        closeOnClick: false,
      });

      marker.on("popupopen", () => {
        const closeBtn = document.getElementById(`close-popup-${item.key}`);
        if (closeBtn) closeBtn.onclick = (e) => { e.stopPropagation(); marker.closePopup(); };
      });

      marker.on("mouseover", () => onHover?.(item.key));
      marker.on("mouseout", () => onHover?.(null));
      
      markersRef.current[item.key] = { marker, svcId: svc._id };
    });

    if (validItems.length > 0) {
      const bounds = L.latLngBounds(validItems.map(item => [item.svc.latitude, item.svc.longitude]));
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 15 });
    }

    const timer = setTimeout(() => map.invalidateSize(), 400);
    return () => clearTimeout(timer);
  }, [services]); // ONLY fit bounds when services list changes

  // Handle Hover and Zoom state without re-creating all markers
  useEffect(() => {
    Object.keys(markersRef.current).forEach(key => {
      const { marker } = markersRef.current[key];
      const el = document.getElementById(`marker-${key}`);
      const active = (key === hoveredId);
      const isExpanded = zoom >= 14 || (isFiltered && services.length <= 50);
      
      if (active) {
        el?.classList.add('active');
        el?.classList.remove('expanded');
        marker.setZIndexOffset(1000);
      } else if (isExpanded) {
        el?.classList.add('expanded');
        el?.classList.remove('active');
        marker.setZIndexOffset(0);
      } else {
        el?.classList.remove('active');
        el?.classList.remove('expanded');
        marker.setZIndexOffset(0);
      }
    });
  }, [hoveredId, zoom, isFiltered, services]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={containerRef} className="w-full h-full relative" />

      {/* Search this area */}
      {/* {showSearchBtn && (
        <button
          onClick={() => setShowSearchBtn(false)}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200"
        >
          <Search className="w-4 h-4 text-[#222]" />
          <span className="font-semibold text-sm text-[#222]">Search this area</span>
        </button>
      )} */}

      {/* Map Controls - Right Side */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
        {/* Fullscreen toggle */}
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="bg-white border border-gray-200 rounded-xl w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:bg-gray-50 active:scale-95"
            title={isFullscreen ? "Exit fullscreen" : "Expand map"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-[#222]" />
            ) : (
              <Maximize2 className="w-4 h-4 text-[#222]" />
            )}
          </button>
        )}

        {/* Zoom controls */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden flex flex-col">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95 border-b border-gray-100"
            title="Zoom in"
          >
            <Plus className="w-4 h-4 text-[#222]" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors active:scale-95"
            title="Zoom out"
          >
            <Minus className="w-4 h-4 text-[#222]" />
          </button>
        </div>

        {/* Fit all markers */}
        <button
          onClick={handleFitAll}
          className="bg-white border border-gray-200 rounded-xl w-10 h-10 flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:bg-gray-50 active:scale-95"
          title="Fit all markers"
        >
          <LocateFixed className="w-4 h-4 text-[#222]" />
        </button>
      </div>

      {/* Zoom level indicator */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-2.5 py-1 shadow-sm">
        <span className="text-xs font-semibold text-[#717171]">Zoom {zoom}</span>
      </div>
    </div>
  );
}
