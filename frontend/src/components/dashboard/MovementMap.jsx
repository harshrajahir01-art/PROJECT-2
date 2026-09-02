import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { StatusBadge, RiskBadge } from '../common/Badge';

// Fix Leaflet's default marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored pin icons
const createCustomIcon = (color = '#3B82F6', isFlagged = false) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background-color: ${isFlagged ? '#EF4444' : color};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid #FFFFFF;
        box-shadow: 0 0 ${isFlagged ? '12px #EF4444' : '8px rgba(0,0,0,0.5)'};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 10px;
        font-weight: bold;
      ">
        ${isFlagged ? '!' : '●'}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

// Component to dynamically fit map bounds to observation points
function MapBoundsUpdater({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const validPoints = points.filter(p => p.latitude && p.longitude);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map(p => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    }
  }, [points, map]);
  return null;
}

export const MovementMap = ({ points = [], selectedPlate = null, height = "450px" }) => {
  // Filter valid coordinates
  const validPoints = points.filter(p => p.latitude && p.longitude);

  // Default center (Gujarat / India coordinates)
  const defaultCenter = validPoints.length > 0 
    ? [validPoints[0].latitude, validPoints[0].longitude]
    : [23.0225, 72.5714];

  // Polyline path coordinates
  const polylineCoords = validPoints.map(p => [p.latitude, p.longitude]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950">
      {/* Map Viewport */}
      <div style={{ height }}>
        <MapContainer
          center={defaultCenter}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          {/* CartoDB Dark Matter Tiles */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> &copy; OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          <MapBoundsUpdater points={validPoints} />

          {/* Polyline connecting chronological observations */}
          {polylineCoords.length > 1 && (
            <Polyline
              positions={polylineCoords}
              color="#3B82F6"
              weight={3}
              opacity={0.8}
              dashArray="6, 6"
            />
          )}

          {/* Markers */}
          {validPoints.map((point, index) => {
            const isFlagged = point.vehicle_status === 'STOLEN' || 
              point.risk_level === 'HIGH' || 
              point.risk_level === 'CRITICAL';

            return (
              <Marker
                key={point.id || index}
                position={[point.latitude, point.longitude]}
                icon={createCustomIcon(isFlagged ? '#EF4444' : '#10B981', isFlagged)}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="font-mono font-bold text-sm text-blue-400">
                        {point.registration_number || selectedPlate || 'Observation'}
                      </span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-gray-300">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="text-xs text-gray-200">
                      <div className="font-semibold">{point.location_name || 'Checkpoint'}</div>
                      <div className="text-[11px] text-gray-400">
                        {point.timestamp ? new Date(point.timestamp).toLocaleString() : (point.detected_at ? new Date(point.detected_at).toLocaleString() : 'Recent')}
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 font-mono">
                      Device: {point.source_device_id || 'Camera_Node'}
                    </div>

                    {point.vehicle_status && (
                      <div className="pt-1 flex items-center space-x-1">
                        <StatusBadge status={point.vehicle_status} />
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Observation Disclaimer Bar */}
      <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-[11px] text-gray-400 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span><strong>Observation Timeline:</strong> Connected sequential sightings from authorized checkpoints. (Observation events, not live GPS tracking).</span>
        </span>
        <span className="font-mono text-gray-300">{validPoints.length} Sighting{validPoints.length === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
};
