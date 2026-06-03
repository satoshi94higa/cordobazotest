import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { NiloPoint } from '@/src/data';
import { useEffect, useState } from 'react';
import { PhotoSlider } from './PhotoSlider';
import { X } from 'lucide-react';

// Crucial fix for older Android TV WebViews: 
// Force Leaflet to use standard 2D translation (translate) instead of CSS 3D translate3d, 
// which is buggy or completely unaccelerated on low-end TV chips and custom Android Kiosk wrappers.
if (typeof window !== 'undefined' && L.Browser) {
  (L.Browser as any).any3d = false;
}

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
  selectedPoint?: NiloPoint | null;
  selectedPointId?: string | null;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1 });
  }, [center, zoom, map]);
  return null;
}

function MapEvents({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  
  // Trigger a container resize recalculation on mount to guarantee Leaflet detects the correct parent size
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 500);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

export function LeafletMap({ 
  points, 
  onSelectPoint, 
  selectedPoint,
  selectedPointId,
  onNext,
  onPrev,
  hasNext,
  hasPrev
 }: MapProps) {
  const cordobaCenter: [number, number] = [-31.4167, -64.186];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Límites aproximados de la Ciudad de Córdoba para restringir el movimiento
  const cordobaBounds: L.LatLngBoundsExpression = [
    [-31.55, -64.35], // Suroeste - Ampliado un poco
    [-31.30, -64.05], // Noreste
  ];

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <MapContainer 
        center={cordobaCenter} 
        zoom={14} 
        minZoom={12} 
        maxZoom={18}
        maxBounds={cordobaBounds}
        maxBoundsViscosity={1.0}
        style={{ 
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%', 
          width: '100%',
          backgroundColor: '#FBEFE4' // Warm paper-like background matching the editorial theme, instead of generic gray blocks
        }}
        zoomControl={false}
        scrollWheelZoom={true}
        preferCanvas={true} // Forces Leaflet to render in a high-performance Canvas, significantly more reliable in older WebViews than SVGs
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

        {/* Georeferenced Editorial Balloon Popup */}
<<<<<<< HEAD
        {selectedPoint && !isMobile && (
=======
        {selectedPoint && (
>>>>>>> 6aa8c7ab8c99be5a1936f4062eb5f7e2ed304cab
          <Popup 
            position={[selectedPoint.lat, selectedPoint.lng]}
            closeButton={false}
            autoPan={true}
            autoPanPadding={[50, 50]}
            className="editorial-popup"
            offset={[0, -20]}
            maxWidth={500}
          >
            <div className="bg-editorial-bg shadow-2xl rounded-2xl overflow-hidden border border-editorial-text/10 flex flex-col w-[380px] md:w-[480px]">
              <div className="p-2 border-b border-editorial-text/5 flex justify-between items-center bg-editorial-text text-white">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
                  <h3 className="text-[8px] font-bold uppercase tracking-widest truncate max-w-[180px]">{selectedPoint.title}</h3>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPoint(null);
                  }}
                  className="w-6 h-6 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="p-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <PhotoSlider 
                  historical={selectedPoint.historicalPhoto}
                  current={selectedPoint.currentPhoto}
                  title={selectedPoint.title}
                  description={selectedPoint.description}
                  lat={selectedPoint.lat}
                  lng={selectedPoint.lng}
                  onNext={onNext || (() => {})}
                  onPrev={onPrev || (() => {})}
                  hasNext={hasNext || false}
                  hasPrev={hasPrev || false}
                  className="shadow-lg rounded-lg overflow-hidden flex-1"
                  isPopup={true}
                />
              </div>
            </div>
          </Popup>
        )}

        {/* Recenter when a point is selected - offset to keep marker centered with popup space */}
        {selectedPointId && points.find(p => p.id === selectedPointId) && (
          <ChangeView 
            center={[
<<<<<<< HEAD
              points.find(p => p.id === selectedPointId)!.lat + (isMobile ? -0.0018 : 0.0007), 
=======
              points.find(p => p.id === selectedPointId)!.lat + 0.0007, 
>>>>>>> 6aa8c7ab8c99be5a1936f4062eb5f7e2ed304cab
              points.find(p => p.id === selectedPointId)!.lng
            ]} 
            zoom={17} 
          />
        )}
      </MapContainer>
    </div>
  );
}
