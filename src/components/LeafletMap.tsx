import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { CordobazoPoint } from '@/src/data';
import { useEffect } from 'react';

const customIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div class="w-6 h-6 bg-brand-primary rounded-full border-2 border-white shadow-lg relative">
           <div class="absolute inset-0 bg-brand-primary rounded-full animate-ping opacity-20"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapProps {
  points: CordobazoPoint[];
  onSelectPoint: (point: CordobazoPoint | null) => void;
  selectedPointId?: string;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  return null;
}

export function LeafletMap({ points, onSelectPoint, selectedPointId }: MapProps) {
  const cordobaCenter: [number, number] = [-31.4167, -64.1833];

  // Límites aproximados de la Ciudad de Córdoba para restringir el movimiento
  const cordobaBounds: L.LatLngBoundsExpression = [
    [-31.52, -64.30], // Suroeste
    [-31.32, -64.05], // Noreste
  ];

  return (
    <MapContainer 
      center={cordobaCenter} 
      zoom={14} 
      minZoom={13} 
      maxZoom={18}
      maxBounds={cordobaBounds}
      maxBoundsViscosity={1.0}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      
      <MapEvents onMapClick={() => onSelectPoint(null)} />
      
      {points.map((point) => (
        <Marker 
          key={point.id} 
          position={[point.lat, point.lng]} 
          icon={customIcon}
          eventHandlers={{
            click: () => onSelectPoint(point),
          }}
        >
          {/* We use a subtle popup if needed, but the main info is in the side panel */}
        </Marker>
      ))}

      {/* Recenter when a point is selected */}
      {selectedPointId && points.find(p => p.id === selectedPointId) && (
        <ChangeView 
          center={[
            points.find(p => p.id === selectedPointId)!.lat, 
            points.find(p => p.id === selectedPointId)!.lng
          ]} 
          zoom={16} 
        />
      )}
    </MapContainer>
  );
}
