import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { NiloPoint } from '@/src/data';
import { useEffect } from 'react';

const createCustomIcon = (order: number, isSelected: boolean) => L.divIcon({
  className: 'custom-marker',
  html: `<div class="flex items-center justify-center relative">
           <div class="w-7 h-7 ${isSelected ? 'bg-editorial-text scale-110 shadow-2xl z-[1001]' : 'bg-brand-primary'} rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-300">
             <span class="text-[10px] font-bold text-white font-mono">${order}</span>
           </div>
           ${isSelected ? '<div class="absolute -inset-1 bg-brand-primary rounded-full animate-ping opacity-30"></div>' : ''}
         </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

interface MapProps {
  points: NiloPoint[];
  onSelectPoint: (point: NiloPoint | null) => void;
  selectedPointId?: string | null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1 });
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
          icon={createCustomIcon(point.order, selectedPointId === point.id)}
          eventHandlers={{
            click: () => onSelectPoint(point),
          }}
          zIndexOffset={selectedPointId === point.id ? 1000 : 0}
        >
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <div className="px-2 py-1 bg-white font-bold text-[10px] uppercase tracking-wider border border-brand-primary/20 shadow-sm">
              {point.title}
            </div>
          </Tooltip>
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
