import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issues in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const womenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const helperIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to auto-recenter map when coordinates change
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
};

const LiveLocationMap = ({ womanLocation, helperLocation, womanName = 'User', helperName = 'Helper' }) => {
  const mapCenter = womanLocation && womanLocation.lat ? [womanLocation.lat, womanLocation.lng] : [20.5937, 78.9629]; // Default India

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: 'var(--border-radius)', overflow: 'hidden' }}>
      <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={mapCenter} />
        
        {womanLocation && womanLocation.lat && (
          <Marker position={[womanLocation.lat, womanLocation.lng]} icon={womenIcon}>
            <Popup>
              <strong>{womanName} (Women)</strong><br />
              Live Location
            </Popup>
          </Marker>
        )}

        {helperLocation && helperLocation.lat && (
          <Marker position={[helperLocation.lat, helperLocation.lng]} icon={helperIcon}>
            <Popup>
              <strong>{helperName} (Assigned Responder)</strong><br />
              Live Location
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveLocationMap;
